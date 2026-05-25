import mongoose, { Schema } from "mongoose";

const CourseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacherName: { type: String, required: true, trim: true },
    subject: {
      type: String,
      enum: ["math", "physics", "chemistry", "biology", "arabic", "english", "programming", "history"],
      default: "math",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    category: {
      type: String,
      enum: ["math", "physics", "chemistry", "languages", "programming", "history"],
      default: "math",
    },
    lessons: { type: Number, default: 12, min: 1 },
    hours: { type: Number, default: 10, min: 1 },
    emoji: { type: String, default: "📘", trim: true },
    gradient: {
      type: String,
      default: "linear-gradient(135deg,rgba(56,29,109,.8),rgba(100,50,201,.4))",
    },
    description: { type: String, trim: true },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    students: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseSchema.index({ teacherId: 1, createdAt: -1 });

if (mongoose.models.Course) {
  mongoose.deleteModel("Course");
}

const Course = mongoose.model("Course", CourseSchema);

export default Course;
