import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  HelpCircle, 
  Search, 
  X,
  Sparkles,
  Zap,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingActionsProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onAction: (action: 'summarize' | 'explain' | 'explore' | 'layman') => void;
  onClose: () => void;
}

export function FloatingActions({ isVisible, position, onAction, onClose }: FloatingActionsProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed z-50 flex flex-col gap-1 p-1 bg-background border shadow-2xl rounded-xl min-w-[160px]"
        style={{ 
          left: position.x, 
          top: position.y - 10, 
          transform: 'translate(-50%, -100%)' 
        }}
      >
        <div className="flex items-center justify-between px-2 py-1 mb-1 border-b">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Actions</span>
          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start h-8 gap-2 text-xs hover:bg-primary/10 hover:text-primary"
          onClick={() => onAction('summarize')}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          Summarize
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start h-8 gap-2 text-xs hover:bg-primary/10 hover:text-primary"
          onClick={() => onAction('layman')}
        >
          <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
          Layman Explanation
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start h-8 gap-2 text-xs hover:bg-primary/10 hover:text-primary"
          onClick={() => onAction('explain')}
        >
          <Search className="h-3.5 w-3.5 text-green-500" />
          Explain Simply
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start h-8 gap-2 text-xs hover:bg-primary/10 hover:text-primary"
          onClick={() => onAction('explore')}
        >
          <BookOpen className="h-3.5 w-3.5 text-purple-500" />
          Explore More
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
