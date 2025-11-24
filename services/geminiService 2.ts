// src/services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Language } from '../types';
import { StorageService } from './storageService';

// Fix: Vite uses import.meta.env, not process.env
const getAIClient = () => {
  const settings = StorageService.getSystemSettings();
  const apiKey = settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please configure it in Admin → Settings.');
  }

  return new GoogleGenerativeAI(apiKey);
};

export const getTranslationSuggestion = async (
  sentence: string,
  targetLanguage: Language
): Promise<string> => {
  try {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Translate this English sentence into ${targetLanguage.name} (${targetLanguage.code}). 
    Return ONLY the translation, no explanations, no quotes, no extra text.

    Sentence: "${sentence}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('Gemini Translation Error:', error);
    return '[Translation unavailable]';
  }
};

export const validateTranslation = async (
  original: string,
  translation: string,
  language: Language
): Promise<{ score: number; feedback: string }> => {
  try {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `You are a linguistics expert in Papua New Guinea languages.
Rate this translation from English to ${language.name} on a scale of 1–10.
Provide short constructive feedback.

English: "${original}"
Translation: "${translation}"

Respond with valid JSON only:
{"score": number, "feedback": "your feedback here"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch {
      return { score: 0, feedback: 'Invalid response from AI validator.' };
    }
  } catch (error) {
    console.error('Gemini Validation Error:', error);
    return {
      score: 0,
      feedback: 'Validation unavailable. Check API key in Admin → Settings.',
    };
  }
};