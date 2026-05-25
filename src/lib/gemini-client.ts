import OpenAI from "openai";

/**
 * Google Gemini via its OpenAI-compatible REST endpoint.
 * Docs: https://ai.google.dev/gemini-api/docs/openai
 */
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";

/**
 * Ordered Gemini models to try on 429 / failure.
 * Free-tier RPM (roughly): flash-lite=30, flash=15, pro=2
 */
export const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",  // highest free-tier RPM — try first
  "gemini-2.0-flash",       // slightly lower RPM
  "gemini-1.5-flash",       // stable fallback
  "gemini-1.5-pro",         // lowest RPM but best quality
];

let geminiClient: OpenAI | null = null;

export function getGeminiClient(): OpenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  if (!geminiClient) {
    geminiClient = new OpenAI({ apiKey, baseURL: GEMINI_BASE_URL });
  }
  return geminiClient;
}

/** Returns ordered list of Gemini models (env override is first) */
export function getGeminiModels(): string[] {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel) {
    return [envModel, ...GEMINI_MODELS.filter((m) => m !== envModel)];
  }
  return GEMINI_MODELS;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
