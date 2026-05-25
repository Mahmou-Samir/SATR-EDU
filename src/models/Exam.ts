import mongoose, { Schema } from "mongoose";
import type { ExamQuestion, ExamStatus } from "@/lib/exam-types";

const ExamQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["mcq"], default: "mcq" },
    prompt: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true, min: 0 },
    points: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const ExamSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: String, trim: true, index: true },
    sourcePdfName: { type: String, trim: true },
    sourcePdfPath: { type: String, trim: true },
    sourceTextPreview: { type: String, trim: true },
    questions: { type: [ExamQuestionSchema], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    durationMinutes: { type: Number, default: 30, min: 5, max: 180 },
    publishedAt: { type: Date },
    ocrUsed: { type: Boolean, default: false },
    aiGenerated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExamSchema.index({ status: 1, publishedAt: -1 });
ExamSchema.index({ teacherId: 1, createdAt: -1 });

export type ExamDocument = mongoose.InferSchemaType<typeof ExamSchema> & {
  _id: mongoose.Types.ObjectId;
  status: ExamStatus;
  questions: ExamQuestion[];
};

if (mongoose.models.Exam) {
  mongoose.deleteModel("Exam");
}

const Exam = mongoose.model("Exam", ExamSchema);

export default Exam;
