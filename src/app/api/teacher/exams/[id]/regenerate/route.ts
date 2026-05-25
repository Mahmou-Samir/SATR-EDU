import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { canManageTeacherContent } from "@/lib/teacher-access";
import { getOwnedExamDoc } from "@/lib/exam-access";
import { isOpenAIConfigured } from "@/lib/openai-client";
import { buildExamFromPdf } from "@/lib/exam-pipeline";
import { readExamPdf } from "@/lib/exam-storage";
import { serializeTeacherExam } from "@/lib/exam-serialize";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || !canManageTeacherContent(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    if (!isOpenAIConfigured()) {
      return jsonError("OPENAI_API_KEY is required for AI exam generation", 503);
    }

    const { id } = await context.params;
    const exam = await getOwnedExamDoc(id, session);
    if (exam === null) return jsonError("Exam not found", 404);
    if (exam === "forbidden") return jsonError("You can only regenerate your own exams", 403);

    if (!exam.sourcePdfPath) {
      return jsonError("Original PDF not found for this exam", 404);
    }

    const buffer = await readExamPdf(exam.sourcePdfPath);
    const questionCount = Math.min(20, Math.max(3, exam.questions?.length || 10));

    let generated;
    try {
      generated = await buildExamFromPdf(
        buffer,
        exam.sourcePdfName ?? "document.pdf",
        exam.title,
        questionCount
      );
    } catch (err) {
      console.error("AI regenerate error:", err);
      const message = err instanceof Error ? err.message : "AI regeneration failed";
      return jsonError(message, 502);
    }

    exam.set("questions", generated.questions);
    exam.sourceTextPreview = generated.sourceText.slice(0, 400);
    exam.ocrUsed = generated.ocrUsed;
    exam.aiGenerated = true;
    await exam.save();

    return NextResponse.json({
      exam: serializeTeacherExam(exam.toObject() as Parameters<typeof serializeTeacherExam>[0]),
      message: "Questions regenerated with AI",
      ocrUsed: generated.ocrUsed,
    });
  } catch (error) {
    console.error("Regenerate exam error:", error);
    return jsonError("Server error", 500);
  }
}
