import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { ensureTeacherAccount } from "@/lib/seed-accounts";
import { getTeacherDashboard } from "@/lib/teacher-dashboard-service";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    if (session.role !== "teacher" && session.role !== "admin") {
      return jsonError("Teacher access only", 403);
    }

    if (process.env.NODE_ENV !== "production") {
      await ensureTeacherAccount(false);
    }

    const dashboard = await getTeacherDashboard(session.userId);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    if (error instanceof Error && error.message === "Not a teacher account") {
      return jsonError(error.message, 403);
    }
    return jsonError("Server error", 500);
  }
}
