import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken, authCookieOptions } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { AUTH_COOKIE, AUTH_ROLE_COOKIE } from "@/lib/auth-constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return jsonError("Email and password are required", 400);
    }

    await connectToDatabase();
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return jsonError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return jsonError("Invalid email or password", 401);
    }

    const legacyToken = signToken({
      userId: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
    });

    const isTeacherLike = user.role === "teacher" || user.role === "admin";
    const redirectTo = isTeacherLike ? "/teacher" : "/dashboard";

    const response = NextResponse.json({
      message: "Login successful",
      redirectTo,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
      },
    });

    response.cookies.set(AUTH_COOKIE, legacyToken, authCookieOptions(60 * 60 * 24 * 7));
    response.cookies.set(AUTH_ROLE_COOKIE, user.role, authCookieOptions(60 * 60 * 24 * 7));

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return jsonError("Server error. Please try again.", 500);
  }
}
