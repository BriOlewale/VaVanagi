
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';
import { StorageService } from './storageService';

const getAIClient = () => {
    const settings = StorageService.getSystemSettings();
    const apiKey = settings.geminiApiKey || process.env.API_KEY;
    
    if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please configure it in Admin Settings.");
    }
    
    return new GoogleGenAI({ apiKey });
};

export const getTranslationSuggestion = async (
  sentence: string,
  targetLanguage: Language
): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = 'gemini-2.5-flash';
    
    const prompt = `Translate the following English sentence into ${targetLanguage.name} (${targetLanguage.code}). 
    Only provide the translated text without any explanations or additional formatting.
    
    Sentence: "${sentence}"`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const text = response.text;
    return text ? text.trim() : '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const validateTranslation = async (
    original: string,
    translation: string,
    language: Language
): Promise<{ score: number; feedback: string }> => {
    try {
        const ai = getAIClient();
        const model = 'gemini-2.5-flash';
        const prompt = `You are a linguistics expert in Papua New Guinea languages.
        Rate the quality of the following translation from English to ${language.name} on a scale of 1-10.
        Provide brief constructive feedback.
        
        English: "${original}"
        Translation: "${translation}"
        
        Return JSON format: { "score": number, "feedback": "string" }`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return { score: 0, feedback: "Could not validate." };
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Validation Error:", error);
        return { score: 0, feedback: "Validation service unavailable. Please check API Key in settings." };
    }
}
