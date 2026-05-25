import type { ExamDocument } from "@/models/Exam";
import type { ExamAttemptDocument } from "@/models/ExamAttempt";
import type { ExamQuestion, PublicExamQuestion } from "@/lib/exam-types";

export type SerializedExam = {
  id: string;
  title: string;
  teacherId: string;
  courseId?: string;
  sourcePdfName?: string;
  questionCount: number;
  status: string;
  durationMinutes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  questions?: ExamQuestion[];
  sourceTextPreview?: string;
  attemptCount?: number;
  ocrUsed?: boolean;
  aiGenerated?: boolean;
};

export type SerializedPublicExam = {
  id: string;
  title: string;
  courseId?: string;
  questionCount: number;
  durationMinutes: number;
  publishedAt?: string;
  teacherName?: string;
  hasAttempt?: boolean;
  lastScore?: number;
};

export type SerializedExamForTake = {
  id: string;
  title: string;
  durationMinutes: number;
  questions: PublicExamQuestion[];
  existingAttempt?: {
    score: number;
    maxScore: number;
    percent: number;
    submittedAt: string;
  };
};

export function toPublicQuestions(questions: ExamQuestion[]): PublicExamQuestion[] {
  return questions.map(({ id, type, prompt, options, points }) => ({
    id,
    type,
    prompt,
    options,
    points,
  }));
}

export function serializeTeacherExam(
  doc: ExamDocument,
  extras?: { attemptCount?: number }
): SerializedExam {
  return {
    id: String(doc._id),
    title: doc.title,
    teacherId: String(doc.teacherId),
    courseId: doc.courseId || undefined,
    sourcePdfName: doc.sourcePdfName || undefined,
    questionCount: doc.questions?.length ?? 0,
    status: doc.status,
    durationMinutes: doc.durationMinutes,
    publishedAt: doc.publishedAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    questions: doc.questions,
    sourceTextPreview: doc.sourceTextPreview ?? undefined,
    attemptCount: extras?.attemptCount,
    ocrUsed: Boolean(doc.ocrUsed),
    aiGenerated: doc.aiGenerated !== false,
  };
}

export function serializePublicExam(
  doc: ExamDocument,
  extras?: { teacherName?: string; hasAttempt?: boolean; lastScore?: number }
): SerializedPublicExam {
  return {
    id: String(doc._id),
    title: doc.title,
    courseId: doc.courseId || undefined,
    questionCount: doc.questions?.length ?? 0,
    durationMinutes: doc.durationMinutes,
    publishedAt: doc.publishedAt?.toISOString(),
    teacherName: extras?.teacherName,
    hasAttempt: extras?.hasAttempt,
    lastScore: extras?.lastScore,
  };
}

export function serializeAttempt(doc: ExamAttemptDocument) {
  return {
    id: String(doc._id),
    examId: String(doc.examId),
    score: doc.score,
    maxScore: doc.maxScore,
    percent: doc.percent,
    submittedAt: doc.submittedAt.toISOString(),
  };
}
