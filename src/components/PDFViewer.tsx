import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ZoomIn, ZoomOut, FileUp, ChevronUp, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PDF.js Worker — path must be resolved differently per environment:
//
//  Dev (Vite dev server): Chromium fetches it from http://localhost:PORT/
//  Packaged (file://):    Chromium's Web Worker loader bypasses Electron's
//    asar virtual FS, so a plain './pdf.worker.min.mjs' points INSIDE the
//    asar and can't be executed as a worker. We must give an absolute
//    file:// URL that points to the asarUnpack'd copy on real disk.
//
//  path: <resourcesPath>/app.asar.unpacked/dist/pdf.worker.min.mjs
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    electronEnv?: { resourcesPath: string; isPackaged: boolean };
  }
}

function resolveWorkerSrc(): string {
  const env = window.electronEnv;
  if (env?.isPackaged && env.resourcesPath) {
    // Absolute file:// URL to the unpacked worker on real disk
    return `file://${env.resourcesPath}/app.asar.unpacked/dist/pdf.worker.min.mjs`;
  }
  // Dev: Vite serves public/ at the root of the dev server
  return './pdf.worker.min.mjs';
}

pdfjs.GlobalWorkerOptions.workerSrc = resolveWorkerSrc();


interface PDFViewerProps {
  file: File | string | null;
  onTextSelect: (text: string, x: number, y: number) => void;
  onFileChange: (file: File) => void;
}

export function PDFViewer({ file, onTextSelect, onFileChange }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [jumpPage, setJumpPage] = useState("1");
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const [pdfData, setPdfData] = useState<string | ArrayBuffer | null>(null);

  useEffect(() => {
    setJumpPage(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPdfData(e.target.result as ArrayBuffer);
        }
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        import("sonner").then(({ toast }) => toast.error("Failed to read file"));
      };
      reader.readAsArrayBuffer(file);
    } else {
      setPdfData(file);
    }
  }, [file]);

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        onTextSelect(text, rect.left + rect.width / 2, rect.top);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(jumpPage);
    if (!isNaN(val) && val >= 1 && val <= (numPages || 1)) {
      setCurrentPage(val);
      // Logic for scrolling to page would go here, but keeping it simple for now
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-muted/30 overflow-hidden" 
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* Toolbar - Fixed at the top, outside ScrollArea */}
      <div className="flex-none flex items-center justify-between p-2 bg-background border-b z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/20 rounded border p-1 gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            
            <form onSubmit={handleJumpPage} className="flex items-center gap-1 text-xs font-medium">
              <span className="text-muted-foreground mr-1">Page</span>
              <Input 
                className="h-7 w-12 text-center text-xs p-0 px-1 border-none bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onBlur={() => setJumpPage(currentPage.toString())}
              />
              <span className="text-muted-foreground">of {numPages || '--'}</span>
            </form>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setCurrentPage(prev => Math.min(numPages || prev, prev + 1))}
              disabled={numPages ? currentPage >= numPages : true}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/20 border rounded p-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScale(s => Math.min(3, s + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 mx-1" />

          <label className="cursor-pointer" htmlFor="pdf-upload-toolbar">
            <input id="pdf-upload-toolbar" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}>
              <FileUp className="h-3.5 w-3.5 mr-2" />
              Open
            </span>
          </label>
        </div>
      </div>

      {/* Viewer Body - Scrollable */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-muted/10">
        <div className="relative inline-block" ref={containerRef}>
          {pdfData ? (
            <Document
              file={pdfData}
              onLoadSuccess={(pdf) => {
                console.log("Document loaded successfully with", pdf.numPages, "pages.");
                onDocumentLoadSuccess(pdf);
              }}
              onLoadError={(error) => {
                console.error("PDF load error:", error);
                import("sonner").then(({ toast }) => toast.error(`PDF Error: ${error.message}`));
              }}
              loading={
                <div className="flex flex-col items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p>Loading document...</p>
                </div>
              }
            >
              <Page 
                pageNumber={currentPage} 
                scale={scale} 
                className="shadow-2xl border-4 border-background bg-white"
                renderAnnotationLayer={true}
                renderTextLayer={true}
                onLoadSuccess={() => console.log("Page loaded successfully!")}
                onRenderSuccess={() => console.log("Page rendered successfully!")}
                onRenderError={(error) => {
                  console.error("Page render error:", error);
                  import("sonner").then(({ toast }) => toast.error(`Render Error: ${error.message}`));
                }}
                loading={
                  <div className="flex flex-col items-center p-12 bg-white w-[600px] h-[800px] justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Rendering page {currentPage}...</p>
                  </div>
                }
              />
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-xl m-8 bg-background/50">
              <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No PDF Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Upload a PDF to begin.
              </p>
              <label className="cursor-pointer" htmlFor="pdf-upload-main">
                <input id="pdf-upload-main" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                <span className={cn(buttonVariants({ variant: "default" }))}>
                  Select File
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
