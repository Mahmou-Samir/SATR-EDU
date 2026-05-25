import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { AUTH_COOKIE, AUTH_ROLE_COOKIE, PENDING_PROFILE_COOKIE } from "./lib/auth-constants";

const intlMiddleware = createMiddleware(routing);

const studentPaths = ["/dashboard", "/exams"];
const teacherPaths = ["/teacher"];

function isTeacherRole(role: string | undefined): boolean {
  return role === "teacher" || role === "admin";
}

/** Normalize path: "" or "/" both mean root */
function normalizePath(p: string): string {
  return p === "" ? "/" : p;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass API routes through immediately — no auth checks
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const localeMatch = pathname.match(/^\/(en|ar)(\/.*)?$/);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const rawPath = localeMatch?.[2] ?? pathname;
  const pathWithoutLocale = normalizePath(rawPath);

  const token = request.cookies.get(AUTH_COOKIE)?.value?.trim();
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value?.trim();
  const pendingProfile = request.cookies.get(PENDING_PROFILE_COOKIE)?.value?.trim();
  const teacherUser = isTeacherRole(role);
  const isAuthenticated = Boolean(token);
  const needsProfile = pendingProfile === "1";

  // ── /complete-profile guards ──────────────────────────────────────────────

  // Not logged in → send to login
  if (pathWithoutLocale === "/complete-profile" && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Already complete → send to home (avoid loop)
  if (pathWithoutLocale === "/complete-profile" && isAuthenticated && !needsProfile) {
    const home = teacherUser ? `/${locale}/teacher` : `/${locale}/dashboard`;
    return NextResponse.redirect(new URL(home, request.url));
  }

  // ── Pending profile redirect ─────────────────────────────────────────────
  // Only redirect if we actually have a token + pending flag, and are NOT
  // already on /complete-profile (prevents loops)
  if (
    isAuthenticated &&
    needsProfile &&
    !teacherUser &&
    pathWithoutLocale !== "/complete-profile"
  ) {
    return NextResponse.redirect(new URL(`/${locale}/complete-profile`, request.url));
  }

  // ── Protected route guards ────────────────────────────────────────────────
  const isStudentProtected = studentPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
  const isTeacherProtected = teacherPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

  if ((isStudentProtected || isTeacherProtected) && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("from", pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // Teacher trying to access student area → redirect to teacher dashboard
  if (token && isStudentProtected && teacherUser) {
    return NextResponse.redirect(new URL(`/${locale}/teacher`, request.url));
  }

  // Student trying to access teacher area → redirect to student dashboard
  if (token && isTeacherProtected && role === "student") {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // ── Already logged-in users on /login or /register ───────────────────────
  if (
    (pathWithoutLocale === "/login" || pathWithoutLocale === "/register") &&
    isAuthenticated &&
    !needsProfile
  ) {
    const home = teacherUser ? `/${locale}/teacher` : `/${locale}/dashboard`;
    return NextResponse.redirect(new URL(home, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|ar)/:path*"],
};
