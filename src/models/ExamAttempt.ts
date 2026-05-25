import mongoose, { Schema } from "mongoose";
import type { ExamAnswer } from "@/lib/exam-types";

const ExamAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ExamAttemptSchema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    answers: { type: [ExamAnswerSchema], default: [] },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    percent: { type: Number, required: true, min: 0, max: 100 },
    durationMinutes: { type: Number, min: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ExamAttemptSchema.index({ examId: 1, userId: 1 }, { unique: true });

export type ExamAttemptDocument = mongoose.InferSchemaType<typeof ExamAttemptSchema> & {
  _id: mongoose.Types.ObjectId;
  answers: ExamAnswer[];
};

if (mongoose.models.ExamAttempt) {
  mongoose.deleteModel("ExamAttempt");
}

const ExamAttempt = mongoose.model("ExamAttempt", ExamAttemptSchema);

export default ExamAttempt;
