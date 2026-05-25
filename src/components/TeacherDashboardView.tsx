"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { TeacherDashboardPayload } from "@/lib/teacher-dashboard-service";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRelative(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return locale.startsWith("ar") ? "اليوم" : "Today";
  if (days === 1) return locale.startsWith("ar") ? "أمس" : "Yesterday";
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export default function TeacherDashboardView() {
  const t = useTranslations("TeacherDashboard");
  const tCourses = useTranslations("Courses");
  const locale = useLocale();

  const [data, setData] = useState<TeacherDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teacher/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.loadFailed"));
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.loadFailed"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const courseTitle = (id: string, customTitle?: string) => {
    if (customTitle) return customTitle;
    try {
      return tCourses(`items.${id}.title`);
    } catch {
      return id;
    }
  };

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const q = studentSearch.trim().toLowerCase();
    if (!q) return data.allStudents;
    return data.allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.gradeLevel?.toLowerCase().includes(q) ?? false)
    );
  }, [data, studentSearch]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          <button type="button" className="btn btn-primary btn-sm" onClick={load}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.teacher.name.split(" ")[0];

  return (
    <div className="dashboard teacher-dashboard">
      <div className="sidebar">
        <div className="sidebar-user">
          <div className="sidebar-ava teacher-ava">{initials(data.teacher.name)}</div>
          <div className="sidebar-name">{data.teacher.name}</div>
          <div className="sidebar-role teacher-badge">{t("sidebar.badge")}</div>
          {data.teacher.bio && <p className="teacher-bio">{data.teacher.bio}</p>}
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-nav-label">{t("sidebar.navMain")}</div>
          {(
            [
              ["overview", "📊", "sidebar.overview", null],
              ["courses", "📚", "sidebar.courses", "/teacher/courses"],
              ["exams", "📝", "sidebar.exams", "/teacher/exams"],
              ["students", "👥", "sidebar.students", null],
              ["analytics", "📈", "sidebar.analytics", null],
            ] as const
          ).map(([id, icon, labelKey, href]) =>
            href ? (
              <Link key={id} href={href} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="sidebar-nav-item">
                  <span className="nav-icon">{icon}</span>
                  {t(labelKey)}
                </div>
              </Link>
            ) : (
              <button
                key={id}
                type="button"
                className={`sidebar-nav-item sidebar-nav-btn${activeSection === id ? " active" : ""}`}
                onClick={() => scrollTo(id)}
              >
                <span className="nav-icon">{icon}</span>
                {t(labelKey)}
              </button>
            )
          )}
          <Link href="/chat" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="sidebar-nav-item">
              <span className="nav-icon">💬</span> {t("sidebar.messages")}
            </div>
          </Link>
        </div>
      </div>

      <div className="dash-main teacher-dash-main">
        <div className="dash-header" id="overview">
          <div>
            <div className="dash-greeting">{t("header.greeting", { name: firstName })}</div>
            <div className="dash-date">{t("header.subtitle")}</div>
          </div>
          <div className="dash-header-right teacher-quick-actions">
            <Link href="/teacher/courses" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
              {t("actions.manageCourses")}
            </Link>
            <Link href="/teacher/exams" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
              {t("actions.manageExams")}
            </Link>
            <Link href="/courses" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
              {t("actions.browseCourses")}
            </Link>
            <Link href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
              {t("actions.aiAssist")}
            </Link>
          </div>
        </div>

        <div className="teacher-summary-banner">
          <div className="teacher-summary-item">
            <span className="teacher-summary-val">{data.kpis.completionRate}%</span>
            <span className="teacher-summary-lbl">{t("summary.completion")}</span>
          </div>
          <div className="teacher-summary-item">
            <span className="teacher-summary-val">{data.kpis.totalStudyHoursWeek}h</span>
            <span className="teacher-summary-lbl">{t("summary.studyWeek")}</span>
          </div>
          <div className="teacher-summary-item">
            <span className="teacher-summary-val">{data.kpis.atRiskCount}</span>
            <span className="teacher-summary-lbl">{t("summary.atRisk")}</span>
          </div>
          <div className="teacher-summary-item">
            <span className="teacher-summary-val">
              {data.kpis.totalStudents > 0
                ? Math.round((data.kpis.activeThisWeek / data.kpis.totalStudents) * 100)
                : 0}
              %
            </span>
            <span className="teacher-summary-lbl">{t("summary.engagement")}</span>
          </div>
        </div>

        {data.insights.length > 0 && (
          <div className="teacher-insights-row">
            {data.insights.map((insight) => (
              <div key={insight.id} className={`teacher-insight teacher-insight-${insight.tone}`}>
                <span>
                  {t(insight.messageKey as "insights.atRisk", {
                    ...insight.params,
                    courseTitle: insight.params.courseId
                      ? courseTitle(String(insight.params.courseId))
                      : "",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="kpi-grid teacher-kpi-grid">
          <div className="kpi">
            <div className="kpi-icon">👥</div>
            <div className="kpi-val">{data.kpis.totalStudents}</div>
            <div className="kpi-label">{t("kpis.totalStudents")}</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">✅</div>
            <div className="kpi-val">{data.kpis.activeThisWeek}</div>
            <div className="kpi-label">{t("kpis.activeWeek")}</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📚</div>
            <div className="kpi-val">{data.kpis.coursesTeaching}</div>
            <div className="kpi-label">{t("kpis.courses")}</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📝</div>
            <div className="kpi-val">{data.kpis.totalEnrollments}</div>
            <div className="kpi-label">{t("kpis.enrollments")}</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📊</div>
            <div className="kpi-val">
              {data.kpis.avgClassScore != null ? `${data.kpis.avgClassScore}%` : "—"}
            </div>
            <div className="kpi-label">{t("kpis.avgScore")}</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">🆕</div>
            <div className="kpi-val">+{data.kpis.newEnrollmentsWeek}</div>
            <div className="kpi-label">{t("kpis.newEnrollments")}</div>
          </div>
        </div>

        <div className="dash-grid teacher-charts-grid">
          <div className="chart-card">
            <div className="chart-card-title">{t("chart.enrollmentsTitle")}</div>
            <div className="bar-chart">
              {data.weeklyEnrollments.map((bar) => (
                <div className="bar-col" key={`e-${bar.day}`}>
                  <div className="bar-fill accent" style={{ height: `${bar.heightPercent}%` }} />
                  <div className="bar-x">{t(`chart.days.${bar.day}` as "chart.days.mon")}</div>
                  <div className="bar-count">{bar.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-card-title">{t("chart.studyTitle")}</div>
            <div className="bar-chart">
              {data.weeklyStudyMinutes.map((bar) => (
                <div className="bar-col" key={`s-${bar.day}`}>
                  <div className="bar-fill primary" style={{ height: `${bar.heightPercent}%` }} />
                  <div className="bar-x">{t(`chart.days.${bar.day}` as "chart.days.mon")}</div>
                  <div className="bar-count">{bar.minutes}m</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="teacher-two-col" id="analytics">
          <div className="teacher-panel">
            <div className="streak-title">{t("breakdown.gradeTitle")}</div>
            {data.gradeBreakdown.length === 0 ? (
              <p className="dash-empty">{t("breakdown.empty")}</p>
            ) : (
              <div className="teacher-breakdown-list">
                {data.gradeBreakdown.map((item) => (
                  <div className="teacher-breakdown-row" key={item.label}>
                    <div className="teacher-breakdown-label">
                      <span>{item.label}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="teacher-mini-bar">
                      <div className="teacher-mini-fill" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="teacher-panel">
            <div className="streak-title">{t("breakdown.trackTitle")}</div>
            {data.trackBreakdown.length === 0 ? (
              <p className="dash-empty">{t("breakdown.empty")}</p>
            ) : (
              <div className="teacher-breakdown-list">
                {data.trackBreakdown.map((item) => (
                  <div className="teacher-breakdown-row" key={item.label}>
                    <div className="teacher-breakdown-label">
                      <span>{item.label}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="teacher-mini-bar">
                      <div
                        className="teacher-mini-fill track-fill"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div id="courses" className="dash-section-head">
          <span>{t("courses.title")}</span>
          <span className="dash-section-sub">{t("courses.subtitle")}</span>
        </div>
        <div className="teacher-course-grid">
          {data.courses.map((course) => (
            <article className="teacher-course-card" key={course.courseId}>
              <div className="teacher-course-card-thumb" style={{ background: course.gradient }}>
                {course.emoji}
              </div>
              <h3 className="teacher-course-card-title">
                {courseTitle(course.courseId, course.title)}
              </h3>
              <div className="teacher-course-card-meta">
                <span>{course.enrolledCount} {t("courses.students")}</span>
                <span>·</span>
                <span>{course.activeStudents} {t("courses.active")}</span>
              </div>
              <div className="teacher-course-card-progress">
                <div className="teacher-mini-bar">
                  <div className="teacher-mini-fill" style={{ width: `${course.avgProgress}%` }} />
                </div>
                <span>{course.avgProgress}% {t("courses.progress")}</span>
              </div>
              {course.avgScore != null && (
                <div className="teacher-course-card-score">
                  ⭐ {t("courses.avgScore", { score: course.avgScore })}
                </div>
              )}
              <Link
                href={`/courses?highlight=${course.courseId}`}
                className="teacher-course-card-link"
              >
                {t("courses.manage")} →
              </Link>
            </article>
          ))}
        </div>

        <div className="teacher-panel" id="activity">
          <div className="streak-title">{t("activity.title")}</div>
          <div className="teacher-activity-list teacher-activity-list-tall">
            {data.recentActivity.length === 0 ? (
              <p className="dash-empty">{t("activity.empty")}</p>
            ) : (
              data.recentActivity.map((item) => (
                <div className="teacher-activity-item" key={item.id}>
                  <div className="teacher-activity-ava">{initials(item.studentName)}</div>
                  <div className="teacher-activity-body">
                    <div className="teacher-activity-name">{item.studentName}</div>
                    <div className="teacher-activity-meta">
                      {courseTitle(item.courseId)} · {t(`activity.${item.type}` as "activity.lesson")}{" "}
                      · {t("activity.minutes", { minutes: item.minutes })}
                      {item.score != null && ` · ${t("activity.score", { score: item.score })}`}
                    </div>
                    <div className="teacher-activity-time">{formatRelative(item.at, locale)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="teacher-two-col">
          <div className="teacher-panel">
            <div className="dash-section-head" style={{ marginBottom: "0.5rem" }}>
              <span>{t("attention.title")}</span>
            </div>
            <p className="teacher-panel-sub">{t("attention.subtitle")}</p>
            {data.studentsNeedingAttention.length === 0 ? (
              <p className="dash-empty">{t("attention.empty")}</p>
            ) : (
              <div className="teacher-student-cards">
                {data.studentsNeedingAttention.map((s) => (
                  <div className="teacher-student-card warn" key={s.id}>
                    <div className="teacher-student-card-head">
                      <strong>{s.name}</strong>
                      <span className="text-warn">{s.avgProgress}%</span>
                    </div>
                    <div className="teacher-email">{s.email}</div>
                    <div className="teacher-student-card-meta">
                      {s.gradeLevel ?? "—"} ·{" "}
                      {s.lastActive ? formatRelative(s.lastActive, locale) : t("attention.never")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="teacher-panel">
            <div className="dash-section-head" style={{ marginBottom: "0.5rem" }}>
              <span>{t("topStudents.title")}</span>
            </div>
            {data.topStudents.length === 0 ? (
              <p className="dash-empty">{t("topStudents.empty")}</p>
            ) : (
              <div className="teacher-student-cards">
                {data.topStudents.map((s, i) => (
                  <div className="teacher-student-card" key={s.id}>
                    <div className="teacher-student-card-head">
                      <strong>
                        #{i + 1} {s.name}
                      </strong>
                      <span className="teacher-score-badge">{s.avgScore}%</span>
                    </div>
                    <div className="teacher-student-card-meta">
                      {s.enrolledCount} {t("topStudents.courses")} · {s.avgProgress}%{" "}
                      {t("topStudents.progress")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div id="students" className="dash-section-head">
          <span>{t("students.title")}</span>
          <input
            type="search"
            className="teacher-search"
            placeholder={t("students.searchPlaceholder")}
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />
        </div>
        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>{t("students.colName")}</th>
                <th>{t("students.colGrade")}</th>
                <th>{t("students.colTrack")}</th>
                <th>{t("students.colCourses")}</th>
                <th>{t("students.colProgress")}</th>
                <th>{t("students.colScore")}</th>
                <th>{t("students.colStudy")}</th>
                <th>{t("students.colLastActive")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="dash-empty">
                    {t("students.empty")}
                  </td>
                </tr>
              ) : (
                filteredStudents.slice(0, 50).map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                      <div className="teacher-email">{s.email}</div>
                    </td>
                    <td>{s.gradeLevel ?? "—"}</td>
                    <td>{s.academicTrack ?? "—"}</td>
                    <td>{s.enrolledCount}</td>
                    <td>
                      <div className="teacher-mini-bar">
                        <div className="teacher-mini-fill" style={{ width: `${s.avgProgress}%` }} />
                      </div>
                      {s.avgProgress}%
                    </td>
                    <td>{s.avgScore != null ? `${s.avgScore}%` : "—"}</td>
                    <td>{s.totalStudyMinutes}m</td>
                    <td>
                      {s.lastActive ? formatRelative(s.lastActive, locale) : t("attention.never")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
