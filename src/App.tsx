import React, { useState, useCallback } from 'react';
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

export default function App() {
  const RPG = ResizablePanelGroup as any;
  const [showSplash, setShowSplash] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
  const [showActions, setShowActions] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>(undefined);

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

      <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
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
