import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import Enrollment from "@/models/Enrollment";
import StudySession from "@/models/StudySession";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    const { courseId } = await context.params;
    if (!courseId) {
      return jsonError("Invalid course", 400);
    }

    await connectToDatabase();

    const enrollment = await Enrollment.findOne({ userId: session.userId, courseId });
    if (!enrollment) {
      return jsonError("Not enrolled in this course", 404);
    }

    const nextLesson = Math.min(enrollment.currentLesson + 1, enrollment.totalLessons);
    const progressPercent = Math.round((nextLesson / enrollment.totalLessons) * 100);

    enrollment.currentLesson = nextLesson;
    enrollment.progressPercent = progressPercent;
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    await StudySession.create({
      userId: new mongoose.Types.ObjectId(session.userId),
      date: today,
      minutes: 25,
      score: Math.min(98, 72 + progressPercent / 5),
      courseId,
      type: "lesson",
    });

    return NextResponse.json({
      enrollment: {
        courseId: enrollment.courseId,
        progressPercent: enrollment.progressPercent,
        currentLesson: enrollment.currentLesson,
        totalLessons: enrollment.totalLessons,
        lastAccessedAt: enrollment.lastAccessedAt,
      },
    });
  } catch (error) {
    console.error("Enrollment progress error:", error);
    return jsonError("Server error", 500);
  }
}
