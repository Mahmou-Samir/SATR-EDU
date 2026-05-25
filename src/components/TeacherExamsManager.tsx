"use client";

import "./TeacherExamsManager.css";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { SerializedExam } from "@/lib/exam-serialize";
import type { UnifiedCourse } from "@/lib/courses-service";
import TeacherExamEditor from "./TeacherExamEditor";

export default function TeacherExamsManager() {
  const t = useTranslations("TeacherExams");

  const [exams, setExams] = useState<SerializedExam[]>([]);
  const [courses, setCourses] = useState<UnifiedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [courseId, setCourseId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [publishNow, setPublishNow] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState("10");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [examsRes, coursesRes] = await Promise.all([
        fetch("/api/teacher/exams"),
        fetch("/api/teacher/courses"),
      ]);
      const examsJson = await examsRes.json();
      const coursesJson = await coursesRes.json();
      if (!examsRes.ok) throw new Error(examsJson.error || t("errors.load"));
      setExams(examsJson.exams ?? []);
      if (coursesRes.ok) setCourses(coursesJson.courses ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setTitle("");
    setPdf(null);
    setCourseId("");
    setDurationMinutes("30");
    setPublishNow(true);
    setFormOpen(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdf) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("pdf", pdf);
    formData.append("title", title);
    if (courseId) formData.append("courseId", courseId);
    formData.append("durationMinutes", durationMinutes);
    formData.append("questionCount", questionCount);
    formData.append("publish", publishNow ? "true" : "false");

    try {
      const res = await fetch("/api/teacher/exams", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.upload"));
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.upload"));
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = async (exam: SerializedExam) => {
    setActionId(exam.id);
    setError("");
    const nextStatus = exam.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/teacher/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.publish"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.publish"));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    setActionId(examId);
    setError("");
    try {
      const res = await fetch(`/api/teacher/exams/${examId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.delete"));
      if (previewId === examId) setPreviewId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.delete"));
    } finally {
      setActionId(null);
    }
  };

  const previewExam = exams.find((e) => e.id === previewId);

  return (
    <div className="teacher-exams-page">
      <header className="teacher-exams-header">
        <div>
          <Link href="/teacher" className="teacher-exams-back">
            ← {t("backToDashboard")}
          </Link>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
          {t("uploadExam")}
        </button>
      </header>

      {error && <p className="teacher-exams-error">{error}</p>}

      {formOpen && (
        <div className="teacher-exams-modal-backdrop" onClick={() => !uploading && resetForm()}>
          <form
            className="teacher-exams-form"
            onSubmit={handleUpload}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{t("uploadExam")}</h2>
            <label>
              {t("form.title")}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("form.titlePlaceholder")}
                required
                minLength={3}
              />
            </label>
            <label>
              {t("form.pdf")}
              <input
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              />
              <span className="teacher-exams-hint">{t("form.pdfHint")}</span>
              <span className="teacher-exams-hint">{t("form.aiHint")}</span>
            </label>
            <label>
              {t("form.course")}
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">{t("form.courseNone")}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title ?? c.id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("form.duration")}
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </label>
            <label>
              {t("form.questionCount")}
              <input
                type="number"
                min={3}
                max={20}
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
              />
            </label>
            <label className="teacher-exams-checkbox">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
              />
              {t("form.publishNow")}
            </label>
            <div className="teacher-exams-form-actions">
              <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={uploading}>
                {t("cancel")}
              </button>
              <button type="submit" className="btn btn-primary" disabled={uploading || !pdf}>
                {uploading ? t("aiGenerating") : t("uploadExam")}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="teacher-exams-loading">{t("loading")}</div>
      ) : exams.length === 0 ? (
        <div className="teacher-exams-empty">
          <p>{t("empty")}</p>
          <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
            {t("uploadFirst")}
          </button>
        </div>
      ) : (
        <div className="teacher-exams-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="teacher-exam-card">
              <div className="teacher-exam-card-top">
                <span className={`teacher-exam-status status-${exam.status}`}>
                  {exam.status === "published" ? t("published") : t("draft")}
                </span>
                {exam.sourcePdfName && (
                  <span className="teacher-exam-pdf" title={exam.sourcePdfName}>
                    📄 PDF
                  </span>
                )}
              </div>
              <h3>{exam.title}</h3>
              <p className="teacher-exam-meta">
                {exam.questionCount} {t("questions")} · {exam.durationMinutes} {t("minutes")}
                {exam.aiGenerated && <> · ✨ {t("aiGenerated")}</>}
                {exam.ocrUsed && <> · 📷 {t("ocrUsed")}</>}
                {typeof exam.attemptCount === "number" && (
                  <> · {exam.attemptCount} {t("attempts")}</>
                )}
              </p>
              <div className="teacher-exam-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditId(exam.id)}
                >
                  {t("edit")}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPreviewId(previewId === exam.id ? null : exam.id)}
                >
                  {previewId === exam.id ? t("hidePreview") : t("preview")}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={actionId === exam.id}
                  onClick={() => togglePublish(exam)}
                >
                  {actionId === exam.id
                    ? t("publishing")
                    : exam.status === "published"
                      ? t("unpublish")
                      : t("publish")}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={actionId === exam.id}
                  onClick={() => handleDelete(exam.id)}
                >
                  {actionId === exam.id ? t("deleting") : t("delete")}
                </button>
              </div>
              {previewId === exam.id && previewExam?.questions && (
                <ol className="teacher-exam-preview">
                  {previewExam.questions.map((q, i) => (
                    <li key={q.id}>
                      <strong>
                        {i + 1}. {q.prompt}
                      </strong>
                      <ul>
                        {q.options.map((opt, idx) => (
                          <li key={idx} className={idx === q.correctIndex ? "correct" : ""}>
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          ))}
        </div>
      )}

      {editId && (
        <TeacherExamEditor examId={editId} onClose={() => setEditId(null)} onSaved={load} />
      )}
    </div>
  );
}
