import { GoogleGenAI } from '@google/genai';

/**
 * Trova la prima chiave API Gemini valida tra quelle disponibili nell'ambiente.
 */
export function getActiveGeminiApiKey(preferredEnv?: string): string | null {
  const candidates = [
    preferredEnv ? process.env[preferredEnv] : undefined,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GEMINI_API_KEY_WORLD,
    process.env.GEMINI_API_KEY_STORY,
    process.env.GEMINI_API_KEY_EXTRACTION,
    process.env.GEMINI_API_KEY_IMPORT,
    process.env.GEMINI_API_KEY_SHOPS,
    process.env.GEMINI_API_KEY_SUMMARY,
  ];

  const invalidValues = [
    '',
    'undefined',
    'null',
    'tua_chiave_qui',
    'your_key_here',
    '<your_key_here>',
    'insert_key_here',
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const clean = candidate.trim();
    if (clean && !invalidValues.includes(clean.toLowerCase()) && !clean.startsWith('YOUR_')) {
      return clean;
    }
  }

  return null;
}

/**
 * Ottiene un'istanza GoogleGenAI configurata con la chiave corretta.
 */
export function getGenAI(preferredEnv?: string): GoogleGenAI {
  const key = getActiveGeminiApiKey(preferredEnv);
  if (!key) {
    throw new Error(
      "Nessuna chiave API Gemini configurata. Vai su Impostazioni per inserire una chiave API valida (GEMINI_API_KEY)."
    );
  }

  // Sincronizza per sicurezza le variabili globali
  if (!process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = key;
  if (!process.env.GOOGLE_GENAI_API_KEY) process.env.GOOGLE_GENAI_API_KEY = key;

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'dnd-chronicle-weaver',
      },
    },
  });
}
