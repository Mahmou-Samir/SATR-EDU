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
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";

    if (!email || !password || !firstName || !lastName) {
      return jsonError("All required fields must be provided", 400);
    }

    await connectToDatabase();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return jsonError("Email is already registered", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const name = `${firstName} ${lastName}`;
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      name,
      role: "student",
      profileComplete: false,
    });

    const legacyToken = signToken({
      userId: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: "Account created",
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE, legacyToken, authCookieOptions(60 * 60 * 24 * 7));
    response.cookies.set(AUTH_ROLE_COOKIE, user.role, authCookieOptions(60 * 60 * 24 * 7));

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return jsonError("Server error. Please try again.", 500);
  }
}
