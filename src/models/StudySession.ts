import mongoose, { Schema } from "mongoose";

const StudySessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    minutes: { type: Number, required: true, min: 1 },
    score: { type: Number, min: 0, max: 100 },
    courseId: { type: String, trim: true },
    type: { type: String, enum: ["lesson", "quiz", "exam"], default: "lesson" },
  },
  { timestamps: true }
);

StudySessionSchema.index({ userId: 1, date: -1 });

if (mongoose.models.StudySession) {
  mongoose.deleteModel("StudySession");
}

const StudySession = mongoose.model("StudySession", StudySessionSchema);

export default StudySession;
