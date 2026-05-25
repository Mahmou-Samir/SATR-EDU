import mongoose, { Schema } from "mongoose";

const EnrollmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: String, required: true, trim: true },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    currentLesson: { type: Number, default: 1, min: 1 },
    totalLessons: { type: Number, required: true, min: 1 },
    lastAccessedAt: { type: Date, default: Date.now },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

if (mongoose.models.Enrollment) {
  mongoose.deleteModel("Enrollment");
}

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);

export default Enrollment;
