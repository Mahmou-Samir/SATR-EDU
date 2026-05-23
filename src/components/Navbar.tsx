"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(true);
  
  // خطافات اللغة (Hooks)
  const t = useTranslations("Navbar");
  const locale = useLocale();

  // دالة تغيير اللغة
  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    // بنشيل اللغة القديمة من الرابط ونحط الجديدة
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  // عشان نعرف إحنا في أي صفحة من غير ما اللغة تلخبطنا
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  return (
    <nav>
      <Link href={`/${locale}`} className="nav-logo" style={{ textDecoration: 'none' }}>
        <img src="/logo.jpg" alt="Satr Edu" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="nav-logo-text">SATR<span style={{ color: "var(--pl)" }}>EDU</span></div>
      </Link>
      
      <ul className="nav-links">
        <li><Link href={`/${locale}`} className={pathWithoutLocale === "/" ? "active" : ""}>{t("home")}</Link></li>
        <li><Link href={`/${locale}/courses`} className={pathWithoutLocale === "/courses" ? "active" : ""}>{t("courses")}</Link></li>
        <li><Link href={`/${locale}/chat`} className={pathWithoutLocale === "/chat" ? "active" : ""}>{t("chat")}</Link></li>
        <li><Link href={`/${locale}/dashboard`} className={pathWithoutLocale === "/dashboard" ? "active" : ""}>{t("dashboard")}</Link></li>
      </ul>
      
      <div className="nav-right">
        {mounted && (
          <>
            {/* زرار تغيير اللغة */}
            <button 
              onClick={toggleLanguage}
              className="btn btn-ghost btn-sm"
              style={{ padding: "0.4rem 0.8rem", fontWeight: "bold" }}
            >
              {locale === "en" ? "عربي" : "EN"}
            </button>

            {/* زرار الـ Dark Mode */}
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "1.2rem", padding: "0.4rem 0.6rem" }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </>
        )}
        <button className="btn btn-ghost btn-sm">{t("login")}</button>
        <Link href={`/${locale}/dashboard`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>{t("start")}</Link>
        <div className="nav-avatar">AH</div>
      </div>
    </nav>
  );
}