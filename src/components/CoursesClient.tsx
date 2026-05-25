"use client";

import "./CoursesView.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  CATEGORY_TABS,
  COURSE_CATALOG,
  LEVEL_FILTER_KEYS,
  PAGE_SIZE,
  SUBJECT_FILTER_KEYS,
  type CourseCategory,
  type CourseItem,
  type CourseLevel,
  type CourseSubject,
} from "@/lib/courses-catalog";
import type { UnifiedCourse } from "@/lib/courses-service";

type SortKey = "popular" | "rated" | "newest" | "priceLow";
type ViewMode = "grid" | "list";

type Filters = {
  subjects: Set<CourseSubject>;
  levels: Set<CourseLevel>;
  freeOnly: boolean;
  paidOnly: boolean;
  minRating45: boolean;
  minRating40: boolean;
};

const defaultFilters = (): Filters => ({
  subjects: new Set(),
  levels: new Set(),
  freeOnly: false,
  paidOnly: false,
  minRating45: false,
  minRating40: false,
});

function staticCatalog(): UnifiedCourse[] {
  return COURSE_CATALOG.map((course) => ({ ...course, isCustom: false }));
}

function courseTitle(course: UnifiedCourse, t: (key: string) => string) {
  if (course.isCustom && course.title) return course.title;
  try {
    return t(`items.${course.id}.title`);
  } catch {
    return course.title ?? course.id;
  }
}

function courseAuthor(course: UnifiedCourse, t: (key: string) => string) {
  if (course.isCustom && course.author) return course.author;
  try {
    return t(`items.${course.id}.author`);
  } catch {
    return "";
  }
}

function courseTag(course: UnifiedCourse, t: (key: string) => string) {
  if (course.isCustom) return t(`filters.subjects.${course.subject}`);
  try {
    return t(`items.${course.id}.tag`);
  } catch {
    return "";
  }
}

function coursePriceLabel(course: UnifiedCourse, t: (key: string) => string) {
  if (course.isCustom) {
    return course.isFree ? "free" : `${course.price} EGP`;
  }
  try {
    return t(`items.${course.id}.price`);
  } catch {
    return course.isFree ? "free" : `${course.price}`;
  }
}

function courseStudentsLabel(course: UnifiedCourse, t: (key: string) => string) {
  if (course.isCustom) return String(course.students);
  try {
    return t(`items.${course.id}.studentsCount`);
  } catch {
    return String(course.students);
  }
}

function matchesSearch(course: UnifiedCourse, query: string, t: (key: string) => string) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const haystack = [
    courseTitle(course, t),
    courseAuthor(course, t),
    courseTag(course, t),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function sortCourses(courses: UnifiedCourse[], sort: SortKey) {
  const copy = [...courses];
  switch (sort) {
    case "rated":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort(
        (a, b) =>
          Number(b.isCustom ?? b.isNew) - Number(a.isCustom ?? a.isNew) ||
          b.students - a.students
      );
    case "priceLow":
      return copy.sort((a, b) => a.price - b.price);
    default:
      return copy.sort((a, b) => {
        const byStudents = b.students - a.students;
        if (byStudents !== 0) return byStudents;
        return Number(b.isCustom) - Number(a.isCustom);
      });
  }
}

type CoursesClientProps = {
  initialCourses?: UnifiedCourse[];
};

export default function CoursesClient({ initialCourses }: CoursesClientProps) {
  const t = useTranslations("Courses");
  const router = useRouter();
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [catalog, setCatalog] = useState<UnifiedCourse[]>(initialCourses ?? staticCatalog());

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.courses)) setCatalog(data.courses);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        setIsLoggedIn(res.ok);
        if (!res.ok) return null;
        return fetch("/api/enrollments");
      })
      .then((res) => (res?.ok ? res.json() : null))
      .then((data) => {
        if (data?.enrollments) {
          setEnrolledIds(new Set(data.enrollments.map((e: { courseId: string }) => e.courseId)));
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setEnrollingId(courseId);
    setEnrollError("");
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setEnrolledIds((prev) => new Set(prev).add(courseId));
        router.push("/dashboard");
        return;
      }
      setEnrollError(typeof json.error === "string" ? json.error : t("card.enrollError"));
    } catch {
      setEnrollError(t("card.enrollError"));
    } finally {
      setEnrollingId(null);
    }
  };

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [view, setView] = useState<ViewMode>("grid");
  const [category, setCategory] = useState<CourseCategory>("all");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = catalog.filter((course) => {
      if (category !== "all" && course.category !== category) return false;
      if (filters.subjects.size && !filters.subjects.has(course.subject)) return false;
      if (filters.levels.size && !filters.levels.has(course.level)) return false;
      if (filters.freeOnly && !course.isFree) return false;
      if (filters.paidOnly && !filters.freeOnly && course.isFree) return false;
      if (filters.minRating45 && course.rating < 4.5) return false;
      if (filters.minRating40 && !filters.minRating45 && course.rating < 4.0) return false;
      return matchesSearch(course, search, t);
    });
    list = sortCourses(list, sort);
    return list;
  }, [catalog, category, filters, search, sort, t]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const toggleSubject = (subject: CourseSubject) => {
    setFilters((prev) => {
      const next = new Set(prev.subjects);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return { ...prev, subjects: next };
    });
    setPage(1);
  };

  const toggleLevel = (level: CourseLevel) => {
    setFilters((prev) => {
      const next = new Set(prev.levels);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return { ...prev, levels: next };
    });
    setPage(1);
  };

  const toggleSaved = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      subjects: new Set(),
      levels: new Set(),
      freeOnly: false,
      paidOnly: false,
      minRating45: false,
      minRating40: false,
    });
    setCategory("all");
    setSearch("");
    setPage(1);
  };

  const activeFilterCount =
    filters.subjects.size +
    filters.levels.size +
    (filters.freeOnly ? 1 : 0) +
    (filters.paidOnly && !filters.freeOnly ? 1 : 0) +
    (filters.minRating45 ? 1 : 0) +
    (filters.minRating40 && !filters.minRating45 ? 1 : 0) +
    (category !== "all" ? 1 : 0);

  const filterSidebar = (
    <aside className={`courses-filter-sidebar${mobileFiltersOpen ? " open" : ""}`}>
      <div className="filter-mobile-head">
        <span>{t("filters.mobileTitle")}</span>
        <button type="button" className="filter-close" onClick={() => setMobileFiltersOpen(false)}>
          ✕
        </button>
      </div>

      <div className="filter-title">{t("filters.title")}</div>

      <div className="filter-group">
        <div className="filter-group-label">{t("filters.subject")}</div>
        {SUBJECT_FILTER_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="filter-option"
            onClick={() => toggleSubject(key)}
          >
            <div className={`filter-check${filters.subjects.has(key) ? " checked" : ""}`}>
              {filters.subjects.has(key) ? "✓" : ""}
            </div>
            {t(`filters.subjects.${key}`)}
            <span className="filter-count">
              {catalog.filter((c) => c.subject === key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-group-label">{t("filters.level")}</div>
        {LEVEL_FILTER_KEYS.map((key) => (
          <button key={key} type="button" className="filter-option" onClick={() => toggleLevel(key)}>
            <div className={`filter-check${filters.levels.has(key) ? " checked" : ""}`}>
              {filters.levels.has(key) ? "✓" : ""}
            </div>
            {t(`filters.levels.${key}`)}
            <span className="filter-count">
              {catalog.filter((c) => c.level === key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-group-label">{t("filters.price")}</div>
        <button
          type="button"
          className="filter-option"
          onClick={() => {
            setFilters((p) => ({ ...p, freeOnly: !p.freeOnly, paidOnly: false }));
            setPage(1);
          }}
        >
          <div className={`filter-check${filters.freeOnly ? " checked" : ""}`}>
            {filters.freeOnly ? "✓" : ""}
          </div>
          {t("filters.prices.free")}
          <span className="filter-count">{catalog.filter((c) => c.isFree).length}</span>
        </button>
        <button
          type="button"
          className="filter-option"
          onClick={() => {
            setFilters((p) => ({ ...p, paidOnly: !p.paidOnly, freeOnly: false }));
            setPage(1);
          }}
        >
          <div className={`filter-check${filters.paidOnly && !filters.freeOnly ? " checked" : ""}`}>
            {filters.paidOnly && !filters.freeOnly ? "✓" : ""}
          </div>
          {t("filters.prices.paid")}
          <span className="filter-count">{catalog.filter((c) => !c.isFree).length}</span>
        </button>
      </div>

      <div className="filter-group">
        <div className="filter-group-label">{t("filters.rating")}</div>
        <button
          type="button"
          className="filter-option"
          onClick={() => {
            setFilters((p) => ({ ...p, minRating45: !p.minRating45, minRating40: false }));
            setPage(1);
          }}
        >
          <div className={`filter-check${filters.minRating45 ? " checked" : ""}`}>
            {filters.minRating45 ? "✓" : ""}
          </div>
          {t("filters.ratings.stars45")}
        </button>
        <button
          type="button"
          className="filter-option"
          onClick={() => {
            setFilters((p) => ({ ...p, minRating40: !p.minRating40, minRating45: false }));
            setPage(1);
          }}
        >
          <div className={`filter-check${filters.minRating40 && !filters.minRating45 ? " checked" : ""}`}>
            {filters.minRating40 && !filters.minRating45 ? "✓" : ""}
          </div>
          {t("filters.ratings.stars40")}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <button type="button" className="btn btn-ghost filter-clear-btn" onClick={clearFilters}>
          {t("filters.clearAll")}
        </button>
      )}
    </aside>
  );

  return (
    <div className="courses-page">
      <div className="courses-hero">
        <span className="badge badge-purple courses-hero-badge">{t("hero.badge")}</span>
        <h1>{t("hero.title")}</h1>
        <p>{t("hero.subtitle")}</p>

        <div className="courses-hero-stats">
          <div className="courses-stat">
            <span className="courses-stat-num">500+</span>
            <span className="courses-stat-label">{t("hero.stats.total")}</span>
          </div>
          <div className="courses-stat">
            <span className="courses-stat-num">45</span>
            <span className="courses-stat-label">{t("hero.stats.free")}</span>
          </div>
          <div className="courses-stat">
            <span className="courses-stat-num">4.8</span>
            <span className="courses-stat-label">{t("hero.stats.rating")}</span>
          </div>
        </div>

        <form
          className="courses-search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <div className="csearch">
            <span aria-hidden="true" style={{ color: "var(--hint)" }}>
              🔍
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("hero.searchPlaceholder")}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {t("hero.searchButton")}
          </button>
        </form>
      </div>

      <div className="courses-features-bar">
        <div className="courses-feature">🤖 {t("features.aiTutor")}</div>
        <div className="courses-feature">📱 {t("features.mobile")}</div>
        <div className="courses-feature">🎓 {t("features.certificate")}</div>
        <div className="courses-feature">♾️ {t("features.lifetime")}</div>
      </div>

      <div className="courses-layout">
        {mobileFiltersOpen && (
          <button
            type="button"
            className="courses-filter-overlay"
            aria-label={t("filters.close")}
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}
        {filterSidebar}

        <div className="courses-content">
          <div className="courses-toolbar">
            <div className="courses-toolbar-left">
              <button
                type="button"
                className="btn btn-ghost btn-sm courses-filter-toggle"
                onClick={() => setMobileFiltersOpen(true)}
              >
                ⚙ {t("filters.mobileOpen")}{" "}
                {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
              </button>
              <div className="courses-count">
                {t("toolbar.showing")}{" "}
                <strong style={{ color: "var(--text)" }}>
                  {t("toolbar.coursesCount", { count: filtered.length })}
                </strong>{" "}
                {t("toolbar.forFilters")}
              </div>
            </div>
            <div className="courses-toolbar-right">
              <div className="courses-view-toggle">
                <button
                  type="button"
                  className={view === "grid" ? "active" : ""}
                  onClick={() => setView("grid")}
                  title={t("view.grid")}
                >
                  ▦
                </button>
                <button
                  type="button"
                  className={view === "list" ? "active" : ""}
                  onClick={() => setView("list")}
                  title={t("view.list")}
                >
                  ☰
                </button>
              </div>
              <div className="courses-sort">
                {t("toolbar.sortBy")}{" "}
                <select
                  className="sort-select"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortKey);
                    setPage(1);
                  }}
                >
                  <option value="popular">{t("sort.popular")}</option>
                  <option value="rated">{t("sort.rated")}</option>
                  <option value="newest">{t("sort.newest")}</option>
                  <option value="priceLow">{t("sort.priceLow")}</option>
                </select>
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="courses-active-filters">
              {category !== "all" && (
                <button type="button" className="active-filter-chip" onClick={() => setCategory("all")}>
                  {t(`tabs.${category}`)} ✕
                </button>
              )}
              <button type="button" className="active-filter-clear" onClick={clearFilters}>
                {t("filters.clearAll")}
              </button>
            </div>
          )}

          {enrollError && (
            <p className="courses-enroll-error" role="alert">
              {enrollError}
            </p>
          )}

          <div className="courses-cat-tabs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`cat-tab${category === tab.key ? " active" : ""}`}
                onClick={() => {
                  setCategory(tab.key);
                  setPage(1);
                }}
              >
                {t(`tabs.${tab.labelKey}`)}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="courses-empty">
              <div className="courses-empty-icon">🔍</div>
              <h3>{t("empty.title")}</h3>
              <p>{t("empty.subtitle")}</p>
              <button type="button" className="btn btn-primary" onClick={clearFilters}>
                {t("empty.cta")}
              </button>
            </div>
          ) : (
            <>
              <div className={`full-courses-grid${view === "list" ? " list-view" : ""}`}>
                {visible.map((course) => {
                  const priceLabel = coursePriceLabel(course, t);
                  const isFree = course.isFree || priceLabel === "free";
                  const isSaved = saved.has(course.id);

                  return (
                    <article key={course.id} className={`full-course-card${view === "list" ? " list" : ""}`}>
                      <div className="fcc-thumb" style={{ background: course.gradient }}>
                        {course.emoji}
                        {(course.badge || course.isCustom) && (
                          <span className={`fcc-badge badge-${course.badge ?? "new"}`}>
                            {course.isCustom
                              ? t("card.teacherCourse")
                              : course.badge
                                ? t(`badges.${course.badge}`)
                                : t("badges.new")}
                          </span>
                        )}
                        <button
                          type="button"
                          className={`fcc-save${isSaved ? " saved" : ""}`}
                          onClick={() => toggleSaved(course.id)}
                          aria-label={t("card.save")}
                        >
                          {isSaved ? "♥" : "♡"}
                        </button>
                      </div>
                      <div className="fcc-body">
                        <div className="fcc-meta-row">
                          <span className="fcc-tag">{courseTag(course, t)}</span>
                          <span className="fcc-level">{t(`filters.levels.${course.level}`)}</span>
                        </div>
                        <h3 className="fcc-title">{courseTitle(course, t)}</h3>
                        <p className="fcc-author">{courseAuthor(course, t)}</p>
                        <div className="fcc-details">
                          <span>📚 {t("card.lessons", { count: course.lessons })}</span>
                          <span>⏱ {t("card.hours", { count: course.hours })}</span>
                        </div>
                        <div className="fcc-bottom">
                          <span className="fcc-rating">
                            {t("card.rating", { score: course.rating.toFixed(1) })}
                          </span>
                          <span className={`fcc-price${isFree ? " free" : ""}`}>
                            {isFree ? t("card.free") : priceLabel}
                          </span>
                        </div>
                        <p className="fcc-students">
                          {t("card.enrolled", { count: courseStudentsLabel(course, t) })}
                        </p>
                        {enrolledIds.has(course.id) ? (
                          <Link href="/dashboard" className="fcc-enroll btn btn-ghost btn-sm">
                            {t("card.continueLearning")}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="fcc-enroll btn btn-primary btn-sm"
                            disabled={enrollingId === course.id}
                            onClick={() => handleEnroll(course.id)}
                          >
                            {enrollingId === course.id
                              ? t("card.enrolling")
                              : isFree
                                ? t("card.enrollFree")
                                : t("card.enroll")}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {hasMore && (
                <div className="courses-load-more">
                  <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => p + 1)}>
                    {t("loadMore")} ({filtered.length - visible.length} {t("toolbar.remaining")})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
