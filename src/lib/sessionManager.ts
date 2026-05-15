import { ChatMessage } from './gemini';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const STORAGE_KEY = 'PDF_AGENT_ASSIST_SESSIONS';

export function getSessions(): ChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: ChatSession) {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string) {
  const sessions = getSessions();
  const newSessions = sessions.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
}

export function createSession(): ChatSession {
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [],
    updatedAt: Date.now(),
  };
}
