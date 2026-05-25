import { randomUUID } from "crypto";
import type { ExamQuestion } from "@/lib/exam-types";

export function validateExamQuestions(
  input: unknown
): { ok: true; data: ExamQuestion[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) {
    return { ok: false, error: "questions must be an array" };
  }
  if (input.length < 1 || input.length > 50) {
    return { ok: false, error: "Exam must have between 1 and 50 questions" };
  }

  const questions: ExamQuestion[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Invalid question format" };
    }
    const record = item as Record<string, unknown>;
    const prompt = typeof record.prompt === "string" ? record.prompt.trim() : "";
    const options = Array.isArray(record.options)
      ? record.options.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean)
      : [];
    const correctIndex =
      typeof record.correctIndex === "number"
        ? record.correctIndex
        : parseInt(String(record.correctIndex ?? ""), 10);
    const points =
      typeof record.points === "number" ? record.points : parseInt(String(record.points ?? 1), 10);
    const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : randomUUID();

    if (prompt.length < 5) {
      return { ok: false, error: "Each question needs a prompt (min 5 characters)" };
    }
    if (options.length < 2 || options.length > 6) {
      return { ok: false, error: "Each question needs 2–6 options" };
    }
    if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      return { ok: false, error: "Invalid correct answer index" };
    }

    questions.push({
      id,
      type: "mcq",
      prompt,
      options,
      correctIndex,
      points: Number.isNaN(points) ? 1 : Math.min(10, Math.max(1, points)),
    });
  }

  return { ok: true, data: questions };
}
