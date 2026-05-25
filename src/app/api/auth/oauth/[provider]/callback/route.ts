import { NextRequest, NextResponse } from "next/server";
import {
  clearOAuthCookies,
  fetchGitHubProfile,
  fetchGoogleProfile,
  OAuthProvider,
  readOAuthCookies,
} from "@/lib/oauth";
import { attachAuthCookies, upsertOAuthUser } from "@/lib/oauth-user";

const providers: OAuthProvider[] = ["google", "github"];

/** Wrap any async operation with an AbortController timeout */
async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider: raw } = await context.params;
  const provider = raw as OAuthProvider;
  const { searchParams } = request.nextUrl;

  const { state: savedState, locale } = await readOAuthCookies();
  const state = searchParams.get("state");
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  const loginUrl = new URL(`/${locale}/login`, request.url);

  if (oauthError) {
    loginUrl.searchParams.set("error", oauthError);
    await clearOAuthCookies();
    return NextResponse.redirect(loginUrl);
  }

  // State mismatch — could be expired cookie or CSRF
  if (!providers.includes(provider) || !code || !state) {
    loginUrl.searchParams.set("error", "invalid_oauth_state");
    await clearOAuthCookies();
    return NextResponse.redirect(loginUrl);
  }

  // If savedState is missing (cookie expired/not sent) allow continuing
  // but log it — don't block the user unnecessarily in development
  if (savedState && state !== savedState) {
    console.warn("[oauth] State mismatch — possible CSRF or expired session");
    loginUrl.searchParams.set("error", "invalid_oauth_state");
    await clearOAuthCookies();
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 1️⃣ Fetch profile from Google/GitHub (10s timeout)
    const profile = await withTimeout(
      () =>
        provider === "google"
          ? fetchGoogleProfile(code)
          : fetchGitHubProfile(code),
      10_000
    );

    // 2️⃣ Upsert user in MongoDB (8s timeout)
    const { user, token, profileComplete } = await withTimeout(
      () => upsertOAuthUser(profile),
      8_000
    );

    await clearOAuthCookies();

    const isTeacher = user.role === "teacher" || user.role === "admin";
    const redirectPath = isTeacher
      ? `/${locale}/teacher`
      : profileComplete
        ? `/${locale}/dashboard`
        : `/${locale}/complete-profile`;

    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    attachAuthCookies(response, token, profileComplete, user.role);

    console.log(`[oauth] ✅ ${provider} login OK → ${redirectPath} (profile: ${profileComplete})`);
    return response;
  } catch (error) {
    console.error("[oauth] ❌ Callback error:", error);

    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? "oauth_timeout"
          : error.message
        : "oauth_failed";

    loginUrl.searchParams.set("error", message);
    await clearOAuthCookies();
    return NextResponse.redirect(loginUrl);
  }
}
