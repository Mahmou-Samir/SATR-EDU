import { randomUUID } from "crypto";
import type { ExamQuestion } from "@/lib/exam-types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueWords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  return [...new Set(words)];
}

function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?؟。])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && s.length <= 280);
}

function pickDistractors(pool: string[], answer: string, count: number): string[] {
  const filtered = pool.filter((w) => w !== answer.toLowerCase());
  const shuffled = shuffle(filtered);
  const picked: string[] = [];
  for (const word of shuffled) {
    if (picked.length >= count) break;
    if (!picked.includes(word)) picked.push(word);
  }
  while (picked.length < count) {
    picked.push(`option_${picked.length + 1}`);
  }
  return picked.slice(0, count);
}

export function generateQuestionsFromText(text: string, limit = 10): ExamQuestion[] {
  if (!text || text.length < 80) {
    return [];
  }

  const sentences = extractSentences(text);
  const wordPool = uniqueWords(text);
  const questions: ExamQuestion[] = [];

  for (const sentence of sentences) {
    if (questions.length >= limit) break;

    const tokens = sentence.split(/\s+/).filter((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length >= 5);
    if (tokens.length < 3) continue;

    const answerToken = tokens[Math.floor(Math.random() * tokens.length)];
    const answerClean = answerToken.replace(/[^\p{L}\p{N}]/gu, "");
    if (answerClean.length < 4) continue;

    const prompt = sentence.replace(answerToken, "______");
    const distractors = pickDistractors(wordPool, answerClean.toLowerCase(), 3);
    const options = shuffle([answerToken, ...distractors.map((d) => d.replace(/_/g, " "))]);

    const correctIndex = options.findIndex(
      (opt) => opt.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() === answerClean.toLowerCase()
    );
    if (correctIndex < 0) continue;

    questions.push({
      id: randomUUID(),
      type: "mcq",
      prompt,
      options,
      correctIndex,
      points: 1,
    });
  }

  return questions;
}

export function buildFallbackQuestions(text: string): ExamQuestion[] {
  const snippet = text.slice(0, 200).trim() || "المحتوى التعليمي";
  return [
    {
      id: randomUUID(),
      type: "mcq",
      prompt: `ما الموضوع الرئيسي لهذا المحتوى؟\n"${snippet}…"`,
      options: ["مفاهيم تعليمية", "رياضيات", "تاريخ", "برمجة"],
      correctIndex: 0,
      points: 1,
    },
    {
      id: randomUUID(),
      type: "mcq",
      prompt: "كم مرة يُنصح بمراجعة الملخص قبل الامتحان؟",
      options: ["مرة واحدة", "مرتين على الأقل", "لا حاجة للمراجعة", "عشر مرات"],
      correctIndex: 1,
      points: 1,
    },
  ];
}

export function generateExamQuestions(text: string): ExamQuestion[] {
  const generated = generateQuestionsFromText(text, 10);
  if (generated.length >= 3) return generated;
  return [...generated, ...buildFallbackQuestions(text)].slice(0, 10);
}
