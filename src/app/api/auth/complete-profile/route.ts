import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-errors";
import { isProfileComplete } from "@/lib/profile-complete";
import { PENDING_PROFILE_COOKIE } from "@/lib/auth-constants";
import { firstIssue, type RegisterPayload } from "@/lib/register-validation";
import { validateProfileCompletion } from "@/lib/profile-validation";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((s) => s.trim());
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Not authenticated", 401);

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) return jsonError("User not found", 404);

    const body = await request.json();

    const payload: RegisterPayload = {
      firstName: user.firstName || str(body.firstName) || user.name.split(" ")[0],
      lastName: user.lastName || str(body.lastName) || user.name.split(" ").slice(1).join(" "),
      dateOfBirth: str(body.dateOfBirth),
      gender: str(body.gender),
      nationalId: str(body.nationalId),
      email: user.email,
      phone: str(body.phone),
      whatsapp: str(body.whatsapp),
      country: str(body.country),
      governorate: str(body.governorate),
      city: str(body.city),
      address: str(body.address),
      schoolName: str(body.schoolName),
      schoolType: str(body.schoolType),
      gradeLevel: str(body.gradeLevel),
      academicTrack: str(body.academicTrack),
      graduationYear: str(body.graduationYear),
      studentId: str(body.studentId),
      parentName: str(body.parentName),
      parentPhone: str(body.parentPhone),
      parentEmail: str(body.parentEmail).toLowerCase(),
      preferredLanguage: str(body.preferredLanguage) || user.preferredLanguage || "ar",
      referralSource: str(body.referralSource),
      studyGoals: str(body.studyGoals),
      interests: strArray(body.interests),
      password: "OAuthUserNoPassword1!",
      confirmPassword: "OAuthUserNoPassword1!",
      acceptTerms: Boolean(body.acceptTerms),
    };

    const allIssues = validateProfileCompletion(payload);
    const issue = firstIssue(allIssues);

    if (issue) {
      return NextResponse.json(
        { error: "Validation failed", errorCode: issue.code, field: issue.field },
        { status: 400 }
      );
    }

    user.firstName = payload.firstName;
    user.lastName = payload.lastName;
    user.name = `${payload.firstName} ${payload.lastName}`.trim();
    user.dateOfBirth = new Date(payload.dateOfBirth);
    user.gender = payload.gender as "male" | "female" | "prefer_not";
    user.nationalId = payload.nationalId || undefined;
    user.phone = payload.phone;
    user.whatsapp = payload.whatsapp || payload.phone;
    user.country = payload.country;
    user.governorate = payload.governorate;
    user.city = payload.city;
    user.address = payload.address;
    user.schoolName = payload.schoolName;
    user.schoolType = payload.schoolType as "public" | "private" | "international" | "other";
    user.gradeLevel = payload.gradeLevel;
    user.academicTrack = payload.academicTrack;
    user.graduationYear = payload.graduationYear;
    user.studentId = payload.studentId || undefined;
    user.parentName = payload.parentName;
    user.parentPhone = payload.parentPhone;
    user.parentEmail = payload.parentEmail || undefined;
    user.preferredLanguage = payload.preferredLanguage as "ar" | "en" | "both";
    user.referralSource = payload.referralSource;
    user.interests = payload.interests;
    user.studyGoals = payload.studyGoals || undefined;
    user.newsletter = Boolean(body.newsletter);
    user.termsAcceptedAt = new Date();
    user.profileComplete = true;

    await user.save();

    const response = NextResponse.json({
      message: "Profile completed",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileComplete: true,
      },
    });

    response.cookies.set(PENDING_PROFILE_COOKIE, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Complete profile error:", error);
    return jsonError("Server error", 500);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Not authenticated", 401);

    await connectToDatabase();
    const user = await User.findById(session.userId).select("-password");
    if (!user) return jsonError("User not found", 404);

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        profileComplete: isProfileComplete(user),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return jsonError("Server error", 500);
  }
}
