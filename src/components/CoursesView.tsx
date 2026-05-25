import CoursesClient from "./CoursesClient";
import type { UnifiedCourse } from "@/lib/courses-service";

type CoursesViewProps = {
  initialCourses?: UnifiedCourse[];
};

export default function CoursesView({ initialCourses }: CoursesViewProps) {
  return <CoursesClient initialCourses={initialCourses} />;
}
