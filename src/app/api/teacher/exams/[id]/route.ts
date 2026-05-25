import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { canManageTeacherContent } from "@/lib/teacher-access";
import { getOwnedExamDoc } from "@/lib/exam-access";
import { deleteExamPdf } from "@/lib/exam-storage";
import { validateExamQuestions } from "@/lib/exam-validation";
import { serializeTeacherExam } from "@/lib/exam-serialize";
import ExamAttempt from "@/models/ExamAttempt";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || !canManageTeacherContent(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    const { id } = await context.params;
    const exam = await getOwnedExamDoc(id, session);
    if (exam === null) return jsonError("Exam not found", 404);
    if (exam === "forbidden") return jsonError("You can only view your own exams", 403);

    const attemptCount = await ExamAttempt.countDocuments({ examId: exam._id });

    return NextResponse.json({
      exam: serializeTeacherExam(exam.toObject() as Parameters<typeof serializeTeacherExam>[0], {
        attemptCount,
      }),
    });
  } catch (error) {
    console.error("Get teacher exam error:", error);
    return jsonError("Server error", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || !canManageTeacherContent(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    const { id } = await context.params;
    const exam = await getOwnedExamDoc(id, session);
    if (exam === null) return jsonError("Exam not found", 404);
    if (exam === "forbidden") return jsonError("You can only edit your own exams", 403);

    const body = await request.json();

    if (typeof body.title === "string" && body.title.trim().length >= 3) {
      exam.title = body.title.trim();
    }
    if (typeof body.courseId === "string") {
      exam.courseId = body.courseId.trim() || undefined;
    }
    if (typeof body.durationMinutes === "number") {
      exam.durationMinutes = Math.min(180, Math.max(5, body.durationMinutes));
    }
    if (body.status === "published") {
      exam.status = "published";
      exam.publishedAt = exam.publishedAt ?? new Date();
    }
    if (body.status === "draft") {
      exam.status = "draft";
    }

    if (body.questions !== undefined) {
      const parsed = validateExamQuestions(body.questions);
      if (!parsed.ok) {
        return jsonError(parsed.error, 400);
      }
      exam.set("questions", parsed.data);
    }

    await exam.save();

    return NextResponse.json({
      exam: serializeTeacherExam(exam.toObject() as Parameters<typeof serializeTeacherExam>[0]),
      message: "Exam updated",
    });
  } catch (error) {
    console.error("Update exam error:", error);
    return jsonError("Server error", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || !canManageTeacherContent(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    const { id } = await context.params;
    const exam = await getOwnedExamDoc(id, session);
    if (exam === null) return jsonError("Exam not found", 404);
    if (exam === "forbidden") return jsonError("You can only delete your own exams", 403);

    await ExamAttempt.deleteMany({ examId: exam._id });
    await deleteExamPdf(exam.sourcePdfPath);
    await exam.deleteOne();

    return NextResponse.json({ message: "Exam deleted" });
  } catch (error) {
    console.error("Delete exam error:", error);
    return jsonError("Server error", 500);
  }
}
