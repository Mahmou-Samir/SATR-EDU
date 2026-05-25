import { connectToDatabase } from "@/lib/mongodb";
import { COURSE_CATALOG } from "@/lib/courses-catalog";
import { getCustomCourses, type UnifiedCourse } from "@/lib/courses-service";
import Enrollment from "@/models/Enrollment";
import StudySession from "@/models/StudySession";
import User from "@/models/User";

export type TeacherCourseStat = {
  courseId: string;
  title?: string;
  emoji: string;
  gradient: string;
  subject: string;
  level: string;
  enrolledCount: number;
  avgProgress: number;
  avgScore: number | null;
  lessons: number;
  completionRate: number;
  activeStudents: number;
  isCustom?: boolean;
};

export type TeacherActivity = {
  id: string;
  studentName: string;
  courseId: string;
  type: string;
  minutes: number;
  score: number | null;
  at: string;
};

export type TeacherStudentRow = {
  id: string;
  name: string;
  email: string;
  gradeLevel?: string;
  academicTrack?: string;
  enrolledCount: number;
  avgProgress: number;
  avgScore: number | null;
  lastActive: string | null;
  totalStudyMinutes: number;
};

export type BreakdownItem = {
  label: string;
  count: number;
  percent: number;
};

export type TeacherInsight = {
  id: string;
  tone: "success" | "warning" | "info";
  messageKey: string;
  params: Record<string, string | number>;
};

export type TeacherDashboardPayload = {
  teacher: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    assignedCourseIds: string[];
  };
  kpis: {
    totalStudents: number;
    activeThisWeek: number;
    coursesTeaching: number;
    totalEnrollments: number;
    avgClassScore: number | null;
    newEnrollmentsWeek: number;
    totalStudyHoursWeek: number;
    completionRate: number;
    atRiskCount: number;
  };
  weeklyEnrollments: { day: string; count: number; heightPercent: number }[];
  weeklyStudyMinutes: { day: string; minutes: number; heightPercent: number }[];
  gradeBreakdown: BreakdownItem[];
  trackBreakdown: BreakdownItem[];
  courses: TeacherCourseStat[];
  recentActivity: TeacherActivity[];
  studentsNeedingAttention: TeacherStudentRow[];
  topStudents: TeacherStudentRow[];
  allStudents: TeacherStudentRow[];
  insights: TeacherInsight[];
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function teacherCoursesList(
  assignedIds: string[],
  teacherId: string
): Promise<UnifiedCourse[]> {
  const catalog: UnifiedCourse[] = COURSE_CATALOG.map((c) => ({ ...c, isCustom: false }));
  const custom = await getCustomCourses({ teacherId, publishedOnly: false });
  const customIds = new Set(custom.map((c) => c.id));
  const fromCatalog =
    assignedIds.length > 0
      ? catalog.filter((c) => !c.isCustom && assignedIds.includes(c.id))
      : catalog.filter((c) => !c.isCustom);
  const ownCustom = custom.filter((c) => customIds.has(c.id));
  const merged = new Map<string, UnifiedCourse>();
  for (const c of [...fromCatalog, ...ownCustom]) {
    merged.set(c.id, c);
  }
  return [...merged.values()];
}

function buildBreakdown(
  students: Array<{ gradeLevel?: string | null; academicTrack?: string | null }>,
  field: "gradeLevel" | "academicTrack"
): BreakdownItem[] {
  const counts = new Map<string, number>();
  for (const student of students) {
    const raw = student[field];
    const label = raw?.trim() || "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const total = students.length || 1;
  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function buildInsights(
  atRiskCount: number,
  newEnrollments: number,
  avgScore: number | null,
  courses: TeacherCourseStat[],
  activeWeek: number,
  totalStudents: number
): TeacherInsight[] {
  const insights: TeacherInsight[] = [];

  if (atRiskCount > 0) {
    insights.push({
      id: "at-risk",
      tone: "warning",
      messageKey: "insights.atRisk",
      params: { count: atRiskCount },
    });
  }

  if (newEnrollments > 0) {
    insights.push({
      id: "new-enroll",
      tone: "info",
      messageKey: "insights.newEnrollments",
      params: { count: newEnrollments },
    });
  }

  if (avgScore != null && avgScore >= 80) {
    insights.push({
      id: "high-score",
      tone: "success",
      messageKey: "insights.highScore",
      params: { score: avgScore },
    });
  }

  const lowest = [...courses].sort((a, b) => a.avgProgress - b.avgProgress)[0];
  if (lowest && lowest.enrolledCount > 0 && lowest.avgProgress < 40) {
    insights.push({
      id: "low-course",
      tone: "warning",
      messageKey: "insights.lowProgressCourse",
      params: { courseId: lowest.courseId, percent: lowest.avgProgress },
    });
  }

  const engagement = totalStudents > 0 ? Math.round((activeWeek / totalStudents) * 100) : 0;
  insights.push({
    id: "engagement",
    tone: engagement >= 50 ? "success" : "info",
    messageKey: "insights.engagement",
    params: { percent: engagement },
  });

  return insights.slice(0, 4);
}

export async function getTeacherDashboard(teacherId: string): Promise<TeacherDashboardPayload> {
  await connectToDatabase();

  const teacher = await User.findById(teacherId).select("-password").lean();
  if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
    throw new Error("Not a teacher account");
  }

  const teacherIdStr = String(teacher._id);
  const customOnly = await getCustomCourses({ teacherId: teacherIdStr, publishedOnly: false });
  const assignedCourseIds =
    teacher.assignedCourseIds && teacher.assignedCourseIds.length > 0
      ? [...new Set([...teacher.assignedCourseIds, ...customOnly.map((c) => c.id)])]
      : customOnly.map((c) => c.id);

  const courses = await teacherCoursesList(assignedCourseIds, teacherIdStr);
  const courseIds = courses.map((c) => c.id);

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [enrollments, sessions] = await Promise.all([
    Enrollment.find({ courseId: { $in: courseIds } }).lean(),
    StudySession.find({ courseId: { $in: courseIds } }).sort({ date: -1 }).limit(250).lean(),
  ]);

  const enrolledUserIds = [...new Set(enrollments.map((e) => String(e.userId)))];
  const students =
    enrolledUserIds.length > 0
      ? await User.find({ _id: { $in: enrolledUserIds } })
          .select("name email gradeLevel academicTrack")
          .lean()
      : [];

  const totalStudents = enrolledUserIds.length;

  const studentMap = new Map(students.map((s) => [String(s._id), s]));
  const sessionsThisWeek = sessions.filter((s) => s.date >= weekAgo);

  const activeUserIds = new Set(sessionsThisWeek.map((s) => String(s.userId)));

  const sessionScores = sessionsThisWeek
    .filter((s) => s.score != null)
    .map((s) => s.score as number);
  const avgClassScore =
    sessionScores.length > 0
      ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
      : null;

  const totalStudyMinutesWeek = sessionsThisWeek.reduce((sum, s) => sum + s.minutes, 0);
  const completionRate =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / enrollments.length
        )
      : 0;

  const courseStats: TeacherCourseStat[] = courses.map((course) => {
    const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
    const courseSessions = sessions.filter((s) => s.courseId === course.id);
    const courseSessionsWeek = courseSessions.filter((s) => s.date >= weekAgo);
    const activeStudents = new Set(courseSessionsWeek.map((s) => String(s.userId))).size;
    const scored = courseSessions.filter((s) => s.score != null);

    const avgProgress =
      courseEnrollments.length > 0
        ? Math.round(
            courseEnrollments.reduce((sum, e) => sum + e.progressPercent, 0) /
              courseEnrollments.length
          )
        : 0;

    return {
      courseId: course.id,
      title: course.title,
      isCustom: course.isCustom,
      emoji: course.emoji,
      gradient: course.gradient,
      subject: course.subject,
      level: course.level,
      enrolledCount: courseEnrollments.length,
      avgProgress,
      avgScore:
        scored.length > 0
          ? Math.round(scored.reduce((sum, s) => sum + (s.score as number), 0) / scored.length)
          : null,
      lessons: course.lessons,
      completionRate: avgProgress,
      activeStudents,
    };
  });

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const weeklyRaw: { day: string; count: number }[] = [];
  const studyRaw: { day: string; minutes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    weeklyRaw.push({
      day: dayKeys[date.getDay()],
      count: enrollments.filter((e) => e.enrolledAt >= dayStart && e.enrolledAt < dayEnd).length,
    });

    studyRaw.push({
      day: dayKeys[date.getDay()],
      minutes: sessionsThisWeek
        .filter((s) => s.date >= dayStart && s.date < dayEnd)
        .reduce((sum, s) => sum + s.minutes, 0),
    });
  }

  const maxWeekly = Math.max(...weeklyRaw.map((w) => w.count), 1);
  const weeklyEnrollments = weeklyRaw.map((w) => ({
    ...w,
    heightPercent: Math.max(8, Math.round((w.count / maxWeekly) * 100)),
  }));

  const maxStudy = Math.max(...studyRaw.map((s) => s.minutes), 1);
  const weeklyStudyMinutes = studyRaw.map((s) => ({
    ...s,
    heightPercent: Math.max(8, Math.round((s.minutes / maxStudy) * 100)),
  }));

  const recentActivity: TeacherActivity[] = sessions.slice(0, 15).map((s) => {
    const student = studentMap.get(String(s.userId));
    return {
      id: String(s._id),
      studentName: student?.name ?? "Student",
      courseId: s.courseId ?? "",
      type: s.type,
      minutes: s.minutes,
      score: s.score ?? null,
      at: s.date.toISOString(),
    };
  });

  const studentRows: TeacherStudentRow[] = students.map((student) => {
    const sid = String(student._id);
    const studentEnrollments = enrollments.filter((e) => String(e.userId) === sid);
    const studentSessions = sessions.filter((s) => String(s.userId) === sid);
    const studentSessionsWeek = studentSessions.filter((s) => s.date >= weekAgo);
    const scores = studentSessions.filter((s) => s.score != null).map((s) => s.score as number);
    const lastSession = studentSessions[0];

    return {
      id: sid,
      name: student.name,
      email: student.email,
      gradeLevel: student.gradeLevel ?? undefined,
      academicTrack: student.academicTrack ?? undefined,
      enrolledCount: studentEnrollments.length,
      avgProgress:
        studentEnrollments.length > 0
          ? Math.round(
              studentEnrollments.reduce((sum, e) => sum + e.progressPercent, 0) /
                studentEnrollments.length
            )
          : 0,
      avgScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
      lastActive:
        lastSession?.date.toISOString() ??
        studentEnrollments[0]?.lastAccessedAt?.toISOString() ??
        null,
      totalStudyMinutes: studentSessionsWeek.reduce((sum, s) => sum + s.minutes, 0),
    };
  });

  const studentsNeedingAttention = studentRows
    .filter((s) => {
      if (s.enrolledCount === 0) return false;
      const inactive =
        !s.lastActive || new Date(s.lastActive) < new Date(now.getTime() - 7 * 86400000);
      return s.avgProgress < 25 || inactive;
    })
    .sort((a, b) => a.avgProgress - b.avgProgress)
    .slice(0, 10);

  const topStudents = [...studentRows]
    .filter((s) => s.enrolledCount > 0 && s.avgScore != null)
    .sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))
    .slice(0, 8);

  const gradeBreakdown = buildBreakdown(students, "gradeLevel");
  const trackBreakdown = buildBreakdown(students, "academicTrack");

  const insights = buildInsights(
    studentsNeedingAttention.length,
    enrollments.filter((e) => e.enrolledAt >= weekAgo).length,
    avgClassScore,
    courseStats,
    activeUserIds.size,
    totalStudents
  );

  return {
    teacher: {
      id: String(teacher._id),
      name: teacher.name,
      email: teacher.email,
      bio: teacher.teacherBio ?? undefined,
      assignedCourseIds,
    },
    kpis: {
      totalStudents,
      activeThisWeek: activeUserIds.size,
      coursesTeaching: courses.length,
      totalEnrollments: enrollments.length,
      avgClassScore,
      newEnrollmentsWeek: enrollments.filter((e) => e.enrolledAt >= weekAgo).length,
      totalStudyHoursWeek: Math.round((totalStudyMinutesWeek / 60) * 10) / 10,
      completionRate,
      atRiskCount: studentsNeedingAttention.length,
    },
    weeklyEnrollments,
    weeklyStudyMinutes,
    gradeBreakdown,
    trackBreakdown,
    courses: courseStats.sort((a, b) => b.enrolledCount - a.enrolledCount),
    recentActivity,
    studentsNeedingAttention,
    topStudents,
    allStudents: studentRows.filter((s) => s.enrolledCount > 0),
    insights,
  };
}
