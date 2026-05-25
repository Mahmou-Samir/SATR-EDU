"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { DashboardPayload } from "@/lib/dashboard-service";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStudyMinutes(minutes: number, locale: string): string {
  if (minutes >= 60) {
    const hours = Math.round((minutes / 60) * 10) / 10;
    return locale.startsWith("ar") ? `${hours} س` : `${hours}h`;
  }
  return locale.startsWith("ar") ? `${minutes} د` : `${minutes}m`;
}

function greetingKey(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function DashboardView() {
  const t = useTranslations("Dashboard");
  const tCourses = useTranslations("Courses");
  const locale = useLocale();

  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumingId, setResumingId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || t("errors.loadFailed"));
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.loadFailed"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const courseTitle = (courseId: string, customTitle?: string) => {
    if (customTitle) return customTitle;
    try {
      return tCourses(`items.${courseId}.title`);
    } catch {
      return courseId;
    }
  };

  const courseAuthor = (courseId: string) => {
    try {
      return tCourses(`items.${courseId}.author`);
    } catch {
      return "";
    }
  };

  const handleResume = async (courseId: string) => {
    setResumingId(courseId);
    try {
      const res = await fetch(`/api/enrollments/${courseId}`, { method: "PATCH" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("errors.resumeFailed"));
      }
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.resumeFailed"));
    } finally {
      setResumingId(null);
    }
  };

  const displayName = data?.user.name ?? t("sidebar.guestName");
  const firstName = displayName.split(" ")[0];
  const avatar = initials(displayName);

  const roleLabel = useMemo(() => {
    if (data?.user.gradeLevel && data?.user.academicTrack) {
      return `${data.user.gradeLevel} · ${data.user.academicTrack}`;
    }
    return t("sidebar.defaultTrack");
  }, [data, t]);

  const dateHint = useMemo(() => {
    if (data?.examDaysLeft != null) {
      return t("header.examHint", { days: data.examDaysLeft });
    }
    const dateStr = new Date().toLocaleDateString(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    return t("header.dateToday", { date: dateStr });
  }, [data, locale, t]);

  const xpLabel = data
    ? t("sidebar.xpDynamic", {
        level: data.xp.level,
        current: data.xp.current,
        max: data.xp.max,
      })
    : t("sidebar.xpLabel");

  if (loading) {
    return (
      <div className="dashboard dashboard-loading">
        <div className="dash-loading-card">{t("loading")}</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dashboard dashboard-loading">
        <div className="dash-loading-card">
          <p>{error}</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={loadDashboard}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const studyTimeDisplay = formatStudyMinutes(data.kpis.studyMinutesToday, locale);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-user">
          <div className="sidebar-ava">{avatar}</div>
          <div className="sidebar-name">{displayName}</div>
          <div className="sidebar-role">{roleLabel}</div>
          {data.user.interests && data.user.interests.length > 0 && (
            <div className="sidebar-interests">
              {data.user.interests.slice(0, 3).map((interest) => (
                <span key={interest} className="sidebar-interest-tag">
                  {tCourses(`filters.subjects.${interest}` as "filters.subjects.math")}
                </span>
              ))}
            </div>
          )}
          <div className="sidebar-xp">
            <div className="sidebar-xp-fill" style={{ width: `${data.xp.percent}%` }} />
          </div>
          <div className="sidebar-xp-label">{xpLabel}</div>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-nav-label">{t("sidebar.navMain")}</div>
          <div className="sidebar-nav-item active">
            <span className="nav-icon">📊</span> {t("sidebar.overview")}
          </div>
          <Link href="/courses" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="sidebar-nav-item">
              <span className="nav-icon">🎓</span> {t("sidebar.myCourses")}
              {data.enrolledCount > 0 && (
                <span className="nav-badge">{data.enrolledCount}</span>
              )}
            </div>
          </Link>
          <Link href="/chat" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="sidebar-nav-item">
              <span className="nav-icon">🤖</span> {t("sidebar.aiTutor")}{" "}
              <span className="nav-badge">{t("sidebar.aiTutorBadge")}</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-greeting">
              {t(`greetings.${greetingKey()}`)}, {firstName} 👋
            </div>
            <div className="dash-date">{dateHint}</div>
          </div>
          <div className="dash-header-right">
            <Link href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
              {t("header.askAi")}
            </Link>
          </div>
        </div>

        {error && <div className="login-error dash-inline-error">{error}</div>}

        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-icon">📚</div>
            <div className="kpi-val">{data.kpis.lessonsCompleted}</div>
            <div className="kpi-label">{t("kpis.lessons")}</div>
            <div className={`kpi-change ${data.kpis.lessonsChange >= 0 ? "kpi-up" : ""}`}>
              {data.kpis.lessonsChange >= 0
                ? t("kpis.lessonsChangeUp", { count: data.kpis.lessonsChange })
                : t("kpis.lessonsChangeDown", { count: Math.abs(data.kpis.lessonsChange) })}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">⏱</div>
            <div className="kpi-val">{studyTimeDisplay}</div>
            <div className="kpi-label">{t("kpis.studyTime")}</div>
            <div className="kpi-change kpi-up">
              {data.kpis.studyMinutesToday > 0
                ? t("kpis.studyTimeActive")
                : t("kpis.studyTimeEmpty")}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📊</div>
            <div className="kpi-val">{data.kpis.avgScore != null ? `${data.kpis.avgScore}%` : "—"}</div>
            <div className="kpi-label">{t("kpis.avgScore")}</div>
            <div className="kpi-change kpi-up">
              {data.kpis.avgScoreChange != null
                ? t("kpis.avgScoreChange", { change: data.kpis.avgScoreChange })
                : t("kpis.avgScoreEmpty")}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">🔥</div>
            <div className="kpi-val">{data.kpis.streak}</div>
            <div className="kpi-label">{t("kpis.streak")}</div>
            <div className="kpi-change" style={{ color: "var(--al)" }}>
              {data.kpis.streak > 0 ? t("kpis.streakEncourage") : t("kpis.streakStart")}
            </div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="chart-card">
            <div className="chart-card-head">
              <div className="chart-card-title">{t("chart.title")}</div>
            </div>
            <div className="bar-chart">
              {data.weeklyChart.map((bar) => (
                <div className="bar-col" key={bar.day}>
                  <div
                    className={`bar-fill ${bar.examPercent > bar.scorePercent ? "accent" : "primary"}`}
                    style={{ height: `${Math.max(bar.scorePercent, bar.examPercent)}%` }}
                  />
                  <div className="bar-x">{t(`chart.days.${bar.day}` as "chart.days.mon")}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "var(--muted)" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--p)" }} />
                {t("chart.legend.score")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "var(--muted)" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--a)" }} />
                {t("chart.legend.exam")}
              </div>
            </div>
          </div>
          <div className="streak-card">
            <div className="streak-title">{t("streak.title", { month: data.streakMonthLabel })}</div>
            <div className="streak-grid">
              {data.streakCalendar.map((cell) => (
                <div key={cell.day} className={`streak-day ${cell.status}`}>
                  {cell.day}
                </div>
              ))}
            </div>
            <div className="streak-stat">
              <div className="streak-num">🔥 {data.kpis.streak}</div>
              <div className="streak-lbl">
                {data.kpis.streak > 0 ? t("streak.labelActive") : t("streak.labelEmpty")}
              </div>
            </div>
          </div>
        </div>

        <div className="dash-section-head">
          <span>{t("courses.sectionTitle")}</span>
          <Link href="/courses">{t("courses.viewAll")}</Link>
        </div>
        <div className="current-courses">
          {data.continueLearning.length === 0 ? (
            <p className="dash-empty">{t("courses.empty")}</p>
          ) : (
            data.continueLearning.map((course) => (
              <div className="current-course" key={course.courseId}>
                <div className="cc-thumb" style={{ background: course.gradient }}>
                  {course.emoji}
                </div>
                <div className="cc-info">
                  <div className="cc-title">{courseTitle(course.courseId, course.title)}</div>
                  <div className="cc-sub">
                    {t("courses.lessonProgress", {
                      current: course.currentLesson,
                      total: course.totalLessons,
                      author: courseAuthor(course.courseId),
                    })}
                  </div>
                  <div className="cc-progress-bar">
                    <div className="cc-fill" style={{ width: `${course.progressPercent}%` }} />
                  </div>
                </div>
                <div className="cc-pct">{course.progressPercent}%</div>
                <button
                  type="button"
                  className="cc-resume"
                  disabled={resumingId === course.courseId}
                  onClick={() => handleResume(course.courseId)}
                >
                  {resumingId === course.courseId ? t("courses.resuming") : t("courses.resume")}
                </button>
              </div>
            ))
          )}
        </div>

        {data.recommendations.length > 0 && (
          <>
            <div className="dash-section-head">
              <span>{t("recommendations.title")}</span>
              <span className="dash-section-sub">{t("recommendations.subtitle")}</span>
            </div>
            <div className="dash-rec-grid">
              {data.recommendations.map((rec) => (
                <div className="dash-rec-card" key={rec.courseId}>
                  <div className="dash-rec-thumb" style={{ background: rec.gradient }}>
                    {rec.emoji}
                  </div>
                  <div className="dash-rec-body">
                    <div className="dash-rec-title">{courseTitle(rec.courseId, rec.title)}</div>
                    <div className="dash-rec-meta">
                      {tCourses(`filters.levels.${rec.level}` as "filters.levels.beginner")} · ⭐ {rec.rating}
                    </div>
                    <div className="dash-rec-reason">
                      {t(`recommendations.reasons.${rec.reason}` as "recommendations.reasons.interest")}
                    </div>
                    <Link
                      href={`/courses?highlight=${rec.courseId}`}
                      className="dash-rec-cta"
                    >
                      {rec.isFree ? t("recommendations.startFree") : t("recommendations.viewCourse")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ai-suggest">
          <div className="ai-suggest-head">
            <span className="ai-spark">✨</span>
            <div className="ai-suggest-title">{t("aiSuggestions.title")}</div>
          </div>
          <div className="ai-suggest-items">
            {data.aiSuggestions.map((item) => (
              <div className="ai-suggest-item" key={item.id}>
                <span className="ai-suggest-text">
                  {t(item.messageKey as "aiSuggestions.interestMatch", {
                    ...item.params,
                    courseTitle: item.params.courseId
                      ? courseTitle(String(item.params.courseId))
                      : "",
                    subjectLabel: item.params.subject
                      ? tCourses(
                          `filters.subjects.${item.params.subject}` as "filters.subjects.math"
                        )
                      : "",
                  })}
                </span>
                <Link href={item.actionHref} className="ai-suggest-action" style={{ textDecoration: "none" }}>
                  {t(item.actionKey as "aiSuggestions.continue")}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
