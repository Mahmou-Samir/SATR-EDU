import OpenAI from "openai";
import { randomUUID } from "crypto";
import type { ExamQuestion } from "@/lib/exam-types";
import { getOpenAIClient, getOpenAIModel, getOpenAIPdfModel, isOpenAIConfigured } from "@/lib/openai-client";
import { getOpenRouterClient, getOpenRouterModels, isOpenRouterConfigured } from "@/lib/openrouter-client";
import { getGeminiClient, getGeminiModels, isGeminiConfigured } from "@/lib/gemini-client";

/** Whether an error looks like a rate-limit / quota issue */
function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const status = (err as { status?: number }).status;
  const message = String((err as { message?: string }).message ?? "");
  return status === 429 || message.includes("429") || message.toLowerCase().includes("rate limit");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Calls fn; if it throws a 429 waits `delayMs` then retries once.
 * On any other error, throws immediately.
 */
async function retryOnRateLimit<T>(fn: () => Promise<T>, delayMs = 3000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isRateLimitError(err)) {
      console.warn(`[exam-ai] Rate-limited — waiting ${delayMs}ms then retrying once...`);
      await sleep(delayMs);
      return fn();
    }
    throw err;
  }
}

const MIN_TEXT_FOR_TEXT_ONLY = 400;
const MAX_TEXT_CHARS = 14_000;

type RawAiQuestion = {
  prompt?: string;
  options?: string[];
  correctIndex?: number;
  points?: number;
};

type AiQuestionsPayload = {
  contentSummary?: string;
  questions?: RawAiQuestion[];
};

function normalizeQuestions(raw: RawAiQuestion[], limit: number): ExamQuestion[] {
  const questions: ExamQuestion[] = [];

  for (const item of raw) {
    if (questions.length >= limit) break;

    const prompt = typeof item.prompt === "string" ? item.prompt.trim() : "";
    const options = Array.isArray(item.options)
      ? item.options.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean)
      : [];
    const correctIndex =
      typeof item.correctIndex === "number" ? item.correctIndex : parseInt(String(item.correctIndex ?? ""), 10);
    const points =
      typeof item.points === "number" ? item.points : parseInt(String(item.points ?? 1), 10);

    if (prompt.length < 8 || options.length < 2) continue;
    if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) continue;

    questions.push({
      id: randomUUID(),
      type: "mcq",
      prompt,
      options: options.slice(0, 6),
      correctIndex,
      points: Number.isNaN(points) ? 1 : Math.min(10, Math.max(1, points)),
    });
  }

  return questions;
}

function parseAiJson(content: string): AiQuestionsPayload {
  const trimmed = content.trim();
  const jsonBlock = trimmed.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? trimmed;
  return JSON.parse(jsonBlock) as AiQuestionsPayload;
}

function buildSystemPrompt(language: "ar" | "en", count: number): string {
  if (language === "ar") {
    return `أنت مولّد امتحانات تعليمية. أنشئ ${count} أسئلة اختيار من متعدد واضحة ومباشرة من المحتوى المعطى.
- كل سؤال: prompt، options (4 خيارات)، correctIndex (0-based)، points (1)
- الأسئلة تغطي المفاهيم الأساسية وليس تفاصيل شكلية
- أجب بـ JSON فقط بالشكل: {"contentSummary":"...","questions":[{"prompt":"...","options":["..."],"correctIndex":0,"points":1}]}`;
  }
  return `You are an educational exam generator. Create ${count} clear multiple-choice questions from the provided content.
- Each question: prompt, options (4 choices), correctIndex (0-based), points (1)
- Cover core concepts, not formatting trivia
- Reply with JSON only: {"contentSummary":"...","questions":[{"prompt":"...","options":["..."],"correctIndex":0,"points":1}]}`;
}

function detectLanguage(title: string, text: string): "ar" | "en" {
  const sample = `${title} ${text}`.slice(0, 500);
  const arabicChars = (sample.match(/[\u0600-\u06FF]/g) ?? []).length;
  return arabicChars > sample.length * 0.15 ? "ar" : "en";
}

async function callTextAi(
  client: OpenAI,
  model: string,
  systemPrompt: string,
  userMessage: string,
  /** OpenRouter free models mostly don't support response_format */
  useJsonMode = true
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    temperature: 0.4,
    ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI returned empty response");
  return content;
}

export async function generateQuestionsFromTextWithAI(
  text: string,
  title: string,
  questionCount = 10
): Promise<{ questions: ExamQuestion[]; contentSummary: string; provider: string }> {
  const language = detectLanguage(title, text);
  const systemPrompt = buildSystemPrompt(language, questionCount);
  const userMessage = `Exam title: ${title}\n\nDocument content:\n${text.slice(0, MAX_TEXT_CHARS)}`;

  let lastError: unknown;

  // 1️⃣ Gemini — primary provider (loops through models on 429)
  if (isGeminiConfigured()) {
    const client = getGeminiClient();
    for (const model of getGeminiModels()) {
      try {
        console.log(`[exam-ai] Trying Gemini model: ${model}`);
        const rawContent = await retryOnRateLimit(() =>
          callTextAi(client, model, systemPrompt, userMessage, false)
        );
        const parsed = parseAiJson(rawContent);
        const questions = normalizeQuestions(parsed.questions ?? [], questionCount);
        if (questions.length >= 3) {
          return { questions, contentSummary: parsed.contentSummary?.trim() || text.slice(0, 400), provider: `gemini:${model}` };
        }
      } catch (err) {
        const label = isRateLimitError(err) ? "rate-limited" : "failed";
        console.warn(`[exam-ai] Gemini ${model} ${label}, trying next...`);
        lastError = err;
      }
    }
  }

  // 2️⃣ OpenAI — secondary
  if (isOpenAIConfigured()) {
    try {
      const rawContent = await callTextAi(
        getOpenAIClient(), getOpenAIModel(), systemPrompt, userMessage, true
      );
      const parsed = parseAiJson(rawContent);
      const questions = normalizeQuestions(parsed.questions ?? [], questionCount);
      if (questions.length >= 3) {
        return { questions, contentSummary: parsed.contentSummary?.trim() || text.slice(0, 400), provider: "openai" };
      }
    } catch (err) {
      console.warn("[exam-ai] OpenAI failed:", err);
      lastError = err;
    }
  }

  // 3️⃣ OpenRouter free models — last resort
  if (isOpenRouterConfigured()) {
    const client = getOpenRouterClient();
    for (const model of getOpenRouterModels()) {
      try {
        console.log(`[exam-ai] Trying OpenRouter model: ${model}`);
        const rawContent = await retryOnRateLimit(() =>
          callTextAi(client, model, systemPrompt, userMessage, false)
        );
        const parsed = parseAiJson(rawContent);
        const questions = normalizeQuestions(parsed.questions ?? [], questionCount);
        if (questions.length < 3) throw new Error("Too few valid questions");
        return { questions, contentSummary: parsed.contentSummary?.trim() || text.slice(0, 400), provider: `openrouter:${model}` };
      } catch (err) {
        const label = isRateLimitError(err) ? "rate-limited" : "failed";
        console.warn(`[exam-ai] OpenRouter model ${model} ${label}, trying next...`);
        lastError = err;
      }
    }
  }

  throw lastError ?? new Error("No AI provider configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY.");
}

export async function generateQuestionsFromPdfWithAI(
  pdfBuffer: Buffer,
  pdfName: string,
  title: string,
  questionCount = 10
): Promise<{ questions: ExamQuestion[]; contentSummary: string; ocrUsed: true }> {
  const openai = getOpenAIClient();
  const language = detectLanguage(title, "");
  const model = getOpenAIPdfModel();
  const base64 = pdfBuffer.toString("base64");

  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "file",
      file: {
        filename: pdfName.endsWith(".pdf") ? pdfName : `${pdfName}.pdf`,
        file_data: `data:application/pdf;base64,${base64}`,
      },
    },
    {
      type: "text",
      text:
        language === "ar"
          ? `اقرأ ملف PDF هذا (حتى لو كان ممسوحاً ضوئياً). أنشئ ${questionCount} أسئلة امتحان اختيار من متعدد من محتواه.\nعنوان الامتحان: ${title}\nأرجع JSON فقط.`
          : `Read this PDF (including scanned pages). Create ${questionCount} multiple-choice exam questions from its content.\nExam title: ${title}\nReturn JSON only.`,
    },
  ];

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(language, questionCount) },
      { role: "user", content: userContent },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response for PDF");
  }

  const parsed = parseAiJson(content);
  const questions = normalizeQuestions(parsed.questions ?? [], questionCount);
  if (questions.length < 3) {
    throw new Error("AI could not generate enough questions from this PDF");
  }

  return {
    questions,
    contentSummary: parsed.contentSummary?.trim() || title,
    ocrUsed: true,
  };
}

export async function generateExamFromContent(
  options: {
    title: string;
    text: string;
    pdfBuffer?: Buffer;
    pdfName?: string;
    questionCount?: number;
  }
): Promise<{ questions: ExamQuestion[]; sourceText: string; ocrUsed: boolean }> {
  const count = options.questionCount ?? 10;
  const text = options.text.trim();

  if (text.length >= MIN_TEXT_FOR_TEXT_ONLY) {
    const result = await generateQuestionsFromTextWithAI(text, options.title, count);
    return { questions: result.questions, sourceText: text, ocrUsed: false };
  }

  if (!options.pdfBuffer) {
    throw new Error("Not enough text in PDF and no file buffer for OCR");
  }

  const result = await generateQuestionsFromPdfWithAI(
    options.pdfBuffer,
    options.pdfName ?? "document.pdf",
    options.title,
    count
  );

  return {
    questions: result.questions,
    sourceText: result.contentSummary,
    ocrUsed: true,
  };
}
