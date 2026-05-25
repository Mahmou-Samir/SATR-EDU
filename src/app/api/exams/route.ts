import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { serializePublicExam } from "@/lib/exam-serialize";
import Exam from "@/models/Exam";
import ExamAttempt from "@/models/ExamAttempt";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }
    if (session.role !== "student") {
      return jsonError("Only students can view exams", 403);
    }

    await connectToDatabase();
    const exams = await Exam.find({ status: "published" }).sort({ publishedAt: -1 }).lean();

    const teacherIds = [...new Set(exams.map((e) => String(e.teacherId)))];
    const teachers = await User.find({
      _id: { $in: teacherIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .select("name")
      .lean();
    const teacherMap = new Map(teachers.map((t) => [String(t._id), t.name as string]));

    const attempts = await ExamAttempt.find({
      userId: new mongoose.Types.ObjectId(session.userId),
      examId: { $in: exams.map((e) => e._id) },
    }).lean();
    const attemptMap = new Map(
      attempts.map((a) => [String(a.examId), { percent: a.percent as number }])
    );

    return NextResponse.json({
      exams: exams.map((doc) => {
        const attempt = attemptMap.get(String(doc._id));
        return serializePublicExam(doc as Parameters<typeof serializePublicExam>[0], {
          teacherName: teacherMap.get(String(doc.teacherId)),
          hasAttempt: Boolean(attempt),
          lastScore: attempt?.percent,
        });
      }),
    });
  } catch (error) {
    console.error("Student exams list error:", error);
    return jsonError("Server error", 500);
  }
}
