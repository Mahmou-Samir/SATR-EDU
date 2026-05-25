import type { CourseSubject } from "@/lib/courses-catalog";
import type { UnifiedCourse } from "@/lib/courses-service";
import { gradeToLevel, levelDistance } from "@/lib/grade-mapping";
import { trackToSubjects } from "@/lib/track-mapping";

export type RecommendUser = {
  interests?: string[];
  gradeLevel?: string;
  academicTrack?: string;
  studyGoals?: string;
  preferredLanguage?: string;
  graduationYear?: string;
};

export type ScoredCourse = {
  course: UnifiedCourse;
  score: number;
  reasons: ("interest" | "track" | "grade" | "rating" | "free" | "goals")[];
};

export function scoreCourse(
  course: UnifiedCourse,
  user: RecommendUser,
  enrolledIds: Set<string>
): ScoredCourse {
  const reasons: ScoredCourse["reasons"] = [];
  let score = 5;

  if (enrolledIds.has(course.id)) {
    return { course, score: -100, reasons };
  }

  if (user.interests?.includes(course.subject)) {
    score += 40;
    reasons.push("interest");
  }

  const targetLevel = gradeToLevel(user.gradeLevel);
  const dist = levelDistance(targetLevel, course.level);
  if (dist === 0) {
    score += 20;
    reasons.push("grade");
  } else if (dist === 1) {
    score += 10;
    reasons.push("grade");
  }

  const trackSubjects = trackToSubjects(user.academicTrack);
  if (trackSubjects.includes(course.subject)) {
    score += 15;
    reasons.push("track");
  }

  if (course.rating >= 4.5) {
    score += 5;
    reasons.push("rating");
  }

  if (course.isFree) {
    score += 5;
    reasons.push("free");
  }

  const goals = (user.studyGoals ?? "").toLowerCase();
  if (goals) {
    const keywords: Record<string, CourseSubject[]> = {
      math: ["math"],
      calculus: ["math"],
      physics: ["physics"],
      chemistry: ["chemistry"],
      biology: ["biology"],
      arabic: ["arabic"],
      english: ["english"],
      python: ["programming"],
      program: ["programming"],
      history: ["history"],
    };
    for (const [word, subjects] of Object.entries(keywords)) {
      if (goals.includes(word) && subjects.includes(course.subject)) {
        score += 12;
        reasons.push("goals");
        break;
      }
    }
  }

  if (user.preferredLanguage === "en" && course.subject === "english") {
    score += 8;
  }
  if (user.preferredLanguage === "ar" && course.subject === "arabic") {
    score += 8;
  }

  return { course, score, reasons };
}

export function getRecommendedCourses(
  user: RecommendUser,
  catalog: UnifiedCourse[],
  enrolledIds: Set<string>,
  limit = 6
): ScoredCourse[] {
  return catalog
    .map((course) => scoreCourse(course, user, enrolledIds))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function primaryReason(reasons: ScoredCourse["reasons"]): ScoredCourse["reasons"][number] {
  const priority: ScoredCourse["reasons"] = ["interest", "track", "grade", "goals", "rating", "free"];
  for (const key of priority) {
    if (reasons.includes(key)) return key;
  }
  return "rating";
}
