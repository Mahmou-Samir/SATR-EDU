import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { dbToUnified, getCustomCourses } from "@/lib/courses-service";
import { validateCourseInput } from "@/lib/course-validation";
import { subjectToCategory } from "@/lib/courses-service";
import Course from "@/models/Course";
import User from "@/models/User";

function canManageCourses(role: string) {
  return role === "teacher" || role === "admin";
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canManageCourses(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    const teacherId = session.role === "admin" ? undefined : session.userId;
    const courses = await getCustomCourses({ teacherId, publishedOnly: false });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Teacher courses list error:", error);
    return jsonError("Server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageCourses(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    const body = await request.json();
    const parsed = validateCourseInput(body);
    if (!parsed.ok) {
      return jsonError(parsed.error, 400);
    }

    await connectToDatabase();
    const teacher = await User.findById(session.userId);
    if (!teacher) {
      return jsonError("User not found", 404);
    }

    const { data } = parsed;

    const course = await Course.create({
      title: data.title,
      price: data.price,
      isFree: data.isFree,
      teacherId: new mongoose.Types.ObjectId(session.userId),
      teacherName: teacher.name,
      subject: data.subject,
      level: data.level,
      category: subjectToCategory(data.subject),
      lessons: data.lessons,
      hours: data.hours,
      emoji: data.emoji,
      description: data.description || undefined,
      isPublished: true,
    });

    const assigned = new Set(teacher.assignedCourseIds ?? []);
    assigned.add(String(course._id));
    teacher.assignedCourseIds = [...assigned];
    await teacher.save();

    const created = course.toObject();
    return NextResponse.json(
      { course: dbToUnified(created as Parameters<typeof dbToUnified>[0]), message: "Course created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);
    return jsonError("Server error", 500);
  }
}
