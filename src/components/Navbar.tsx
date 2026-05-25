"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  const t = useTranslations("Navbar");
  const locale = useLocale();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const dashboardHref = isTeacher ? "/teacher" : "/dashboard";

  return (
    <nav>
      <Link href="/" className="nav-logo" style={{ textDecoration: "none" }}>
        <img src="/logo.jpg" alt="Satr Edu" onError={(e) => (e.currentTarget.style.display = "none")} />
        <div className="nav-logo-text">
          SATR<span style={{ color: "var(--pl)" }}>EDU</span>
        </div>
      </Link>

      {!isAuthPage && (
        <ul className="nav-links">
          <li>
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              {t("home")}
            </Link>
          </li>
          <li>
            <Link href="/courses" className={pathname === "/courses" ? "active" : ""}>
              {t("courses")}
            </Link>
          </li>
          {user && !isTeacher && (
            <li>
              <Link href="/exams" className={pathname.startsWith("/exams") ? "active" : ""}>
                {t("exams")}
              </Link>
            </li>
          )}
          <li>
            <Link href="/chat" className={pathname === "/chat" ? "active" : ""}>
              {t("chat")}
            </Link>
          </li>
          <li>
            <Link href={dashboardHref} className={pathname === dashboardHref ? "active" : ""}>
              {isTeacher ? t("teacherDashboard") : t("dashboard")}
            </Link>
          </li>
        </ul>
      )}

      <div className="nav-right">
        {mounted && (
          <>
            <button
              onClick={toggleLanguage}
              className="btn btn-ghost btn-sm"
              style={{ padding: "0.4rem 0.8rem", fontWeight: "bold" }}
              type="button"
            >
              {locale === "en" ? "عربي" : "EN"}
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "1.2rem", padding: "0.4rem 0.6rem" }}
              type="button"
              aria-label={t("toggleTheme")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </>
        )}

        {user ? (
          <>
            <Link href={dashboardHref} className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
              {isTeacher ? t("teacherDashboard") : t("dashboard")}
            </Link>
            <div className="nav-avatar" title={user.email}>
              {initials(user.name)}
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" type="button">
              {t("logout")}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
              {t("login")}
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
              {t("start")}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
