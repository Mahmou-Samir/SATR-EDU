import { NextRequest, NextResponse } from "next/server";
import {
  createOAuthState,
  githubAuthUrl,
  googleAuthUrl,
  OAuthProvider,
  setOAuthCookies,
} from "@/lib/oauth";

const providers: OAuthProvider[] = ["google", "github"];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider: raw } = await context.params;
  const provider = raw as OAuthProvider;

  if (!providers.includes(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const locale = request.nextUrl.searchParams.get("locale") || "en";
  const state = createOAuthState();

  try {
    await setOAuthCookies(state, locale);

    const url = provider === "google" ? googleAuthUrl(state) : githubAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth failed";
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl);
  }
}
