import type { CourseLevel } from "@/lib/courses-catalog";

const LEVEL_ORDER: Record<CourseLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function gradeToLevel(gradeLevel?: string): CourseLevel {
  if (!gradeLevel) return "intermediate";

  if (
    gradeLevel.includes("7") ||
    gradeLevel.includes("8") ||
    gradeLevel.includes("9")
  ) {
    return "beginner";
  }

  if (gradeLevel.includes("University") || gradeLevel.includes("12")) {
    return "advanced";
  }

  return "intermediate";
}

export function levelDistance(a: CourseLevel, b: CourseLevel): number {
  return Math.abs(LEVEL_ORDER[a] - LEVEL_ORDER[b]);
}

export function daysUntilGraduationExam(graduationYear?: string): number | null {
  if (!graduationYear) return null;
  const year = parseInt(graduationYear, 10);
  if (Number.isNaN(year)) return null;

  const examDate = new Date(year, 5, 15);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);

  const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}
