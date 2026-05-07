import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { OnboardingSlideshow } from './OnboardingSlideshow';
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Settings2,
  Sparkles,
  Zap,
  Info,
  X,
  HelpCircle,
  Key
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { MODELS, ChatMessage, generateResponse } from "@/src/lib/gemini";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIChatProps {
  selectedText: string | null;
  onClearSelection: () => void;
  initialMessage?: string;
}

export function AIChat({ selectedText, onClearSelection, initialMessage }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pastedText, setPastedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(MODELS.FLASH);
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage & determine if onboarding should show
  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_CUSTOM_API_KEY');
    if (savedKey) {
      setCustomApiKey(savedKey);
      setApiKeyInput(savedKey);
    }
    // Show onboarding whenever there is no API key stored.
    // Removing the key brings the onboarding back so the user is never stuck.
    if (!savedKey) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    const key = apiKeyInput.trim();
    if (key) {
      localStorage.setItem('GEMINI_CUSTOM_API_KEY', key);
      setCustomApiKey(key);
      // Auto-dismiss onboarding once key is saved
      setShowOnboarding(false);
      localStorage.setItem('ONBOARDING_DISMISSED', 'true');
    } else {
      localStorage.removeItem('GEMINI_CUSTOM_API_KEY');
      setCustomApiKey(null);
    }
    setIsSettingsOpen(false);
  };

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('ONBOARDING_DISMISSED', 'true');
  };

  const handleKeySavedFromOnboarding = (key: string) => {
    setCustomApiKey(key);
    setApiKeyInput(key);
    setShowOnboarding(false);
    localStorage.setItem('ONBOARDING_DISMISSED', 'true');
  };

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
      // Focus input after setting value
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (selectedText) {
      // Focus input whenever text is selected, so user can immediately type
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [selectedText]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() && !pastedText && !selectedText) return;
    if (isLoading) return;

    // Capture context before clearing
    const currentSelectedText = selectedText;
    const currentPastedText = pastedText;

    // Use current input if none provided
    const messageToSend = text || input;
    
    // Create combined user display text
    let displayPrompt = messageToSend;
    if (!messageToSend && (currentPastedText || currentSelectedText)) {
      displayPrompt = "Analyze this context...";
    }

    const userMessage: ChatMessage = { role: 'user', text: displayPrompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPastedText(null);
    onClearSelection();
    setIsLoading(true);

    try {
      // Construct prompt with context
      let finalPrompt = messageToSend || "Please analyze the following context.";
      
      const parts = [];
      if (currentSelectedText) parts.push(`Context from PDF: "${currentSelectedText}"`);
      if (currentPastedText) parts.push(`Pasted Context: "${currentPastedText}"`);
      
      if (parts.length > 0) {
        finalPrompt = `${parts.join('\n\n')}\n\nQuestion/Prompt: ${finalPrompt}`;
      }

      const response = await generateResponse(finalPrompt, model, messages, customApiKey);
      const aiMessage: ChatMessage = { role: 'model', text: response || "No response generated." };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response.";
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `Error: ${errorMessage}\n\nPlease check your API key in settings.` 
      }]);
    } finally {
      setIsLoading(false);
      // Focus input again after AI responds
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    // If user is pasting more than 150 chars, move it to context automatically
    if (text.length > 150) {
      e.preventDefault();
      setPastedText(text);
      // If input was empty, maybe focus for prompt?
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1")}>
              <Settings2 className="h-4 w-4" />
              <span className="text-xs">{model === MODELS.FLASH ? "Flash" : "Pro"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setModel(MODELS.FLASH)} className="gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Gemini 2.5 Flash (Fast)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModel(MODELS.PRO)} className="gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Gemini 3.1 Pro (Smart)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsSettingsOpen(true)} title="API Settings">
            <Key className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              API Settings
            </DialogTitle>
            <DialogDescription>
              Configure your own Gemini API key for local use. Your key is stored securely in your browser's local storage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="col-span-3"
              />
              <p className="text-[10px] text-muted-foreground italic">
                Get your key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveApiKey}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Ask anything about your PDF document or paste external text as context.</p>
              <p className="text-xs mt-2 italic">Tip: Long pastes are automatically captured as context!</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <Card className={`p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-muted border">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="p-3 bg-muted/50 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Unified Context Area (PDF Selection + Pasted Content) - Now positioned just above the input */}
      {(selectedText || pastedText) && (
        <div className="mx-4 mb-2 p-3 bg-primary/5 border rounded-lg relative group shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Contextual Data</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                setPastedText(null);
                onClearSelection();
              }}
              title="Clear all context"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <ScrollArea className="max-h-[100px]">
            <div className="space-y-2 pr-2">
              {pastedText && (
                <div className="relative">
                  <div className="text-[7px] text-muted-foreground uppercase mb-0.5 flex justify-between">
                    <span>From Clipboard</span>
                    <button onClick={() => setPastedText(null)} className="hover:text-destructive">REMOVE</button>
                  </div>
                  <p className="text-[11px] text-muted-foreground bg-background/50 p-2 rounded border border-dashed line-clamp-3">
                    {pastedText}
                  </p>
                </div>
              )}
              {selectedText && (
                <div className="relative">
                  <div className="text-[7px] text-muted-foreground uppercase mb-0.5 flex justify-between">
                    <span>From PDF Selection</span>
                    <button onClick={onClearSelection} className="hover:text-destructive">REMOVE</button>
                  </div>
                  <p className="text-[11px] text-muted-foreground bg-background/50 p-2 rounded border border-dashed line-clamp-3">
                    {selectedText}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              size="xs" 
              className="h-6 text-[9px] hover:bg-amber-50"
              onClick={() => handleSendMessage(`Summarize this context.`)}
            >
              Summarize
            </Button>
            <Button 
              variant="outline" 
              size="xs" 
              className="h-6 text-[9px] hover:bg-blue-50"
              onClick={() => handleSendMessage(`Explain this context simply.`)}
            >
              Layman Explanation
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <form 
          className="flex gap-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input 
            ref={inputRef}
            placeholder={pastedText || selectedText ? "Add instructions for this context..." : "Ask a question..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !pastedText && !selectedText)}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Paste large text chunks to automatically use them as context.
        </p>
      </div>

      {/* Onboarding Slideshow Overlay — shown only for new users */}
      {showOnboarding && (
        <OnboardingSlideshow
          onDismiss={handleDismissOnboarding}
          onKeySaved={handleKeySavedFromOnboarding}
        />
      )}
    </div>
  );
}
