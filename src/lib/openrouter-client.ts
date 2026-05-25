import OpenAI from "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Ordered list of free OpenRouter models tried on failure / rate-limit.
 * Override the first model via OPENROUTER_MODEL env var.
 */
export const OPENROUTER_FREE_MODELS = [
  "deepseek/deepseek-v4-flash:free",        // fast & reliable
  "meta-llama/llama-3.3-70b-instruct:free", // strong Llama 3.3
  "google/gemma-4-31b-it:free",             // Google Gemma 4
  "qwen/qwen3-coder:free",                  // Qwen3 Coder 480B
  "openai/gpt-oss-20b:free",               // OpenAI OSS 20B
];

let openRouterClient: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  if (!openRouterClient) {
    openRouterClient = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Satr Edu",
      },
    });
  }
  return openRouterClient;
}

/** Returns ordered list of models to try (env override is first) */
export function getOpenRouterModels(): string[] {
  const envModel = process.env.OPENROUTER_MODEL?.trim();
  if (envModel) {
    // Put env model first, then the rest of the fallbacks (deduped)
    return [envModel, ...OPENROUTER_FREE_MODELS.filter((m) => m !== envModel)];
  }
  return OPENROUTER_FREE_MODELS;
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}
