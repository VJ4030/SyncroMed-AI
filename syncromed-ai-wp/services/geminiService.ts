import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// In a real production build, use a backend proxy. For this demo/hackathon context, we use the env variable directly.
const getClient = () => {
    const apiKey = process.env.API_KEY || ''; 
    if (!apiKey) console.warn("Gemini API Key missing!");
    return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  // 1. Doctor: Diagnosis Assistance
  async analyzeSymptoms(symptoms: string, vitals: string): Promise<string> {
    const ai = getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a senior medical consultant. Analyze these symptoms: "${symptoms}" and vitals: "${vitals}". 
        Provide a concise differential diagnosis (top 3 possibilities), recommended tests, and immediate care suggestions. 
        Format as clear text with headers. Disclaimer: State clearly this is AI assistance, not final medical advice.`,
      });
      return response.text || "Analysis failed.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI Service temporarily unavailable.";
    }
  },

  // 2. Patient: Prescription Explanation
  async explainPrescription(prescription: string): Promise<string> {
    const ai = getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain this medical prescription to a patient in simple, non-medical language (EL5): "${prescription}". 
        Include what the medicine does, how to take it generally, and common side effects to watch for.`,
      });
      return response.text || "Explanation failed.";
    } catch (error) {
       console.error("Gemini Error:", error);
      return "Could not explain prescription.";
    }
  },

  // 3. Admin: Inflow Prediction (Structured JSON)
  async predictInflow(currentStats: any, dayOfWeek: string): Promise<any> {
    const ai = getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given current hospital stats: ${JSON.stringify(currentStats)} and today is ${dayOfWeek}.
        Predict patient inflow for the next 24 hours. Consider factors like weekends or typical flu patterns (randomized simulation).
        Return JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictedCount: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING }, // LOW, MEDIUM, HIGH, CRITICAL
              peakHour: { type: Type.STRING },
              suggestion: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
       console.error("Gemini Error:", error);
      return { predictedCount: 0, riskLevel: 'UNKNOWN', peakHour: 'N/A', suggestion: 'AI Offline' };
    }
  },

  // 4. Pharmacist: Inventory Forecasting
  async forecastInventory(medicines: any[]): Promise<string> {
    const ai = getClient();
    try {
      // Simplification: Sending a summary of medicines to avoid token limits in this demo
      const stockSummary = medicines.map(m => `${m.name}: ${m.stock} units (Min: ${m.minLevel})`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this pharmacy stock: ${stockSummary}. 
        Identify items at risk of running out soon based on generic usage patterns. 
        Suggest restocking priorities. Keep it concise.`,
      });
      return response.text || "Forecasting failed.";
    } catch (error) {
       console.error("Gemini Error:", error);
      return "AI Forecasting unavailable.";
    }
  }
};
