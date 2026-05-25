type MaybeString = string | null | undefined;

export type ProfileUser = {
  role?: string;
  profileComplete?: boolean;
  phone?: MaybeString;
  schoolName?: MaybeString;
  parentName?: MaybeString;
  interests?: string[] | null;
  dateOfBirth?: Date | null;
  gender?: MaybeString;
  country?: MaybeString;
  governorate?: MaybeString;
  city?: MaybeString;
  address?: MaybeString;
  schoolType?: MaybeString;
  gradeLevel?: MaybeString;
  academicTrack?: MaybeString;
  graduationYear?: MaybeString;
  parentPhone?: MaybeString;
  referralSource?: MaybeString;
  termsAcceptedAt?: Date | null;
};

export function isProfileComplete(user: ProfileUser): boolean {
  if (user.role === "teacher" || user.role === "admin") return true;
  if (user.profileComplete) return true;

  return Boolean(
    user.phone &&
      user.dateOfBirth &&
      user.gender &&
      user.country &&
      user.governorate &&
      user.city &&
      user.address &&
      user.schoolName &&
      user.schoolType &&
      user.gradeLevel &&
      user.academicTrack &&
      user.graduationYear &&
      user.parentName &&
      user.parentPhone &&
      user.referralSource &&
      user.interests &&
      user.interests.length > 0 &&
      user.termsAcceptedAt
  );
}
