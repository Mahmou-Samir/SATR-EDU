import type { CourseLevel, CourseSubject } from "@/lib/courses-catalog";

export type CourseInput = {
  title: string;
  price: number;
  isFree: boolean;
  subject: CourseSubject;
  level: CourseLevel;
  lessons: number;
  hours: number;
  emoji?: string;
  description?: string;
};

export function validateCourseInput(body: Record<string, unknown>): {
  ok: true;
  data: CourseInput;
} | {
  ok: false;
  error: string;
} {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const priceRaw = body.price;
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? parseFloat(priceRaw)
        : NaN;
  const isFree = Boolean(body.isFree);
  const subject = typeof body.subject === "string" ? body.subject.trim() : "math";
  const level = typeof body.level === "string" ? body.level.trim() : "intermediate";
  const lessons =
    typeof body.lessons === "number" ? body.lessons : parseInt(String(body.lessons ?? 12), 10);
  const hours =
    typeof body.hours === "number" ? body.hours : parseInt(String(body.hours ?? 10), 10);
  const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "📘";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (title.length < 3) {
    return { ok: false, error: "Course title must be at least 3 characters" };
  }
  if (title.length > 120) {
    return { ok: false, error: "Course title is too long" };
  }
  if (!isFree && (Number.isNaN(price) || price < 0)) {
    return { ok: false, error: "Enter a valid price" };
  }
  if (lessons < 1 || lessons > 200) {
    return { ok: false, error: "Lessons must be between 1 and 200" };
  }
  if (hours < 1 || hours > 500) {
    return { ok: false, error: "Hours must be between 1 and 500" };
  }

  const validSubjects = [
    "math",
    "physics",
    "chemistry",
    "biology",
    "arabic",
    "english",
    "programming",
    "history",
  ];
  const validLevels = ["beginner", "intermediate", "advanced"];

  if (!validSubjects.includes(subject)) {
    return { ok: false, error: "Invalid subject" };
  }
  if (!validLevels.includes(level)) {
    return { ok: false, error: "Invalid level" };
  }

  return {
    ok: true,
    data: {
      title,
      price: isFree ? 0 : Math.round(price),
      isFree,
      subject: subject as CourseSubject,
      level: level as CourseLevel,
      lessons,
      hours,
      emoji: emoji || "📘",
      description,
    },
  };
}
