"use client";

import "./TeacherCoursesManager.css";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { UnifiedCourse } from "@/lib/courses-service";
import {
  LEVEL_FILTER_KEYS,
  SUBJECT_FILTER_KEYS,
  type CourseLevel,
  type CourseSubject,
} from "@/lib/courses-catalog";

type CourseForm = {
  title: string;
  price: string;
  isFree: boolean;
  subject: CourseSubject;
  level: CourseLevel;
  lessons: string;
  hours: string;
  emoji: string;
  description: string;
};

const emptyForm = (): CourseForm => ({
  title: "",
  price: "0",
  isFree: false,
  subject: "math",
  level: "intermediate",
  lessons: "12",
  hours: "10",
  emoji: "📘",
  description: "",
});

type ApiCourse = UnifiedCourse;

export default function TeacherCoursesManager() {
  const t = useTranslations("TeacherCourses");
  const tCourses = useTranslations("Courses");

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teacher/courses");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.load"));
      setCourses(json.courses ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (course: ApiCourse) => {
    setEditingId(course.id);
    setForm({
      title: course.title ?? "",
      price: String(course.price),
      isFree: course.isFree,
      subject: course.subject,
      level: course.level,
      lessons: String(course.lessons),
      hours: String(course.hours),
      emoji: course.emoji,
      description: course.description ?? "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      price: form.isFree ? 0 : parseFloat(form.price) || 0,
      isFree: form.isFree,
      subject: form.subject,
      level: form.level,
      lessons: parseInt(form.lessons, 10) || 12,
      hours: parseInt(form.hours, 10) || 10,
      emoji: form.emoji,
      description: form.description,
    };

    try {
      const url = editingId ? `/api/teacher/courses/${editingId}` : "/api/teacher/courses";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.save"));

      closeForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/teacher/courses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("errors.delete"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (course: ApiCourse) => {
    if (course.isFree) return tCourses("card.free");
    return `${course.price} EGP`;
  };

  return (
    <div className="teacher-courses-page">
      <div className="teacher-courses-header">
        <div>
          <Link href="/teacher" className="teacher-courses-back">
            ← {t("backToDashboard")}
          </Link>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          {t("addCourse")}
        </button>
      </div>

      {error && <div className="login-error teacher-courses-error">{error}</div>}

      {loading ? (
        <p className="teacher-courses-loading">{t("loading")}</p>
      ) : courses.length === 0 ? (
        <div className="teacher-courses-empty">
          <p>{t("empty")}</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            {t("addFirst")}
          </button>
        </div>
      ) : (
        <div className="teacher-courses-grid">
          {courses.map((course) => (
            <article key={course.id} className="teacher-course-manage-card">
              <div className="teacher-course-manage-thumb" style={{ background: course.gradient }}>
                {course.emoji}
              </div>
              <h3>{course.title}</h3>
              <p className="teacher-course-manage-meta">
                {tCourses(`filters.subjects.${course.subject}`)} ·{" "}
                {tCourses(`filters.levels.${course.level}`)}
              </p>
              <p className="teacher-course-manage-price">{formatPrice(course)}</p>
              <p className="teacher-course-manage-stats">
                {course.lessons} {t("lessons")} · {course.hours}h · {course.students} {t("students")}
              </p>
              <div className="teacher-course-manage-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(course)}>
                  {t("edit")}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm teacher-btn-danger"
                  disabled={deletingId === course.id}
                  onClick={() => handleDelete(course.id)}
                >
                  {deletingId === course.id ? t("deleting") : t("delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="teacher-course-modal-overlay" onClick={closeForm}>
          <div
            className="teacher-course-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>{editingId ? t("editCourse") : t("newCourse")}</h2>
            <form onSubmit={handleSubmit} className="teacher-course-form">
              <label>
                {t("form.title")}
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={120}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t("form.titlePlaceholder")}
                />
              </label>

              <label className="teacher-checkbox">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                />
                {t("form.isFree")}
              </label>

              {!form.isFree && (
                <label>
                  {t("form.price")}
                  <input
                    type="number"
                    min={0}
                    step={1}
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </label>
              )}

              <div className="teacher-form-row">
                <label>
                  {t("form.subject")}
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value as CourseSubject })
                    }
                  >
                    {SUBJECT_FILTER_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {tCourses(`filters.subjects.${key}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t("form.level")}
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value as CourseLevel })}
                  >
                    {LEVEL_FILTER_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {tCourses(`filters.levels.${key}`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="teacher-form-row">
                <label>
                  {t("form.lessons")}
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={form.lessons}
                    onChange={(e) => setForm({ ...form, lessons: e.target.value })}
                  />
                </label>
                <label>
                  {t("form.hours")}
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  />
                </label>
                <label>
                  {t("form.emoji")}
                  <input
                    type="text"
                    maxLength={4}
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  />
                </label>
              </div>

              <label>
                {t("form.description")}
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t("form.descriptionPlaceholder")}
                />
              </label>

              <div className="teacher-course-form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeForm}>
                  {t("cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t("saving") : editingId ? t("saveChanges") : t("createCourse")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
