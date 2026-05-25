import type { ExamAnswer, ExamQuestion } from "@/lib/exam-types";

export function gradeExamAnswers(
  questions: ExamQuestion[],
  answers: ExamAnswer[]
): { score: number; maxScore: number; percent: number } {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
  let score = 0;
  let maxScore = 0;

  for (const question of questions) {
    maxScore += question.points;
    const selected = answerMap.get(question.id);
    if (selected === question.correctIndex) {
      score += question.points;
    }
  }

  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, percent };
}

export function validateAnswers(
  questions: ExamQuestion[],
  answers: unknown
): { ok: true; data: ExamAnswer[] } | { ok: false; error: string } {
  if (!Array.isArray(answers)) {
    return { ok: false, error: "answers must be an array" };
  }

  const questionIds = new Set(questions.map((q) => q.id));
  const parsed: ExamAnswer[] = [];

  for (const item of answers) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Invalid answer format" };
    }
    const record = item as Record<string, unknown>;
    const questionId = typeof record.questionId === "string" ? record.questionId : "";
    const selectedIndex =
      typeof record.selectedIndex === "number"
        ? record.selectedIndex
        : parseInt(String(record.selectedIndex ?? ""), 10);

    if (!questionIds.has(questionId)) {
      return { ok: false, error: "Unknown question in answers" };
    }
    if (Number.isNaN(selectedIndex) || selectedIndex < 0) {
      return { ok: false, error: "Invalid selected option" };
    }
    parsed.push({ questionId, selectedIndex });
  }

  if (parsed.length !== questions.length) {
    return { ok: false, error: "Answer every question before submitting" };
  }

  return { ok: true, data: parsed };
}
