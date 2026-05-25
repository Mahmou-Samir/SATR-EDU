import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { getCourseById, incrementCourseStudents } from "@/lib/courses-service";
import Enrollment from "@/models/Enrollment";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    await connectToDatabase();
    const enrollments = await Enrollment.find({ userId: session.userId })
      .sort({ lastAccessedAt: -1 })
      .lean();

    return NextResponse.json({
      enrollments: enrollments.map((e) => ({
        courseId: e.courseId,
        progressPercent: e.progressPercent,
        currentLesson: e.currentLesson,
        totalLessons: e.totalLessons,
        lastAccessedAt: e.lastAccessedAt,
      })),
    });
  } catch (error) {
    console.error("Enrollments list error:", error);
    return jsonError("Server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }
    if (session.role !== "student") {
      return jsonError("Only students can enroll in courses", 403);
    }

    const body = await request.json();
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";
    if (!courseId) {
      return jsonError("courseId is required", 400);
    }

    const course = await getCourseById(courseId);
    if (!course) {
      return jsonError("Course not found", 404);
    }

    await connectToDatabase();

    const existing = await Enrollment.findOne({ userId: session.userId, courseId });
    if (existing) {
      return NextResponse.json({
        enrollment: {
          courseId: existing.courseId,
          progressPercent: existing.progressPercent,
          currentLesson: existing.currentLesson,
          totalLessons: existing.totalLessons,
        },
        message: "Already enrolled",
      });
    }

    const enrollment = await Enrollment.create({
      userId: new mongoose.Types.ObjectId(session.userId),
      courseId,
      progressPercent: 0,
      currentLesson: 1,
      totalLessons: course.lessons,
      lastAccessedAt: new Date(),
    });

    await incrementCourseStudents(courseId);

    return NextResponse.json(
      {
        enrollment: {
          courseId: enrollment.courseId,
          progressPercent: enrollment.progressPercent,
          currentLesson: enrollment.currentLesson,
          totalLessons: enrollment.totalLessons,
        },
        message: "Enrolled successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enroll error:", error);
    return jsonError("Server error", 500);
  }
}
