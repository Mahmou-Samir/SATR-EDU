import { connectToDatabase } from "@/lib/mongodb";
import { getAllCourses, getCourseById, type UnifiedCourse } from "@/lib/courses-service";
import type { CourseLevel, CourseSubject } from "@/lib/courses-catalog";
import { daysUntilGraduationExam } from "@/lib/grade-mapping";
import {
  getRecommendedCourses,
  primaryReason,
  type RecommendUser,
} from "@/lib/recommendations";
import Enrollment from "@/models/Enrollment";
import StudySession from "@/models/StudySession";
import mongoose from "mongoose";
import type { IUser } from "@/types/user";

export type DashboardEnrollment = {
  courseId: string;
  title?: string;
  progressPercent: number;
  currentLesson: number;
  totalLessons: number;
  emoji: string;
  gradient: string;
  subject: CourseSubject;
  level: CourseLevel;
  lastAccessedAt: string;
  isCustom?: boolean;
};

export type DashboardRecommendation = {
  courseId: string;
  title?: string;
  score: number;
  reason: string;
  emoji: string;
  gradient: string;
  subject: string;
  level: string;
  rating: number;
  isFree: boolean;
  lessons: number;
  isCustom?: boolean;
};

export type DashboardPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    gradeLevel?: string;
    academicTrack?: string;
    interests?: string[];
    schoolName?: string;
    preferredLanguage?: string;
    studyGoals?: string;
    graduationYear?: string;
  };
  xp: { level: number; current: number; max: number; percent: number };
  kpis: {
    lessonsCompleted: number;
    lessonsChange: number;
    studyMinutesToday: number;
    avgScore: number | null;
    avgScoreChange: number | null;
    streak: number;
  };
  examDaysLeft: number | null;
  weeklyChart: { day: string; scorePercent: number; examPercent: number }[];
  streakCalendar: { day: number; status: "empty" | "done" | "partial" | "today" }[];
  streakMonthLabel: string;
  continueLearning: DashboardEnrollment[];
  recommendations: DashboardRecommendation[];
  aiSuggestions: {
    id: string;
    messageKey: string;
    params: Record<string, string | number>;
    actionKey: string;
    actionHref: string;
  }[];
  enrolledCount: number;
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatStudyMinutes(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.round((minutes / 60) * 10) / 10;
    return `${hours}h`;
  }
  return `${minutes}m`;
}

function computeStreak(sessionDates: Date[]): number {
  if (sessionDates.length === 0) return 0;

  const days = new Set(sessionDates.map((d) => startOfDay(d).getTime()));
  let streak = 0;
  const cursor = startOfDay(new Date());

  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildStreakCalendar(sessionDates: Date[]): {
  days: DashboardPayload["streakCalendar"];
  monthLabel: string;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const byDay = new Map<number, number>();
  for (const date of sessionDates) {
    if (date.getMonth() !== month || date.getFullYear() !== year) continue;
    const day = date.getDate();
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const days: DashboardPayload["streakCalendar"] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const count = byDay.get(day) ?? 0;
    if (day > today) {
      days.push({ day, status: "empty" });
    } else if (day === today) {
      days.push({ day, status: count > 0 ? "today" : "today" });
    } else if (count >= 2) {
      days.push({ day, status: "done" });
    } else if (count === 1) {
      days.push({ day, status: "partial" });
    } else {
      days.push({ day, status: "empty" });
    }
  }

  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return { days, monthLabel };
}

function buildWeeklyChart(
  sessions: { date: Date; score?: number; type: string }[]
): DashboardPayload["weeklyChart"] {
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const now = new Date();
  const result: DashboardPayload["weeklyChart"] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const daySessions = sessions.filter((s) => s.date >= dayStart && s.date < dayEnd);
    const scores = daySessions.filter((s) => s.score != null).map((s) => s.score as number);
    const exams = daySessions.filter((s) => s.type === "exam" && s.score != null).map((s) => s.score as number);

    const scorePercent =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const examPercent =
      exams.length > 0 ? Math.round(exams.reduce((a, b) => a + b, 0) / exams.length) : scorePercent * 0.85;

    result.push({
      day: dayKeys[date.getDay()],
      scorePercent: Math.max(scorePercent, daySessions.length > 0 ? 40 : 8),
      examPercent: Math.max(examPercent, 8),
    });
  }

  return result;
}

function buildAiSuggestions(
  user: RecommendUser,
  enrollments: DashboardEnrollment[],
  recommendations: DashboardRecommendation[]
): DashboardPayload["aiSuggestions"] {
  const suggestions: DashboardPayload["aiSuggestions"] = [];
  const topInterest = user.interests?.[0];
  const topRec = recommendations[0];
  const inProgress = enrollments.find((e) => e.progressPercent > 0 && e.progressPercent < 100);

  if (topInterest && topRec) {
    suggestions.push({
      id: "interest-rec",
      messageKey: "aiSuggestions.interestMatch",
      params: { subject: topInterest },
      actionKey: "aiSuggestions.browseCourses",
      actionHref: `/courses?subject=${topInterest}`,
    });
  }

  const examDays = daysUntilGraduationExam(user.graduationYear);
  if (examDays != null && examDays <= 30) {
    const examCourse =
      recommendations.find((r) => r.subject === "chemistry" || r.subject === "math") ??
      recommendations[0];
    if (examCourse) {
      suggestions.push({
        id: "exam-prep",
        messageKey: "aiSuggestions.examPrep",
        params: { days: examDays, courseId: examCourse.courseId },
        actionKey: "aiSuggestions.startQuiz",
        actionHref: "/chat",
      });
    }
  }

  if (inProgress) {
    const lessonsLeft = inProgress.totalLessons - inProgress.currentLesson;
    if (lessonsLeft > 0 && lessonsLeft <= 5) {
      suggestions.push({
        id: "finish-course",
        messageKey: "aiSuggestions.finishCourse",
        params: { courseId: inProgress.courseId, lessonsLeft },
        actionKey: "aiSuggestions.continue",
        actionHref: `/courses?highlight=${inProgress.courseId}`,
      });
    }
  }

  if (suggestions.length === 0 && topRec) {
    suggestions.push({
      id: "start-rec",
      messageKey: "aiSuggestions.startRecommended",
      params: { courseId: topRec.courseId },
      actionKey: "aiSuggestions.continue",
      actionHref: `/courses?highlight=${topRec.courseId}`,
    });
  }

  return suggestions.slice(0, 3);
}

async function ensureStarterEnrollments(
  userId: mongoose.Types.ObjectId,
  recommendUser: RecommendUser,
  enrolledIds: Set<string>,
  catalog: UnifiedCourse[]
) {
  const scored = getRecommendedCourses(recommendUser, catalog, enrolledIds, 3);
  if (scored.length === 0) return;

  const docs = scored.map(({ course }, index) => ({
    userId,
    courseId: course.id,
    progressPercent: 0,
    currentLesson: 1,
    totalLessons: course.lessons,
    lastAccessedAt: new Date(Date.now() - index * 3600_000),
  }));

  await Enrollment.insertMany(docs, { ordered: false }).catch(() => {
    /* ignore duplicate key */
  });
}

export async function getDashboardForUser(user: IUser): Promise<DashboardPayload> {
  await connectToDatabase();

  const allCourses = await getAllCourses();

  const userObjectId = new mongoose.Types.ObjectId(String(user._id));
  const userId = String(user._id);
  const recommendUser: RecommendUser = {
    interests: user.interests ?? [],
    gradeLevel: user.gradeLevel,
    academicTrack: user.academicTrack,
    studyGoals: user.studyGoals,
    preferredLanguage: user.preferredLanguage,
    graduationYear: user.graduationYear,
  };

  let enrollments = await Enrollment.find({ userId }).sort({ lastAccessedAt: -1 }).lean();
  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  if (enrollments.length === 0) {
    await ensureStarterEnrollments(userObjectId, recommendUser, enrolledIds, allCourses);
    enrollments = await Enrollment.find({ userId }).sort({ lastAccessedAt: -1 }).lean();
    enrolledIds.clear();
    enrollments.forEach((e) => enrolledIds.add(e.courseId));
  }

  const sessions = await StudySession.find({ userId })
    .sort({ date: -1 })
    .limit(200)
    .lean();

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const todayStart = startOfDay(now);
  const sessionsToday = sessions.filter((s) => s.date >= todayStart);
  const sessionsThisWeek = sessions.filter((s) => s.date >= weekAgo);
  const sessionsLastWeek = sessions.filter((s) => s.date >= twoWeeksAgo && s.date < weekAgo);

  const lessonsCompleted = enrollments.reduce(
    (sum, e) => sum + Math.max(0, e.currentLesson - 1),
    0
  );
  const lessonsThisWeek = sessionsThisWeek.filter((s) => s.type === "lesson").length;
  const lessonsLastWeek = sessionsLastWeek.filter((s) => s.type === "lesson").length;

  const studyMinutesToday = sessionsToday.reduce((sum, s) => sum + s.minutes, 0);

  const scoresThisWeek = sessionsThisWeek.filter((s) => s.score != null).map((s) => s.score as number);
  const scoresLastWeek = sessionsLastWeek.filter((s) => s.score != null).map((s) => s.score as number);
  const avgScore =
    scoresThisWeek.length > 0
      ? Math.round(scoresThisWeek.reduce((a, b) => a + b, 0) / scoresThisWeek.length)
      : null;
  const avgLast =
    scoresLastWeek.length > 0
      ? Math.round(scoresLastWeek.reduce((a, b) => a + b, 0) / scoresLastWeek.length)
      : null;
  const avgScoreChange =
    avgScore != null && avgLast != null ? avgScore - avgLast : null;

  const streak = computeStreak(sessions.map((s) => s.date));
  const { days: streakCalendar, monthLabel } = buildStreakCalendar(sessions.map((s) => s.date));

  const xpCurrent = lessonsCompleted * 80 + streak * 25;
  const xpLevel = Math.max(1, Math.floor(xpCurrent / 600) + 1);
  const xpMax = xpLevel * 600;
  const xpInLevel = xpCurrent % 600 || (xpCurrent > 0 ? 600 : 0);

  const continueLearning = (
    await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await getCourseById(enrollment.courseId);
        if (!course) return null;
        return {
          courseId: enrollment.courseId,
          title: course.title,
          isCustom: course.isCustom,
          progressPercent: enrollment.progressPercent,
          currentLesson: enrollment.currentLesson,
          totalLessons: enrollment.totalLessons,
          emoji: course.emoji,
          gradient: course.gradient,
          subject: course.subject,
          level: course.level,
          lastAccessedAt: enrollment.lastAccessedAt.toISOString(),
        } satisfies DashboardEnrollment;
      })
    )
  )
    .filter((item) => item !== null)
    .slice(0, 5);

  const scoredRecs = getRecommendedCourses(recommendUser, allCourses, enrolledIds, 6);
  const recommendations: DashboardRecommendation[] = scoredRecs.map(({ course, score, reasons }) => ({
    courseId: course.id,
    title: course.title,
    isCustom: course.isCustom,
    score,
    reason: primaryReason(reasons),
    emoji: course.emoji,
    gradient: course.gradient,
    subject: course.subject,
    level: course.level,
    rating: course.rating,
    isFree: course.isFree,
    lessons: course.lessons,
  }));

  const weeklyChart = buildWeeklyChart(
    sessions.map((s) => ({ date: s.date, score: s.score ?? undefined, type: s.type }))
  );

  const aiSuggestions = buildAiSuggestions(recommendUser, continueLearning, recommendations);

  return {
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      gradeLevel: user.gradeLevel,
      academicTrack: user.academicTrack,
      interests: user.interests,
      schoolName: user.schoolName,
      preferredLanguage: user.preferredLanguage,
      studyGoals: user.studyGoals,
      graduationYear: user.graduationYear,
    },
    xp: {
      level: xpLevel,
      current: xpInLevel,
      max: xpMax,
      percent: Math.min(100, Math.round((xpInLevel / xpMax) * 100)),
    },
    kpis: {
      lessonsCompleted,
      lessonsChange: lessonsThisWeek - lessonsLastWeek,
      studyMinutesToday,
      avgScore,
      avgScoreChange,
      streak,
    },
    examDaysLeft: daysUntilGraduationExam(user.graduationYear),
    weeklyChart,
    streakCalendar,
    streakMonthLabel: monthLabel,
    continueLearning,
    recommendations,
    aiSuggestions,
    enrolledCount: enrollments.length,
  };
}

export { formatStudyMinutes };
