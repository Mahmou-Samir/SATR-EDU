"use client";

import "./LoginView.css";
import { Suspense, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const t = useTranslations("Login");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [loginAs, setLoginAs] = useState<"student" | "teacher">("student");

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(oauthError === "invalid_oauth_state" ? t("oauthErrorState") : oauthError);
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, loginAs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errorGeneric"));
      }

      const redirect =
        data.redirectTo ??
        (data.user?.profileComplete === false ? "/complete-profile" : "/dashboard");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = (provider: "google" | "github") => {
    if (oauthLoading) return; // prevent double-click
    setOauthLoading(provider);
    setError("");
    // Use a real navigation — not router.push — so cookies set by the
    // server redirect are received correctly by the browser.
    const url = `/api/auth/oauth/${provider}?locale=${locale}`;
    // Small timeout lets React flush the loading state before navigating
    setTimeout(() => { window.location.assign(url); }, 80);
  };

  return (
    <div className="login-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
          </div>

          <div className="login-role-toggle" role="tablist" aria-label={t("roleLabel")}>
            <button
              type="button"
              role="tab"
              aria-selected={loginAs === "student"}
              className={`login-role-btn${loginAs === "student" ? " active" : ""}`}
              onClick={() => setLoginAs("student")}
            >
              <span className="login-role-icon">🎓</span>
              {t("roleStudent")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loginAs === "teacher"}
              className={`login-role-btn${loginAs === "teacher" ? " active" : ""}`}
              onClick={() => setLoginAs("teacher")}
            >
              <span className="login-role-icon">👨‍🏫</span>
              {t("roleTeacher")}
            </button>
          </div>
          <p className="login-role-hint">
            {loginAs === "student" ? t("roleStudentHint") : t("roleTeacherHint")}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="input-group">
              <label>{t("email")}</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="m2 4 10 8 10-8"></path></svg>
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label>{t("password")}</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary full-width" disabled={isLoading || oauthLoading !== null}>
              {isLoading ? t("loading") : t("submit")}
            </button>
          </form>

          {loginAs === "student" && (
            <>
              <div className="divider">
                <span>{t("or")}</span>
              </div>

              <div className="social-login">
                <button
                  type="button"
                  className={`btn-social${oauthLoading === "google" ? " loading" : ""}`}
                  disabled={isLoading || oauthLoading !== null}
                  onClick={() => signInWithOAuth("google")}
                >
                  {oauthLoading === "google" ? (
                    <span className="oauth-spinner" />
                  ) : (
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" width="20" height="20" />
                  )}
                  <span>{oauthLoading === "google" ? t("oauthLoading") : t("signInGoogle")}</span>
                </button>
                <button
                  type="button"
                  className={`btn-social${oauthLoading === "github" ? " loading" : ""}`}
                  disabled={isLoading || oauthLoading !== null}
                  onClick={() => signInWithOAuth("github")}
                >
                  {oauthLoading === "github" ? (
                    <span className="oauth-spinner" />
                  ) : (
                    <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="" width="20" height="20" className="github-icon" />
                  )}
                  <span>{oauthLoading === "github" ? t("oauthLoading") : t("signInGitHub")}</span>
                </button>
              </div>

              <p className="signup-link">
                {t("noAccount")} <Link href="/register">{t("signup")}</Link>
              </p>
            </>
          )}

          {loginAs === "teacher" && (
            <p className="signup-link login-teacher-demo">
              {t("teacherDemo")}{" "}
              <strong>teacher@satr.edu</strong> / <strong>123456</strong>
              <br />
              <span className="login-teacher-note">{t("teacherDemoNote")}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginView() {
  return (
    <Suspense fallback={<div className="login-wrapper" />}>
      <LoginForm />
    </Suspense>
  );
}
