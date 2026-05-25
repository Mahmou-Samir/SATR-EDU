import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { authCookieOptions, signToken } from "@/lib/auth";
import { AUTH_COOKIE, AUTH_ROLE_COOKIE } from "@/lib/auth-constants";
import { isProfileComplete } from "@/lib/profile-complete";
import { OAuthProfile } from "@/lib/oauth";
import { PENDING_PROFILE_COOKIE } from "@/lib/auth-constants";
import { NextResponse } from "next/server";

export async function upsertOAuthUser(profile: OAuthProfile) {
  await connectToDatabase();

  let user = await User.findOne({
    $or: [{ email: profile.email }, { authProvider: profile.provider, providerId: profile.providerId }],
  });

  if (user) {
    user.name = user.name || profile.name;
    user.firstName = user.firstName || profile.firstName;
    user.lastName = user.lastName || profile.lastName;
    user.email = profile.email;
    user.authProvider = profile.provider;
    user.providerId = profile.providerId;
    user.avatar = profile.avatar || user.avatar;
    await user.save();
  } else {
    user = await User.create({
      name: profile.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      authProvider: profile.provider,
      providerId: profile.providerId,
      avatar: profile.avatar,
      role: "student",
      profileComplete: false,
      preferredLanguage: "ar",
    });
  }

  const complete = isProfileComplete(user);

  if (!user.profileComplete && complete) {
    user.profileComplete = true;
    await user.save();
  }

  const token = signToken({
    userId: String(user._id),
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return { user, token, profileComplete: user.profileComplete || complete };
}

export function attachAuthCookies(
  response: NextResponse,
  token: string,
  profileComplete: boolean,
  role: string
) {
  response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
  response.cookies.set(AUTH_ROLE_COOKIE, role, authCookieOptions());

  if (!profileComplete) {
    // NOT httpOnly — middleware reads this cookie from the incoming request
    response.cookies.set(PENDING_PROFILE_COOKIE, "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h — enough time to complete profile
    });
  } else {
    // Delete the cookie explicitly
    response.cookies.set(PENDING_PROFILE_COOKIE, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

