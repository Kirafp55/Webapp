import { GoogleGenAI } from '@google/genai';

// Inicializa o cliente do Gemini usando a chave de API injetada pelo ambiente
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string 
});
