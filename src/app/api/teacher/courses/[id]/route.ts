import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { dbToUnified } from "@/lib/courses-service";
import { validateCourseInput } from "@/lib/course-validation";
import { subjectToCategory } from "@/lib/courses-service";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";

type RouteContext = { params: Promise<{ id: string }> };

function canManageCourses(role: string) {
  return role === "teacher" || role === "admin";
}

async function getOwnedCourse(courseId: string, session: { userId: string; role: string }) {
  if (!mongoose.isValidObjectId(courseId)) {
    return null;
  }
  await connectToDatabase();
  const course = await Course.findById(courseId);
  if (!course) return null;
  if (session.role !== "admin" && String(course.teacherId) !== session.userId) {
    return "forbidden" as const;
  }
  return course;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || !canManageCourses(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    const { id } = await context.params;
    const course = await getOwnedCourse(id, session);
    if (course === null) {
      return jsonError("Course not found", 404);
    }
    if (course === "forbidden") {
      return jsonError("You can only edit your own courses", 403);
    }

    const body = await request.json();
    const parsed = validateCourseInput(body);
    if (!parsed.ok) {
      return jsonError(parsed.error, 400);
    }

    const { data } = parsed;

    course.title = data.title;
    course.price = data.price;
    course.isFree = data.isFree;
    course.subject = data.subject;
    course.level = data.level;
    course.category = subjectToCategory(data.subject);
    course.lessons = data.lessons;
    course.hours = data.hours;
    course.emoji = data.emoji ?? course.emoji;
    course.description = data.description || undefined;

    await course.save();

    return NextResponse.json({
      course: dbToUnified(course.toObject() as Parameters<typeof dbToUnified>[0]),
      message: "Course updated",
    });
  } catch (error) {
    console.error("Update course error:", error);
    return jsonError("Server error", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || !canManageCourses(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    const { id } = await context.params;
    const course = await getOwnedCourse(id, session);
    if (course === null) {
      return jsonError("Course not found", 404);
    }
    if (course === "forbidden") {
      return jsonError("You can only delete your own courses", 403);
    }

    await Enrollment.deleteMany({ courseId: id });
    await course.deleteOne();

    const teacher = await User.findById(session.userId);
    if (teacher?.assignedCourseIds) {
      teacher.assignedCourseIds = teacher.assignedCourseIds.filter((cid) => cid !== id);
      await teacher.save();
    }

    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    console.error("Delete course error:", error);
    return jsonError("Server error", 500);
  }
}
