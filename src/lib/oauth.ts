import { cookies } from "next/headers";
import crypto from "crypto";

export const OAUTH_STATE_COOKIE = "oauth_state";
export const OAUTH_LOCALE_COOKIE = "oauth_locale";

export type OAuthProvider = "google" | "github";

export type OAuthProfile = {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

function appOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function oauthCallbackUrl(provider: OAuthProvider): string {
  return `${appOrigin()}/api/auth/oauth/${provider}/callback`;
}

export function createOAuthState(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function setOAuthCookies(state: string, locale: string) {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  cookieStore.set(OAUTH_STATE_COOKIE, state, opts);
  cookieStore.set(OAUTH_LOCALE_COOKIE, locale, opts);
}

export async function readOAuthCookies() {
  const cookieStore = await cookies();
  return {
    state: cookieStore.get(OAUTH_STATE_COOKIE)?.value,
    locale: cookieStore.get(OAUTH_LOCALE_COOKIE)?.value ?? "en",
  };
}

export async function clearOAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  cookieStore.set(OAUTH_LOCALE_COOKIE, "", { path: "/", maxAge: 0 });
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "User", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function fetchGoogleProfile(code: string): Promise<OAuthProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: oauthCallbackUrl("google"),
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || "Google token exchange failed");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const user = await userRes.json();
  if (!user.email) throw new Error("Google account has no email");

  const { firstName, lastName } = splitName(user.name || user.email.split("@")[0]);

  return {
    provider: "google",
    providerId: user.sub,
    email: user.email.toLowerCase(),
    name: user.name || `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    avatar: user.picture,
  };
}

export async function fetchGitHubProfile(code: string): Promise<OAuthProfile> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth is not configured");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: oauthCallbackUrl("github"),
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || "GitHub token exchange failed");
  }

  const headers = {
    Authorization: `Bearer ${tokenData.access_token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "Satr-Edu-Web",
  };

  const userRes = await fetch("https://api.github.com/user", { headers });
  const user = await userRes.json();

  let email = user.email as string | undefined;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    const emails = await emailsRes.json();
    const primary = emails.find((e: { primary: boolean; verified: boolean; email: string }) => e.primary && e.verified);
    email = primary?.email ?? emails.find((e: { verified: boolean; email: string }) => e.verified)?.email;
  }

  if (!email) throw new Error("GitHub account has no public email. Make it visible in GitHub settings.");

  const displayName = user.name || user.login;
  const { firstName, lastName } = splitName(displayName);

  return {
    provider: "github",
    providerId: String(user.id),
    email: email.toLowerCase(),
    name: displayName,
    firstName,
    lastName,
    avatar: user.avatar_url,
  };
}

export function googleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google OAuth is not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: oauthCallbackUrl("google"),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function githubAuthUrl(state: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) throw new Error("GitHub OAuth is not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: oauthCallbackUrl("github"),
    scope: "user:email read:user",
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
