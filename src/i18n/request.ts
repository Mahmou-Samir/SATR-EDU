import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale, locale }) => {
  let currentLocale = locale;

  if (!currentLocale && requestLocale) {
    currentLocale = await requestLocale;
  }

  if (!currentLocale || !routing.locales.includes(currentLocale as "en" | "ar")) {
    currentLocale = routing.defaultLocale;
  }

  const base = (await import(`../../messages/${currentLocale}.json`)).default;
  const home = (await import(`../../messages/${currentLocale}/home.json`)).default;
  const courses = (await import(`../../messages/${currentLocale}/courses.json`)).default;
  const chat = (await import(`../../messages/${currentLocale}/chat.json`)).default;
  const dashboard = (await import(`../../messages/${currentLocale}/dashboard.json`)).default;
  const teacherDashboard = (await import(`../../messages/${currentLocale}/teacher-dashboard.json`)).default;
  const teacherCourses = (await import(`../../messages/${currentLocale}/teacher-courses.json`)).default;
  const teacherExams = (await import(`../../messages/${currentLocale}/teacher-exams.json`)).default;
  const exams = (await import(`../../messages/${currentLocale}/exams.json`)).default;

  return {
    locale: currentLocale,
    messages: {
      ...base,
      Home: home,
      Courses: courses,
      Chat: chat,
      Dashboard: dashboard,
      TeacherDashboard: teacherDashboard,
      TeacherCourses: teacherCourses,
      TeacherExams: teacherExams,
      Exams: exams,
    },
  };
});
