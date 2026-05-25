import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { toPublicQuestions } from "@/lib/exam-serialize";
import type { SerializedExamForTake } from "@/lib/exam-serialize";
import Exam from "@/models/Exam";
import ExamAttempt from "@/models/ExamAttempt";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }
    if (session.role !== "student") {
      return jsonError("Only students can take exams", 403);
    }

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return jsonError("Exam not found", 404);
    }

    await connectToDatabase();
    const exam = await Exam.findOne({ _id: id, status: "published" });
    if (!exam) {
      return jsonError("Exam not found or not published", 404);
    }

    const existing = await ExamAttempt.findOne({
      examId: exam._id,
      userId: new mongoose.Types.ObjectId(session.userId),
    }).lean();

    const payload: SerializedExamForTake = {
      id: String(exam._id),
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      questions: toPublicQuestions(exam.questions),
    };

    if (existing) {
      payload.existingAttempt = {
        score: existing.score,
        maxScore: existing.maxScore,
        percent: existing.percent,
        submittedAt: existing.submittedAt.toISOString(),
      };
    }

    return NextResponse.json({ exam: payload });
  } catch (error) {
    console.error("Get exam for take error:", error);
    return jsonError("Server error", 500);
  }
}
