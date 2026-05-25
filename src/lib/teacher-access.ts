export function canManageTeacherContent(role: string): boolean {
  return role === "teacher" || role === "admin";
}
