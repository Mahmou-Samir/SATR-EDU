import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./auth-constants";

export { AUTH_COOKIE };

export type SessionPayload = {
  userId: string;
  role: "admin" | "student" | "teacher";
  email: string;
  name: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return "dev-only-change-in-production";
  }
  return secret;
}

export function signToken(payload: Omit<SessionPayload, "email" | "name"> & Partial<Pick<SessionPayload, "email" | "name">>) {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;
    if (!decoded?.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function authCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
