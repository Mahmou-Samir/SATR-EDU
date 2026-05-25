import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional: OAuth users sign in without a password
    password: { type: String, required: false, select: false },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    providerId: { type: String, trim: true },
    avatar: { type: String, trim: true },
    profileComplete: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "student", "teacher"],
      default: "student",
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "prefer_not"] },
    nationalId: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    country: { type: String, trim: true },
    governorate: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    schoolName: { type: String, trim: true },
    schoolType: { type: String, enum: ["public", "private", "international", "other"] },
    gradeLevel: { type: String, trim: true },
    academicTrack: { type: String, trim: true },
    graduationYear: { type: String, trim: true },
    studentId: { type: String, trim: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    parentEmail: { type: String, trim: true, lowercase: true },
    preferredLanguage: { type: String, enum: ["ar", "en", "both"], default: "ar" },
    referralSource: { type: String, trim: true },
    interests: [{ type: String }],
    studyGoals: { type: String, trim: true },
    newsletter: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    assignedCourseIds: [{ type: String, trim: true }],
    teacherBio: { type: String, trim: true },
  },
  { timestamps: true }
);

UserSchema.index({ authProvider: 1, providerId: 1 }, { sparse: true });

// Hot reload can keep an old schema where password was required
if (mongoose.models.User) {
  mongoose.deleteModel("User");
}

const User = mongoose.model("User", UserSchema);

export default User;
