import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyByJ1NLdmgCrdivzOsI2NiLuiJie1HDHe0"; //
const genAI = new GoogleGenerativeAI(apiKey);

// Analisi Scheda
export const analyzeWorkoutFile = async (fileBase64: string, mimeType: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
  try {
    const result = await model.generateContent([{ inlineData: { mimeType, data } }, { text: "Analizza questa scheda e restituisci un array JSON." }]);
    return JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ESSENZIALE: Questa funzione mancante bloccava tutto!
export const getExerciseExplanation = async (name: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const res = await model.generateContent(`Spiega ${name}`);
    return res.response.text();
  } catch { return "Spiegazione non disponibile."; }
};

// Chat
export const getChatResponse = async (m: string, h: any[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const chat = model.startChat({ history: h.map(x => ({ role: x.role === 'user' ? 'user' : 'model', parts: [{ text: x.parts }] })) });
    const res = await chat.sendMessage(m);
    return res.response.text();
  } catch { return "Errore chat."; }
};
