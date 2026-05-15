import React, { useState, useCallback, useEffect } from 'react';
import { PDFViewer } from './components/PDFViewer';
import { AIChat } from './components/AIChat';
import { FloatingActions } from './components/FloatingActions';
import { SplashScreen } from './components/SplashScreen';
import { ThemeToggle } from './components/ThemeToggle';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Extend Window interface to recognize ipcRenderer
declare global {
  interface Window {
    ipcRenderer?: any;
  }
}

export default function App() {
  const RPG = ResizablePanelGroup as any;
  const [showSplash, setShowSplash] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | string | Uint8Array | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
  const [showActions, setShowActions] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  // Helper: Electron IPC serialises Node Buffer as {type:'Buffer', data:[…]}
  // We must convert it back to Uint8Array so react-pdf can parse it.
  const ipcBufferToUint8Array = (raw: any): Uint8Array | null => {
    if (!raw) return null;
    if (raw instanceof Uint8Array) return raw;
    // Plain object from IPC serialisation
    if (raw && raw.type === 'Buffer' && Array.isArray(raw.data)) {
      return new Uint8Array(raw.data);
    }
    // Fallback: try treating as array-like
    try { return new Uint8Array(Object.values(raw)); } catch { return null; }
  };

  useEffect(() => {
    if (!window.ipcRenderer) return;

    // 1. Ask for initial file if app was opened by double-clicking a PDF
    window.ipcRenderer.invoke('get-initial-file').then(async (filePath: string | null) => {
      if (!filePath) return;
      const raw = await window.ipcRenderer!.invoke('read-pdf-file', filePath);
      const bytes = ipcBufferToUint8Array(raw);
      if (bytes) {
        setPdfFile(bytes);
        toast.success(`Opened: ${filePath.split(/[/\\]/).pop()}`);
      } else {
        toast.error('Could not read PDF file.');
      }
    });

    // 2. Listen for 'open-pdf' IPC event (dock drop / open-with while running)
    const handleOpenPdf = async (_event: any, filePath: string) => {
      const raw = await window.ipcRenderer!.invoke('read-pdf-file', filePath);
      const bytes = ipcBufferToUint8Array(raw);
      if (bytes) {
        setPdfFile(bytes);
        toast.success(`Opened: ${filePath.split(/[/\\]/).pop()}`);
      } else {
        toast.error('Could not read PDF file.');
      }
    };

    window.ipcRenderer.on('open-pdf', handleOpenPdf);
    return () => { window.ipcRenderer!.off('open-pdf', handleOpenPdf); };
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
        handleFileChange(file);
      } else {
        toast.error("Please drop a valid PDF file.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleTextSelect = useCallback((text: string, x: number, y: number) => {
    setSelectedText(text);
    setSelectionPos({ x, y });
    setShowActions(true);
  }, []);

  const handleAction = useCallback((action: 'summarize' | 'explain' | 'explore' | 'layman') => {
    if (!selectedText) return;
    
    let prompt = "";
    switch (action) {
      case 'summarize':
        prompt = `Summarize this text: "${selectedText}"`;
        break;
      case 'explain':
        prompt = `Explain this text simply: "${selectedText}"`;
        break;
      case 'layman':
        prompt = `Explain this text in layman's terms (very simple language): "${selectedText}"`;
        break;
      case 'explore':
        prompt = `Tell me more about the topics in this text: "${selectedText}"`;
        break;
    }
    
    setInitialChatMessage("");
    setTimeout(() => {
      setInitialChatMessage(prompt);
    }, 0);
    
    setShowActions(false);
    toast.success(`AI prompt inserted for ${action}`);
  }, [selectedText]);

  const handleFileChange = (file: File) => {
    setPdfFile(file);
    toast.success(`Loaded: ${file.name}`);
  };

  return (
    <>
      {/* Splash screen — shown once per launch */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <div 
        className="h-screen w-screen overflow-hidden flex flex-col bg-background relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragging && (
          <div className="absolute inset-0 z-[200] bg-background/80 backdrop-blur-sm border-4 border-dashed border-primary m-4 rounded-xl flex items-center justify-center pointer-events-none">
            <h2 className="text-3xl font-bold text-primary">Drop PDF Here</h2>
          </div>
        )}

        {/* Custom title bar — draggable, replaces native macOS bar */}
        <div
          style={{
            height: 44,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 80,   // space for macOS traffic lights
            paddingRight: 12,
            borderBottom: '1px solid var(--border)',
            background: 'var(--background)',
            WebkitAppRegion: 'drag', // makes bar draggable in Electron
            userSelect: 'none',
            zIndex: 100,
          } as React.CSSProperties}
        >
          {/* App name */}
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--foreground)',
            letterSpacing: '-0.01em',
            flex: 1,
          }}>
            PDF Agent Assist
          </span>

          {/* Theme toggle — must opt out of drag region */}
          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <ThemeToggle />
          </div>
        </div>

        {/* Main content */}
        <RPG direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={30}>
            <PDFViewer 
              file={pdfFile} 
              onTextSelect={handleTextSelect} 
              onFileChange={handleFileChange}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={35} minSize={20}>
            <AIChat 
              selectedText={selectedText} 
              onClearSelection={() => {
                setSelectedText(null);
                setShowActions(false);
              }}
              initialMessage={initialChatMessage}
            />
          </ResizablePanel>
        </RPG>

        <FloatingActions 
          isVisible={showActions} 
          position={selectionPos} 
          onAction={handleAction}
          onClose={() => setShowActions(false)}
        />

        <Toaster position="top-center" />
      </div>
    </>
  );
}
