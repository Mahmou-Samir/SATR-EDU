import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { COURSE_CATALOG } from "@/lib/courses-catalog";
import User from "@/models/User";

export const DEMO_TEACHER_EMAIL = "teacher@satr.edu";
export const DEMO_TEACHER_PASSWORD = "123456";
export const DEMO_ADMIN_EMAIL = "admin@satr.edu";

/** Ensures demo teacher exists with a known password (idempotent). */
export async function ensureTeacherAccount(resetPassword = false): Promise<void> {
  await connectToDatabase();

  const allCourseIds = COURSE_CATALOG.map((c) => c.id);
  const hashedPassword = await bcrypt.hash(DEMO_TEACHER_PASSWORD, 10);

  let user = await User.findOne({ email: DEMO_TEACHER_EMAIL }).select("+password");

  if (!user) {
    await User.create({
      name: "Dr. Ahmed Hassan",
      firstName: "Ahmed",
      lastName: "Hassan",
      email: DEMO_TEACHER_EMAIL,
      password: hashedPassword,
      role: "teacher",
      authProvider: "local",
      profileComplete: true,
      assignedCourseIds: allCourseIds,
      teacherBio: "Mathematics & Physics instructor with 12+ years of experience.",
      preferredLanguage: "ar",
    });
    return;
  }

  let dirty = false;

  if (user.role !== "teacher" && user.role !== "admin") {
    user.role = "teacher";
    dirty = true;
  }

  if (!user.password || resetPassword) {
    user.password = hashedPassword;
    dirty = true;
  }

  if (!user.assignedCourseIds || user.assignedCourseIds.length === 0) {
    user.assignedCourseIds = allCourseIds;
    dirty = true;
  }

  if (!user.profileComplete) {
    user.profileComplete = true;
    dirty = true;
  }

  if (user.authProvider !== "local" && !user.password) {
    user.authProvider = "local";
    user.password = hashedPassword;
    dirty = true;
  }

  if (dirty) {
    await user.save();
  }
}

export async function seedDefaultAccounts(): Promise<void> {
  await connectToDatabase();

  const allCourseIds = COURSE_CATALOG.map((c) => c.id);
  const usersCount = await User.countDocuments();

  if (usersCount === 0) {
    const hashedPassword = await bcrypt.hash(DEMO_TEACHER_PASSWORD, 10);
    await User.create({
      name: "Admin",
      email: DEMO_ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      authProvider: "local",
      profileComplete: true,
      assignedCourseIds: allCourseIds,
    });
  }

  await ensureTeacherAccount(false);
}
