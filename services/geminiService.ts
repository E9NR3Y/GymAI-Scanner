
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Exercise } from "../types";

// Helper to clean base64 string
const cleanBase64 = (base64Data: string) => {
  return base64Data.split(',')[1] || base64Data;
};

// Configurazione Client con recupero sicuro della Key
const getAiClient = () => {
  // In Vite si usa import.meta.env invece di process.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("API Key mancante in import.meta.env");
  }
  return new GoogleGenerativeAI(apiKey);
};

const FALLBACK_QUOTES = [
  "Non mollare mai! Ogni ripetizione conta.",
  "Il dolore è temporaneo, la gloria è per sempre.",
  "Suda ora, brilla dopo.",
  "Il tuo unico limite sei tu.",
  "La disciplina è fare ciò che odi come se lo amassi."
];

export interface ExtractedRoutine {
  routineName: string;
  exercises: Exercise[];
}

// Analisi della scheda (Immagine o PDF)
export const analyzeWorkoutFile = async (
  fileBase64: string,
  mimeType: string
): Promise<ExtractedRoutine[]> => {
  const genAI = getAiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analizza il documento completo fornito (PDF o Immagine) che contiene una scheda di allenamento.
    OBIETTIVO: Identificare se la scheda è divisa in più giornate/routine e separarle distintamente.
    Output richiesto: Un array JSON di oggetti con routineName ed exercises.
  `;

  try {
    const result = await model.generateContent([
      { inlineData: { mimeType, data: cleanBase64(fileBase64) } },
      { text: prompt },
    ]);
    const response = await result.response;
    const text = response.text();
    // Pulizia di eventuali blocchi di codice markdown ```json ... ```
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as ExtractedRoutine[];
  } catch (error: any) {
    console.error("Errore analisi Gemini:", error);
    throw new Error("Errore durante l'analisi della scheda.");
  }
};

// Spiegazione esercizio
export const getExerciseExplanation = async (exerciseName: string, muscleGroup: string): Promise<string> => {
  const genAI = getAiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Spiega brevemente come eseguire correttamente l'esercizio "${exerciseName}" per "${muscleGroup}". 3 punti chiave e un consiglio sicurezza.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Nessuna spiegazione disponibile.";
  }
};

// Chat assistente
export const getChatResponse = async (userMessage: string, history: { role: string, parts: string }[]): Promise<string> => {
  const genAI = getAiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.parts }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Errore di connessione all'IA.";
  }
};

// Citazione motivazionale
export const getMotivationalQuote = async (): Promise<string> => {
  const genAI = getAiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Genera una citazione motivazionale breve per la palestra in italiano.");
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};
