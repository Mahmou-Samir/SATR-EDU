import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        source: "legacy",
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return jsonError("Server error", 500);
  }
}
