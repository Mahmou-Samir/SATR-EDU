import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { getDashboardForUser } from "@/lib/dashboard-service";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    if (session.role === "teacher" || session.role === "admin") {
      return jsonError("Use the teacher dashboard", 403);
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select("-password");
    if (!user) {
      return jsonError("User not found", 404);
    }

    const dashboard = await getDashboardForUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gradeLevel: user.gradeLevel ?? undefined,
      academicTrack: user.academicTrack ?? undefined,
      interests: user.interests ?? undefined,
      schoolName: user.schoolName ?? undefined,
      preferredLanguage: user.preferredLanguage ?? undefined,
      studyGoals: user.studyGoals ?? undefined,
      graduationYear: user.graduationYear ?? undefined,
    });

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Dashboard error:", error);
    return jsonError("Server error", 500);
  }
}
