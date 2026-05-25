import { NextRequest, NextResponse } from "next/server";
import { getAllCourses } from "@/lib/courses-service";
import { jsonError } from "@/lib/api-errors";

export async function GET(request: NextRequest) {
  try {
    const courses = await getAllCourses();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses list error:", error);
    return jsonError("Server error", 500);
  }
}
