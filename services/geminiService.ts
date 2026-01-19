import { GoogleGenerativeAI } from "@google/generative-ai";

// Recupero chiave API
const API_KEY = "AIzaSyByJ1NLdmgCrdivzOsI2NiLuiJie1HDHe0"; 
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeWorkoutFile = async (fileBase64: string, mimeType: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // Pulisce il base64 per evitare errori di invio
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
    console.error("Crash IA sul telefono:", error);
    throw new Error("Errore durante l'analisi della scheda.");
  }
};

// ... mantieni le altre funzioni (getChatResponse, ecc.) ma usa questa logica semplice
