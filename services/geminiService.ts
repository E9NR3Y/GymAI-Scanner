import { GoogleGenerativeAI } from "@google/generative-ai";

// Chiave API e configurazione Client
const API_KEY = "AIzaSyByJ1NLdmgCrdivzOsI2NiLuiJie1HDHe0"; 
const genAI = new GoogleGenerativeAI(API_KEY);

// 1. Analisi Scheda (Immagine o PDF)
export const analyzeWorkoutFile = async (fileBase64: string, mimeType: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
  const prompt = "Analizza questa scheda di allenamento. Estrai esercizi, serie e ripetizioni. Rispondi SOLO con un array JSON pulito.";

  try {
    const result = await model.generateContent([
      { inlineData: { mimeType, data } },
      { text: prompt },
    ]);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Errore analisi IA:", error);
    throw new Error("Errore durante l'analisi della scheda.");
  }
};

// 2. Spiegazione Esercizio (Necessaria per risolvere errore Build Web Assets)
export const getExerciseExplanation = async (exerciseName: string, muscleGroup: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Spiega brevemente come eseguire ${exerciseName} per i ${muscleGroup}. Sii conciso.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Nessuna spiegazione disponibile.";
  }
};

// 3. Risposta Chat (Necessaria per il componente Chat)
export const getChatResponse = async (userMessage: string, history: any[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.parts }],
      })),
    });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    return "Scusa, riprova più tardi.";
  }
};

// 4. Citazione Motivazionale
export const getMotivationalQuote = async () => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const result = await model.generateContent("Genera una citazione motivazionale breve.");
    return result.response.text();
  } catch (error) {
    return "Non mollare mai!";
  }
};
