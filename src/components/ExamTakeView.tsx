"use client";

import "./ExamTakeView.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { SerializedExamForTake } from "@/lib/exam-serialize";

type ExamTakeViewProps = {
  examId: string;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamTakeView({ examId }: ExamTakeViewProps) {
  const t = useTranslations("Exams");

  const [exam, setExam] = useState<SerializedExamForTake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    percent: number;
  } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/exams/${examId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.loadExam"));
      const data = json.exam as SerializedExamForTake;
      setExam(data);
      if (data.existingAttempt) {
        setResult({
          score: data.existingAttempt.score,
          maxScore: data.existingAttempt.maxScore,
          percent: data.existingAttempt.percent,
        });
      } else {
        setSecondsLeft(data.durationMinutes * 60);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.loadExam"));
    } finally {
      setLoading(false);
    }
  }, [examId, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev != null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, result]);

  const questions = exam?.questions ?? [];
  const current = questions[currentIndex];

  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => answers[q.id] !== undefined),
    [questions, answers]
  );

  const submitExam = useCallback(async () => {
    if (!exam || result) return;
    setSubmitting(true);
    setError("");

    const payload = {
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? -1,
      })),
      durationMinutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
    };

    try {
      const res = await fetch(`/api/exams/${examId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.submit"));
      setResult({
        score: json.attempt.score,
        maxScore: json.attempt.maxScore,
        percent: json.attempt.percent,
      });
      setSecondsLeft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.submit"));
    } finally {
      setSubmitting(false);
    }
  }, [exam, result, questions, answers, examId, startedAt, t]);

  useEffect(() => {
    if (secondsLeft === 0 && exam && !result && !submitting) {
      submitExam();
    }
  }, [secondsLeft, exam, result, submitting, submitExam]);

  const selectOption = (questionId: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  if (loading) {
    return <div className="exam-take-loading">{t("loadingExam")}</div>;
  }

  if (!exam) {
    return (
      <div className="exam-take-page">
        <p className="exam-take-error">{error || t("errors.loadExam")}</p>
        <Link href="/exams" className="btn btn-ghost">
          {t("backToList")}
        </Link>
      </div>
    );
  }

  if (result) {
    const message =
      result.percent >= 80 ? t("resultGreat") : result.percent >= 50 ? t("resultGood") : t("resultRetry");
    return (
      <div className="exam-take-page">
        <div className="exam-take-result">
          <h1>{t("resultTitle")}</h1>
          <p className="exam-take-result-score">
            {t("resultScore", {
              score: result.score,
              max: result.maxScore,
              percent: result.percent,
            })}
          </p>
          <p>{message}</p>
          <div className="exam-take-result-actions">
            <Link href="/exams" className="btn btn-ghost">
              {t("backToList")}
            </Link>
            <Link href="/dashboard" className="btn btn-primary">
              {t("goDashboard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-take-page">
      <header className="exam-take-header">
        <Link href="/exams" className="exam-take-back">
          ← {t("backToList")}
        </Link>
        <h1>{exam.title}</h1>
        {secondsLeft !== null && (
          <div className={`exam-take-timer${secondsLeft <= 60 ? " urgent" : ""}`}>
            {secondsLeft > 0 ? t("timeLeft", { time: formatTime(secondsLeft) }) : t("timeUp")}
          </div>
        )}
      </header>

      {error && <p className="exam-take-error">{error}</p>}

      {current && (
        <div className="exam-take-card">
          <div className="exam-take-progress">
            {t("question", { current: currentIndex + 1, total: questions.length })}
          </div>
          <h2 className="exam-take-prompt">{current.prompt}</h2>
          <div className="exam-take-options">
            {current.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                className={`exam-take-option${answers[current.id] === idx ? " selected" : ""}`}
                onClick={() => selectOption(current.id, idx)}
              >
                <span className="exam-take-option-label">{String.fromCharCode(65 + idx)}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
          <div className="exam-take-nav">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              {t("prev")}
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={answers[current.id] === undefined}
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                {t("next")}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!allAnswered || submitting}
                onClick={submitExam}
              >
                {submitting ? t("submitting") : t("submit")}
              </button>
            )}
          </div>
          {!allAnswered && currentIndex === questions.length - 1 && (
            <p className="exam-take-hint">{t("selectOption")}</p>
          )}
        </div>
      )}

      <div className="exam-take-dots">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            type="button"
            className={`exam-take-dot${idx === currentIndex ? " active" : ""}${
              answers[q.id] !== undefined ? " answered" : ""
            }`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Question ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
