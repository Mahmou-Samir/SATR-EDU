"use client";

import "./TeacherExamsManager.css";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { ExamQuestion } from "@/lib/exam-types";
import type { SerializedExam } from "@/lib/exam-serialize";

type TeacherExamEditorProps = {
  examId: string;
  onClose: () => void;
  onSaved: () => void;
};

function emptyQuestion(): ExamQuestion {
  return {
    id: crypto.randomUUID(),
    type: "mcq",
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    points: 1,
  };
}

export default function TeacherExamEditor({ examId, onClose, onSaved }: TeacherExamEditorProps) {
  const t = useTranslations("TeacherExams");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [ocrUsed, setOcrUsed] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/teacher/exams/${examId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.exam) throw new Error(json.error || t("errors.load"));
        const exam = json.exam as SerializedExam;
        setTitle(exam.title);
        setDurationMinutes(exam.durationMinutes);
        setQuestions(exam.questions?.length ? exam.questions : [emptyQuestion()]);
        setOcrUsed(Boolean(exam.ocrUsed));
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("errors.load")))
      .finally(() => setLoading(false));
  }, [examId, t]);

  const updateQuestion = (index: number, patch: Partial<ExamQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/teacher/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, durationMinutes, questions }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.save"));
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm(t("confirmRegenerate"))) return;
    setRegenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/teacher/exams/${examId}/regenerate`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.regenerate"));
      const exam = json.exam as SerializedExam;
      setQuestions(exam.questions ?? []);
      setOcrUsed(Boolean(json.ocrUsed ?? exam.ocrUsed));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.regenerate"));
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <EditorBackdrop className="teacher-exam-editor-backdrop" onClick={onClose}>
      <EditorPanel className="teacher-exam-editor" onClick={(e) => e.stopPropagation()}>
        <header className="teacher-exam-editor-header">
          <h2>{t("editExam")}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </header>

        {loading ? (
          <p>{t("loading")}</p>
        ) : (
          <>
            {error && <p className="teacher-exams-error">{error}</p>}

            <div className="teacher-exam-editor-meta">
              <span className="teacher-exam-badge ai">✨ {t("aiGenerated")}</span>
              {ocrUsed && <span className="teacher-exam-badge ocr">📷 {t("ocrUsed")}</span>}
            </div>

            <label className="teacher-exam-editor-field">
              {t("form.title")}
              <input value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} />
            </label>
            <label className="teacher-exam-editor-field">
              {t("form.duration")}
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 30)}
              />
            </label>

            <div className="teacher-exam-editor-toolbar">
              <h3>{t("editQuestions")}</h3>
              <div className="teacher-exam-editor-toolbar-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleRegenerate}
                  disabled={regenerating || saving}
                >
                  {regenerating ? t("regenerating") : t("regenerateAi")}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
                >
                  {t("addQuestion")}
                </button>
              </div>
            </div>

            <div className="teacher-exam-editor-questions">
              {questions.map((q, qi) => (
                <article key={q.id} className="teacher-exam-editor-q">
                  <div className="teacher-exam-editor-q-head">
                    <strong>{t("questionLabel", { n: qi + 1 })}</strong>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setQuestions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== qi)))
                      }
                    >
                      {t("removeQuestion")}
                    </button>
                  </div>
                  <label>
                    {t("promptLabel")}
                    <textarea
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                      rows={3}
                    />
                  </label>
                  <div className="teacher-exam-editor-options">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="teacher-exam-editor-option">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === oi}
                          onChange={() => updateQuestion(qi, { correctIndex: oi })}
                        />
                        <input
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          placeholder={t("optionPlaceholder", { n: oi + 1 })}
                        />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="teacher-exam-editor-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
                {t("cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || regenerating}
              >
                {saving ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </>
        )}
      </EditorPanel>
    </EditorBackdrop>
  );
}

function EditorBackdrop({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
}

function EditorPanel({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
}) {
  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
}
