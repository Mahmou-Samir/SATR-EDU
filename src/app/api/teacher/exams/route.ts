import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { canManageTeacherContent } from "@/lib/teacher-access";
import { isOpenAIConfigured } from "@/lib/openai-client";
import { buildExamFromPdf } from "@/lib/exam-pipeline";
import { saveExamPdf, validatePdfFile } from "@/lib/exam-storage";
import { serializeTeacherExam } from "@/lib/exam-serialize";
import Exam from "@/models/Exam";
import ExamAttempt from "@/models/ExamAttempt";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canManageTeacherContent(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    await connectToDatabase();
    const query =
      session.role === "admin"
        ? {}
        : { teacherId: new mongoose.Types.ObjectId(session.userId) };

    const exams = await Exam.find(query).sort({ createdAt: -1 }).lean();
    const attemptCounts = await ExamAttempt.aggregate([
      { $match: { examId: { $in: exams.map((e) => e._id) } } },
      { $group: { _id: "$examId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(attemptCounts.map((row) => [String(row._id), row.count as number]));

    return NextResponse.json({
      exams: exams.map((doc) =>
        serializeTeacherExam(doc as Parameters<typeof serializeTeacherExam>[0], {
          attemptCount: countMap.get(String(doc._id)) ?? 0,
        })
      ),
    });
  } catch (error) {
    console.error("Teacher exams list error:", error);
    return jsonError("Server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageTeacherContent(session.role)) {
      return jsonError("Teacher access only", 403);
    }

    if (!isOpenAIConfigured()) {
      return jsonError("OPENAI_API_KEY is required for AI exam generation", 503);
    }

    const formData = await request.formData();
    const file = formData.get("pdf");
    const titleRaw = formData.get("title");
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const courseIdRaw = formData.get("courseId");
    const courseId = typeof courseIdRaw === "string" ? courseIdRaw.trim() : "";
    const durationRaw = formData.get("durationMinutes");
    const questionCountRaw = formData.get("questionCount");
    const publish = formData.get("publish") === "true";

    if (title.length < 3) {
      return jsonError("Exam title must be at least 3 characters", 400);
    }

    const pdfFile = file instanceof File ? file : null;
    const pdfCheck = validatePdfFile(pdfFile);
    if (!pdfCheck.ok) {
      return jsonError(pdfCheck.error, 400);
    }

    const durationMinutes =
      typeof durationRaw === "string" ? parseInt(durationRaw, 10) : Number(durationRaw);
    const duration = Number.isNaN(durationMinutes)
      ? 30
      : Math.min(180, Math.max(5, durationMinutes));

    const questionCountParsed =
      typeof questionCountRaw === "string" ? parseInt(questionCountRaw, 10) : Number(questionCountRaw);
    const questionCount = Number.isNaN(questionCountParsed)
      ? 10
      : Math.min(20, Math.max(3, questionCountParsed));

    const buffer = Buffer.from(await pdfFile!.arrayBuffer());

    let generated;
    try {
      generated = await buildExamFromPdf(buffer, pdfFile!.name, title, questionCount);
    } catch (err) {
      console.error("AI exam generation error:", err);
      const message = err instanceof Error ? err.message : "AI exam generation failed";
      return jsonError(message, 502);
    }

    await connectToDatabase();
    const teacher = await User.findById(session.userId);
    if (!teacher) {
      return jsonError("User not found", 404);
    }

    const exam = await Exam.create({
      title,
      teacherId: new mongoose.Types.ObjectId(session.userId),
      courseId: courseId || undefined,
      sourcePdfName: pdfFile!.name,
      sourceTextPreview: generated.sourceText.slice(0, 400),
      questions: generated.questions,
      status: publish ? "published" : "draft",
      durationMinutes: duration,
      publishedAt: publish ? new Date() : undefined,
      ocrUsed: generated.ocrUsed,
      aiGenerated: true,
    });

    const pdfPath = await saveExamPdf(session.userId, String(exam._id), buffer);
    exam.sourcePdfPath = pdfPath;
    await exam.save();

    return NextResponse.json(
      {
        exam: serializeTeacherExam(exam.toObject() as Parameters<typeof serializeTeacherExam>[0]),
        message: publish ? "Exam published" : "Exam created as draft",
        ocrUsed: generated.ocrUsed,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create exam error:", error);
    return jsonError("Server error", 500);
  }
}
