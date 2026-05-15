import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const MODELS = {
  FLASH: "gemini-2.5-flash",
  PRO: "gemini-3.1-pro-preview",
};

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ProviderConfig {
  provider: 'gemini' | 'local';
  apiKey?: string | null;
  baseUrl?: string;
}

export async function fetchLocalModels(baseUrl: string = 'http://localhost:1234/v1') {
  try {
    const response = await fetch(`${baseUrl}/models`);
    if (!response.ok) throw new Error("Failed to fetch models");
    const data = await response.json();
    return data.data.map((m: any) => ({ id: m.id, name: m.id }));
  } catch (error) {
    console.error("Local models fetch error:", error);
    return [];
  }
}

export async function generateResponse(
  prompt: string,
  model: string = MODELS.FLASH,
  history: ChatMessage[] = [],
  config: ProviderConfig = { provider: 'gemini' }
) {
  try {
    if (config.provider === 'local') {
      const baseUrl = config.baseUrl || 'http://localhost:1234/v1';
      
      const messages = history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      }));
      
      // Append the current prompt
      messages.push({ role: 'user', content: prompt });
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`Local API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } else {
      // Gemini
      const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No API Key configured. Please add your Gemini API Key in Settings.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      // Format history for Gemini
      const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: "You are a helpful PDF reading assistant. You help users understand, summarize, and explore content from their documents. Be concise and clear.",
        },
      });

      return response.text;
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function summarizeText(text: string, model: string = MODELS.FLASH, config?: ProviderConfig) {
  const prompt = `Please summarize the following text from a PDF document:\n\n${text}`;
  return generateResponse(prompt, model, [], config);
}

export async function explainSimply(text: string, model: string = MODELS.FLASH, config?: ProviderConfig) {
  const prompt = `Please explain the following text from a PDF document in plain English, as if explaining to a non-expert:\n\n${text}`;
  return generateResponse(prompt, model, [], config);
}

export async function exploreMore(text: string, model: string = MODELS.FLASH, config?: ProviderConfig) {
  const prompt = `Please provide more context and explore the topics mentioned in the following text from a PDF document:\n\n${text}`;
  return generateResponse(prompt, model, [], config);
}
