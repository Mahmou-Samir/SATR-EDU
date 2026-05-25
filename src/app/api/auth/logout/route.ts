import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_ROLE_COOKIE,
  PENDING_PROFILE_COOKIE,
} from "@/lib/auth-constants";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(AUTH_COOKIE, "", opts);
  response.cookies.set(AUTH_ROLE_COOKIE, "", opts);
  response.cookies.set(PENDING_PROFILE_COOKIE, "", opts);
  return response;
}
