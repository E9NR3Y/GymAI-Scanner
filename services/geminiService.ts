
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Exercise } from "../types";

// Helper to clean base64 string
const cleanBase64 = (base64Data: string) => {
  return base64Data.split(',')[1];
};

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key mancante. Assicurati che l'environment sia configurato.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const FALLBACK_QUOTES = [
  "Non mollare mai! Ogni ripetizione conta.",
  "Il dolore è temporaneo, la gloria è per sempre.",
  "Suda ora, brilla dopo.",
  "Niente scuse, solo risultati.",
  "Il tuo unico limite sei tu.",
  "Trasforma il dolore in potere.",
  "Non fermarti quando sei stanco, fermati quando hai finito.",
  "La disciplina è fare ciò che odi come se lo amassi."
];

export interface ExtractedRoutine {
  routineName: string;
  exercises: Exercise[];
}

// Analysis of a workout file (Image or PDF)
export const analyzeWorkoutFile = async (
  fileBase64: string,
  mimeType: string
): Promise<ExtractedRoutine[]> => {
  const ai = getAiClient();
  const prompt = `
    Analizza il documento completo fornito (PDF o Immagine) che contiene una scheda di allenamento.
    OBIETTIVO: Identificare se la scheda è divisa in più giornate/routine e separarle distintamente.
    Output richiesto (JSON Array): Una LISTA di oggetti routineName ed exercises.
  `;

  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-pro-preview for complex reasoning and structure extraction from documents
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64(fileBase64) } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              routineName: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.INTEGER },
                    reps: { type: Type.STRING },
                    muscleGroup: { type: Type.STRING },
                    notes: { type: Type.STRING, nullable: true },
                    restTime: { type: Type.INTEGER, nullable: true },
                  },
                  required: ["name", "sets", "reps", "muscleGroup"],
                },
              },
            },
            required: ["routineName", "exercises"],
          },
        },
      },
    });
    // Access response.text property directly
    return JSON.parse(response.text || "[]") as ExtractedRoutine[];
  } catch (error: any) {
    console.error("Errore analisi Gemini:", error);
    throw new Error("Errore durante l'analisi della scheda.");
  }
};

// Explanation of an exercise
export const getExerciseExplanation = async (exerciseName: string, muscleGroup: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Spiega brevemente come eseguire correttamente l'esercizio "${exerciseName}" per il gruppo muscolare "${muscleGroup}". 
  Includi 3 punti chiave sulla tecnica e un consiglio per evitare infortuni. Sii conciso e professionale. Usa il grassetto per i termini importanti.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    // Access response.text property directly
    return response.text || "Nessuna spiegazione disponibile al momento.";
  } catch (error) {
    console.error("Errore spiegazione esercizio:", error);
    return "Errore nel caricamento della spiegazione.";
  }
};

// General fitness chat response
export const getChatResponse = async (userMessage: string, history: { role: string, parts: string }[]): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { role: 'user', parts: [{ text: "Sei un assistente esperto di fitness e bodybuilding. Rispondi in modo tecnico ma accessibile. Non dare consigli medici o dietetici estremi." }]},
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.parts }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
    });
    // Access response.text property directly
    return response.text || "Non sono riuscito a generare una risposta.";
  } catch (error) {
    console.error("Errore chat Gemini:", error);
    return "Scusa, c'è stato un problema con la connessione all'IA.";
  }
};

// Get a motivational quote for the user
export const getMotivationalQuote = async (): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Genera una citazione motivazionale breve e potente per qualcuno che si sta allenando in palestra. 
  La citazione deve essere in italiano, originale e ispiratrice. Massimo 15 parole.`;

  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-flash-preview for basic text generation
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    // Access response.text property directly
    return response.text?.trim() || FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  } catch (error) {
    console.error("Errore citazione motivazionale:", error);
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};
