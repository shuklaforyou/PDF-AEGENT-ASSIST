import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize function that can take a custom key or use the environment one
export function getAI(customKey?: string | null) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const MODELS = {
  FLASH: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
};

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function generateResponse(
  prompt: string,
  model: string = MODELS.FLASH,
  history: ChatMessage[] = [],
  customApiKey?: string | null
) {
  try {
    const ai = getAI(customApiKey);
    if (!ai) {
      throw new Error("No API Key configured. Please add your Gemini API Key in Settings.");
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful PDF reading assistant. You help users understand, summarize, and explore content from their documents. Be concise and clear.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function summarizeText(text: string, model: string = MODELS.FLASH) {
  const prompt = `Please summarize the following text from a PDF document:\n\n${text}`;
  return generateResponse(prompt, model);
}

export async function explainSimply(text: string, model: string = MODELS.FLASH) {
  const prompt = `Please explain the following text from a PDF document in plain English, as if explaining to a non-expert:\n\n${text}`;
  return generateResponse(prompt, model);
}

export async function exploreMore(text: string, model: string = MODELS.FLASH) {
  const prompt = `Please provide more context and explore the topics mentioned in the following text from a PDF document:\n\n${text}`;
  return generateResponse(prompt, model);
}
