"use client";

import "./StudentExamsView.css";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { SerializedPublicExam } from "@/lib/exam-serialize";

export default function StudentExamsView() {
  const t = useTranslations("Exams");
  const [exams, setExams] = useState<SerializedPublicExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/exams");
      const json = await res.json();
      if (res.status === 401) {
        setError(t("errors.login"));
        return;
      }
      if (!res.ok) throw new Error(json.error || t("errors.load"));
      setExams(json.exams ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="student-exams-page">
      <header className="student-exams-header">
        <div>
          <Link href="/dashboard" className="student-exams-back">
            ← {t("goDashboard")}
          </Link>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
      </header>

      {error && <p className="student-exams-error">{error}</p>}

      {loading ? (
        <div className="student-exams-loading">{t("loading")}</div>
      ) : exams.length === 0 ? (
        <div className="student-exams-empty">{t("empty")}</div>
      ) : (
        <div className="student-exams-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="student-exam-card">
              <h3>{exam.title}</h3>
              {exam.teacherName && (
                <p className="student-exam-teacher">{t("byTeacher", { name: exam.teacherName })}</p>
              )}
              <p className="student-exam-meta">
                {exam.questionCount} {t("questions")} · {exam.durationMinutes} {t("minutes")}
              </p>
              {exam.hasAttempt && exam.lastScore != null && (
                <p className="student-exam-score">{t("score", { percent: exam.lastScore })}</p>
              )}
              {exam.hasAttempt ? (
                <Link href={`/exams/${exam.id}`} className="btn btn-ghost btn-sm">
                  {t("viewResult")}
                </Link>
              ) : (
                <Link href={`/exams/${exam.id}`} className="btn btn-primary btn-sm">
                  {t("start")}
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
