import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import {
  COURSE_CATALOG,
  type CourseCategory,
  type CourseItem,
  type CourseLevel,
  type CourseSubject,
} from "@/lib/courses-catalog";
import Course from "@/models/Course";

export type UnifiedCourse = CourseItem & {
  title?: string;
  author?: string;
  description?: string;
  isCustom?: boolean;
  teacherId?: string;
  priceLabel?: string;
};

type DbCourse = {
  _id: mongoose.Types.ObjectId;
  title: string;
  price: number;
  isFree: boolean;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  subject: CourseSubject;
  level: CourseLevel;
  category: CourseCategory;
  lessons: number;
  hours: number;
  emoji: string;
  gradient: string;
  description?: string;
  rating: number;
  students: number;
  isPublished?: boolean;
};

export type StoredCourseCategory = Exclude<CourseCategory, "all">;

const SUBJECT_TO_CATEGORY: Record<CourseSubject, StoredCourseCategory> = {
  math: "math",
  physics: "physics",
  chemistry: "chemistry",
  biology: "chemistry",
  arabic: "languages",
  english: "languages",
  programming: "programming",
  history: "history",
};

function catalogToUnified(course: CourseItem): UnifiedCourse {
  return { ...course, isCustom: false };
}

export function dbToUnified(doc: DbCourse): UnifiedCourse {
  const subject = doc.subject as CourseSubject;
  return {
    id: String(doc._id),
    title: doc.title,
    author: doc.teacherName,
    description: doc.description,
    isCustom: true,
    teacherId: String(doc.teacherId),
    subject,
    level: doc.level as CourseLevel,
    category: (doc.category as CourseCategory) || SUBJECT_TO_CATEGORY[subject],
    rating: doc.rating,
    price: doc.price,
    isFree: doc.isFree,
    students: doc.students,
    lessons: doc.lessons,
    hours: doc.hours,
    emoji: doc.emoji,
    gradient: doc.gradient,
    isNew: true,
    priceLabel: doc.isFree ? "free" : `${doc.price} EGP`,
  };
}

export async function getCustomCourses(filter?: {
  teacherId?: string;
  publishedOnly?: boolean;
}): Promise<UnifiedCourse[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filter?.teacherId) {
    query.teacherId = new mongoose.Types.ObjectId(filter.teacherId);
  }
  if (filter?.publishedOnly !== false) {
    query.isPublished = true;
  }
  const docs = await Course.find(query).sort({ createdAt: -1 }).lean();
  return docs.map((doc) => dbToUnified(doc as DbCourse));
}

export async function getAllCourses(options?: { includeUnpublished?: boolean }): Promise<UnifiedCourse[]> {
  const catalog = COURSE_CATALOG.map(catalogToUnified);
  const custom = await getCustomCourses(
    options?.includeUnpublished ? { publishedOnly: false } : { publishedOnly: true }
  );
  return [...catalog, ...custom];
}

export async function getCourseById(courseId: string): Promise<UnifiedCourse | null> {
  if (mongoose.isValidObjectId(courseId)) {
    await connectToDatabase();
    const doc = await Course.findById(courseId).lean();
    if (doc) return dbToUnified(doc as DbCourse);
  }

  const staticCourse = COURSE_CATALOG.find((c) => c.id === courseId);
  if (staticCourse) return catalogToUnified(staticCourse);

  return null;
}

export async function incrementCourseStudents(courseId: string): Promise<void> {
  if (!mongoose.isValidObjectId(courseId)) return;
  await connectToDatabase();
  await Course.findByIdAndUpdate(courseId, { $inc: { students: 1 } });
}

export function subjectToCategory(subject: CourseSubject): StoredCourseCategory {
  return SUBJECT_TO_CATEGORY[subject];
}
