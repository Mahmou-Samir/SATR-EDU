import type { CourseSubject } from "@/lib/courses-catalog";

export function trackToSubjects(academicTrack?: string): CourseSubject[] {
  switch (academicTrack) {
    case "Science":
      return ["math", "physics", "chemistry", "biology", "programming"];
    case "Literary":
      return ["arabic", "english", "history"];
    case "Mixed":
      return [
        "math",
        "physics",
        "chemistry",
        "biology",
        "arabic",
        "english",
        "programming",
        "history",
      ];
    default:
      return ["math", "english", "programming"];
  }
}
