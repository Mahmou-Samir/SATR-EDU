import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Exam from "@/models/Exam";

export async function getOwnedExamDoc(
  examId: string,
  session: { userId: string; role: string }
) {
  if (!mongoose.isValidObjectId(examId)) return null;
  await connectToDatabase();
  const exam = await Exam.findById(examId);
  if (!exam) return null;
  if (session.role !== "admin" && String(exam.teacherId) !== session.userId) {
    return "forbidden" as const;
  }
  return exam;
}
