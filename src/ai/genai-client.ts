import { GoogleGenAI } from '@google/genai';
import { getAppSetting } from '@/lib/db';

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
 * Recupera dinamicamente il modello Flash attivo configurato dall'utente (da SQLite o da ENV).
 */
export function getActiveFlashModel(): string {
  try {
    const saved = getAppSetting('active_ai_model');
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {}
  return process.env.GEMINI_FLASH_MODEL || 'gemini-3.8-flash';
}

/**
 * Modello Flash predefinito per compatibilità retroattiva.
 */
export const DEFAULT_FLASH_MODEL = 'gemini-3.8-flash';

/**
 * Esegue generateContent con retry esponenziale e fallback automatico in caso di errore 503 (high demand) o 429 (rate limit).
 */
export async function safeGenerateContent(
  genAi: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  const activeModel = getActiveFlashModel();
  const primaryModel = params.model || activeModel;
  const modelsToTry = [
    primaryModel,
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await genAi.models.generateContent({
          ...params,
          model,
        });
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err || '');
        const isTransient =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('overloaded') ||
          msg.includes('temporarily unavailable') ||
          msg.includes('429') ||
          msg.includes('ResourceExhausted');

        if (isTransient && attempt < 2) {
          // Attendi prima di riprovare
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        console.warn(`[GenAI] Modello ${model} non disponibile (${msg.substring(0, 120)}...). Tentativo fallback...`);
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Testa la connettività e la latenza di un modello specifico con un ping leggero.
 */
export async function testGeminiModel(modelName: string): Promise<{ success: boolean; latencyMs?: number; message?: string; error?: string }> {
  const startTime = Date.now();
  try {
    const genAi = getGenAI();
    const cleanModel = modelName.startsWith('googleai/') ? modelName.replace('googleai/', '') : modelName;
    const response = await genAi.models.generateContent({
      model: cleanModel,
      contents: 'Rispondi esclusivamente con la parola "OK".',
      config: {
        maxOutputTokens: 10,
        temperature: 0.1,
      },
    });
    const latencyMs = Date.now() - startTime;
    const text = response.text || '';
    return {
      success: true,
      latencyMs,
      message: `Modello ${cleanModel} operativo! Risposta ricevuta in ${latencyMs}ms ("${text.trim().substring(0, 30)}")`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      error: err?.message || String(err),
    };
  }
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
