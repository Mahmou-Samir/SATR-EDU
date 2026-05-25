import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { gradeExamAnswers, validateAnswers } from "@/lib/exam-grade";
import { serializeAttempt } from "@/lib/exam-serialize";
import type { ExamQuestion } from "@/lib/exam-types";
import Exam from "@/models/Exam";
import ExamAttempt from "@/models/ExamAttempt";
import StudySession from "@/models/StudySession";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }
    if (session.role !== "student") {
      return jsonError("Only students can submit exams", 403);
    }

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return jsonError("Exam not found", 404);
    }

    const body = await request.json();
    const durationMinutes =
      typeof body.durationMinutes === "number" ? Math.max(0, body.durationMinutes) : undefined;

    await connectToDatabase();
    const exam = await Exam.findOne({ _id: id, status: "published" });
    if (!exam) {
      return jsonError("Exam not found or not published", 404);
    }

    const existing = await ExamAttempt.findOne({
      examId: exam._id,
      userId: new mongoose.Types.ObjectId(session.userId),
    });
    if (existing) {
      return jsonError("You already submitted this exam", 409);
    }

    const questions = exam.questions as ExamQuestion[];
    const parsed = validateAnswers(questions, body.answers);
    if (!parsed.ok) {
      return jsonError(parsed.error, 400);
    }

    for (const answer of parsed.data) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question || answer.selectedIndex >= question.options.length) {
        return jsonError("Invalid selected option", 400);
      }
    }

    const { score, maxScore, percent } = gradeExamAnswers(questions, parsed.data);

    const attempt = await ExamAttempt.create({
      examId: exam._id,
      userId: new mongoose.Types.ObjectId(session.userId),
      answers: parsed.data,
      score,
      maxScore,
      percent,
      durationMinutes,
    });

    await StudySession.create({
      userId: new mongoose.Types.ObjectId(session.userId),
      date: new Date(),
      minutes: durationMinutes && durationMinutes > 0 ? durationMinutes : exam.durationMinutes,
      score: percent,
      courseId: exam.courseId,
      type: "exam",
    });

    return NextResponse.json(
      {
        attempt: serializeAttempt(attempt.toObject() as Parameters<typeof serializeAttempt>[0]),
        message: "Exam submitted",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit exam error:", error);
    return jsonError("Server error", 500);
  }
}
