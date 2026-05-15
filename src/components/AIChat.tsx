import React, { useState, useRef, useEffect, useCallback, type JSX } from 'react';
// ScrollArea removed — plain div with overflow-y-auto gives better layout control
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { OnboardingSlideshow } from './OnboardingSlideshow';
import {
  Send, Bot, User, Loader2, Trash2, Settings2,
  Info, X, Plus, Server, MessageSquare, MoreVertical, Check
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { MODELS, ChatMessage, generateResponse, fetchLocalModels, ProviderConfig } from "@/src/lib/gemini";
import { getSessions, saveSession, deleteSession, createSession, ChatSession } from "@/src/lib/sessionManager";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AIChatProps {
  selectedText: string | null;
  onClearSelection: () => void;
  initialMessage?: string;
}

export function AIChat({ selectedText, onClearSelection, initialMessage }: AIChatProps) {
  // ── Session state ───────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showSessionPanel, setShowSessionPanel] = useState(false);

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [input, setInput] = useState('');
  const [pastedText, setPastedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Provider / model settings ────────────────────────────────────────────────
  const [provider, setProvider] = useState<'gemini' | 'local'>('gemini');
  const [model, setModel] = useState(MODELS.FLASH);
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);
  const [localBaseUrl, setLocalBaseUrl] = useState('http://localhost:1234/v1');
  const [localModel, setLocalModel] = useState('');
  const [localModelsList, setLocalModelsList] = useState<{ id: string; name: string }[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionPanelRef = useRef<HTMLDivElement>(null);

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load saved config
    const savedKey = localStorage.getItem('GEMINI_CUSTOM_API_KEY');
    const savedProvider = localStorage.getItem('AI_PROVIDER') as 'gemini' | 'local' | null;
    const savedBaseUrl = localStorage.getItem('LOCAL_BASE_URL');
    const savedLocalModel = localStorage.getItem('LOCAL_MODEL');
    const savedModel = localStorage.getItem('GEMINI_MODEL');

    if (savedKey) { setCustomApiKey(savedKey); setApiKeyInput(savedKey); }
    if (savedProvider) setProvider(savedProvider);
    if (savedBaseUrl) setLocalBaseUrl(savedBaseUrl);
    if (savedLocalModel) setLocalModel(savedLocalModel);
    if (savedModel) setModel(savedModel);
    if (!savedKey && savedProvider !== 'local') setShowOnboarding(true);

    // Load or create the initial session synchronously (avoids stale-state race)
    const loaded = getSessions();
    if (loaded.length > 0) {
      setSessions(loaded);
      setCurrentSessionId(loaded[0].id);
    } else {
      const fresh = createSession();
      saveSession(fresh);
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    }
  }, []);

  // Close session panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sessionPanelRef.current && !sessionPanelRef.current.contains(e.target as Node)) {
        setShowSessionPanel(false);
      }
    };
    if (showSessionPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSessionPanel]);

  // Auto-fetch local models when provider / baseUrl changes
  useEffect(() => {
    if (provider === 'local') {
      fetchLocalModels(localBaseUrl).then(models => {
        setLocalModelsList(models);
        if (models.length > 0 && !localModel) setLocalModel(models[0].id);
      });
    }
  }, [provider, localBaseUrl]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentSessionId, isLoading]);

  // Populate input from floating-action selections
  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (selectedText) setTimeout(() => inputRef.current?.focus(), 0);
  }, [selectedText]);

  // ── Derived current session ──────────────────────────────────────────────────
  const currentSession: ChatSession =
    sessions.find(s => s.id === currentSessionId) ??
    { id: 'tmp', title: 'New Chat', messages: [], updatedAt: Date.now() };

  // ── Session helpers ──────────────────────────────────────────────────────────
  const persistSession = useCallback((updated: ChatSession) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s);
      // If not found, prepend (shouldn't happen)
      if (!next.find(s => s.id === updated.id)) next.unshift(updated);
      return next;
    });
    saveSession(updated);
  }, []);

  const handleNewSession = useCallback(() => {
    const fresh = createSession();
    saveSession(fresh);
    setSessions(prev => [fresh, ...prev]);
    setCurrentSessionId(fresh.id);
    setShowSessionPanel(false);
  }, []);

  const handleSwitchSession = (id: string) => {
    setCurrentSessionId(id);
    setShowSessionPanel(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (id === currentSessionId) {
        if (next.length > 0) setCurrentSessionId(next[0].id);
        else {
          const fresh = createSession();
          saveSession(fresh);
          next.push(fresh);
          setCurrentSessionId(fresh.id);
        }
      }
      return next;
    });
  };

  // ── Save settings ────────────────────────────────────────────────────────────
  const handleSaveSettings = () => {
    const key = apiKeyInput.trim();
    if (key) {
      localStorage.setItem('GEMINI_CUSTOM_API_KEY', key);
      setCustomApiKey(key);
      setShowOnboarding(false);
      localStorage.setItem('ONBOARDING_DISMISSED', 'true');
    } else {
      localStorage.removeItem('GEMINI_CUSTOM_API_KEY');
      setCustomApiKey(null);
    }
    localStorage.setItem('AI_PROVIDER', provider);
    localStorage.setItem('LOCAL_BASE_URL', localBaseUrl);
    localStorage.setItem('LOCAL_MODEL', localModel);
    localStorage.setItem('GEMINI_MODEL', model);
    setIsSettingsOpen(false);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSendMessage = async (overrideText?: string) => {
    const text = overrideText ?? input;
    if (!text.trim() && !pastedText && !selectedText) return;
    if (isLoading) return;

    const capturedSelected = selectedText;
    const capturedPasted = pastedText;
    const displayPrompt = text || 'Analyze this context…';

    const userMsg: ChatMessage = { role: 'user', text: displayPrompt };
    const baseMessages = [...currentSession.messages, userMsg];

    // Auto-title on first message
    let title = currentSession.title;
    if (currentSession.messages.length === 0 && currentSession.title === 'New Chat') {
      title = displayPrompt.substring(0, 28).trimEnd() + (displayPrompt.length > 28 ? '…' : '');
    }
    const withUser: ChatSession = { ...currentSession, title, messages: baseMessages, updatedAt: Date.now() };
    persistSession(withUser);

    setInput('');
    setPastedText(null);
    onClearSelection();
    setIsLoading(true);

    try {
      let finalPrompt = text || 'Please analyze the following context.';
      const parts: string[] = [];
      if (capturedSelected) parts.push(`Context from PDF: "${capturedSelected}"`);
      if (capturedPasted) parts.push(`Pasted Context: "${capturedPasted}"`);
      if (parts.length > 0) finalPrompt = `${parts.join('\n\n')}\n\nQuestion/Prompt: ${finalPrompt}`;

      const activeModel = provider === 'local' ? localModel : model;
      const config: ProviderConfig = { provider, apiKey: customApiKey, baseUrl: localBaseUrl };

      const response = await generateResponse(finalPrompt, activeModel, currentSession.messages, config);
      const aiMsg: ChatMessage = { role: 'model', text: response || 'No response generated.' };
      persistSession({ ...withUser, messages: [...baseMessages, aiMsg], updatedAt: Date.now() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate response.';
      persistSession({ ...withUser, messages: [...baseMessages, { role: 'model', text: `Error: ${msg}\n\nPlease check your settings.` }], updatedAt: Date.now() });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const clearCurrentChat = () => {
    if (!confirm('Clear this chat session?')) return;
    persistSession({ ...currentSession, messages: [], updatedAt: Date.now() });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text.length > 150) { e.preventDefault(); setPastedText(text); }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-background border-l relative overflow-hidden">

      {/* ── Header ── */}
      {/* ── Fixed Header ── */}
      <div className="flex-none flex items-center justify-between px-3 py-2 border-b bg-muted/20 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Bot className="h-4 w-4 text-primary shrink-0" />
          <h3 className="font-semibold text-sm truncate">AI Assistant</h3>

          {/* Three-dot session button */}
          <div className="relative" ref={sessionPanelRef}>
            <button
              onClick={() => setShowSessionPanel(p => !p)}
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors ml-0.5"
              title="Sessions"
            >
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {/* Session panel – rendered inline, never navigates away */}
            {showSessionPanel && (
              <div className="absolute top-8 left-0 z-50 w-60 rounded-lg border bg-popover shadow-lg overflow-hidden">
                {/* New chat button */}
                <button
                  onClick={handleNewSession}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors border-b"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  New Chat
                </button>

                {/* Session list */}
                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Recent Chats
                </p>
                <div className="max-h-56 overflow-y-auto">
                  {sessions.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground italic">No sessions yet.</p>
                  )}
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handleSwitchSession(s.id)}
                      className={cn(
                        'group flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted transition-colors',
                        s.id === currentSessionId && 'bg-muted'
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-xs">{s.title}</span>
                      {s.id === currentSessionId && (
                        <Check className="h-3 w-3 text-primary shrink-0" />
                      )}
                      {/* Delete — stopPropagation prevents session-switch */}
                      <button
                        onClick={e => handleDeleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded hover:text-destructive transition-all"
                        title="Delete session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground mr-1 hidden sm:block" title={provider === 'local' ? localModel : model}>
            {provider === 'local' ? 'Local' : (model === MODELS.FLASH ? 'Flash' : 'Pro')}
          </span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors"
            title="AI Settings"
          >
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={clearCurrentChat}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ── Settings Dialog ── */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" /> AI Settings
            </DialogTitle>
            <DialogDescription>
              Configure Google Gemini API or a Local LM Studio server.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Platform</Label>
              <Select value={provider} onValueChange={(v: 'gemini' | 'local') => setProvider(v)}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="local">Local Host (LM Studio)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {provider === 'gemini' && (
              <>
                <div className="grid gap-2">
                  <Label>Gemini API Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter your API key…"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MODELS.FLASH}>Gemini 2.5 Flash (Fast)</SelectItem>
                      <SelectItem value={MODELS.PRO}>Gemini 3.1 Pro (Smart)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {provider === 'local' && (
              <>
                <div className="grid gap-2">
                  <Label>Local Server Base URL</Label>
                  <Input
                    placeholder="http://localhost:1234/v1"
                    value={localBaseUrl}
                    onChange={e => setLocalBaseUrl(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={localModel} onValueChange={setLocalModel}>
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      {localModelsList.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                      {localModelsList.length === 0 && (
                        <SelectItem value="__none__" disabled>No models found — is LM Studio running?</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline" size="sm" className="text-xs"
                    onClick={() => fetchLocalModels(localBaseUrl).then(ms => {
                      setLocalModelsList(ms);
                      if (ms.length > 0 && !localModel) setLocalModel(ms[0].id);
                    })}
                  >
                    <Server className="h-3 w-3 mr-1.5" /> Refresh Models
                  </Button>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Scrollable Messages — only this area scrolls ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {currentSession.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">{currentSession.title}</p>
              <p className="text-xs mt-1 opacity-60">Ask anything about your PDF document.</p>
            </div>
          )}

          {currentSession.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[87%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`mt-1 h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border'}`}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
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
              <div className="flex gap-2">
                <div className="mt-1 h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-muted border">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <Card className="p-3 bg-muted/50 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed Context chip (above input) ── */}
      {(selectedText || pastedText) && (
        <div className="flex-none mx-3 mb-2 p-3 bg-primary/5 border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Info className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Contextual Data</span>
            </div>
            <button
              onClick={() => { setPastedText(null); onClearSelection(); }}
              className="h-4 w-4 rounded flex items-center justify-center hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="max-h-[90px] overflow-y-auto">
            <div className="space-y-1.5 pr-1">
              {pastedText && (
                <div>
                  <div className="text-[7px] text-muted-foreground uppercase mb-0.5 flex justify-between">
                    <span>From Clipboard</span>
                    <button onClick={() => setPastedText(null)} className="hover:text-destructive">REMOVE</button>
                  </div>
                  <p className="text-[11px] text-muted-foreground bg-background/50 p-1.5 rounded border border-dashed line-clamp-2">{pastedText}</p>
                </div>
              )}
              {selectedText && (
                <div>
                  <div className="text-[7px] text-muted-foreground uppercase mb-0.5 flex justify-between">
                    <span>From PDF</span>
                    <button onClick={onClearSelection} className="hover:text-destructive">REMOVE</button>
                  </div>
                  <p className="text-[11px] text-muted-foreground bg-background/50 p-1.5 rounded border border-dashed line-clamp-2">{selectedText}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="xs" className="h-6 text-[9px]" onClick={() => handleSendMessage('Summarize this context.')}>Summarize</Button>
            <Button variant="outline" size="xs" className="h-6 text-[9px]" onClick={() => handleSendMessage('Explain this context simply.')}>Explain Simply</Button>
          </div>
        </div>
      )}

      {/* ── Fixed Input bar ── */}
      <div className="flex-none p-3 border-t bg-background">
        <form
          className="flex gap-2"
          onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
        >
          <Input
            ref={inputRef}
            placeholder={pastedText || selectedText ? 'Add instructions…' : 'Ask a follow-up question…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit" size="icon"
            disabled={isLoading || (!input.trim() && !pastedText && !selectedText)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* ── Onboarding overlay ── */}
      {showOnboarding && (
        <OnboardingSlideshow
          onDismiss={() => { setShowOnboarding(false); localStorage.setItem('ONBOARDING_DISMISSED', 'true'); }}
          onKeySaved={key => { setCustomApiKey(key); setApiKeyInput(key); setShowOnboarding(false); localStorage.setItem('ONBOARDING_DISMISSED', 'true'); }}
        />
      )}
    </div>
  );
}
