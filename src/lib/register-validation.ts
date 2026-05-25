export type RegisterPayload = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  governorate: string;
  city: string;
  address: string;
  schoolName: string;
  schoolType: string;
  gradeLevel: string;
  academicTrack: string;
  graduationYear: string;
  studentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  preferredLanguage: string;
  referralSource: string;
  studyGoals: string;
  interests: string[];
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type ValidationIssue = {
  field: string;
  code: string;
};

const NAME_RE = /^[\p{L}\s'-]{2,40}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{10,18}$/;
const EGYPT_NID_RE = /^[0-9]{14}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function ageFromDob(isoDate: string): number | null {
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function normalizePhone(phone: string) {
  return phone.replace(/\s|-/g, "");
}

export function validateRegisterStep(step: number, data: RegisterPayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (step === 1) {
    if (!data.firstName || data.firstName.length < 2) {
      issues.push({ field: "firstName", code: "firstNameShort" });
    } else if (!NAME_RE.test(data.firstName)) {
      issues.push({ field: "firstName", code: "firstNameInvalid" });
    }

    if (!data.lastName || data.lastName.length < 2) {
      issues.push({ field: "lastName", code: "lastNameShort" });
    } else if (!NAME_RE.test(data.lastName)) {
      issues.push({ field: "lastName", code: "lastNameInvalid" });
    }

    if (!data.dateOfBirth) {
      issues.push({ field: "dateOfBirth", code: "dateOfBirthRequired" });
    } else {
      const age = ageFromDob(data.dateOfBirth);
      if (age === null) {
        issues.push({ field: "dateOfBirth", code: "dateOfBirthInvalid" });
      } else if (age < 10) {
        issues.push({ field: "dateOfBirth", code: "minAge" });
      } else if (age > 30) {
        issues.push({ field: "dateOfBirth", code: "maxAge" });
      }
    }

    if (!data.gender) {
      issues.push({ field: "gender", code: "genderRequired" });
    }

    if (data.nationalId && data.country === "Egypt" && !EGYPT_NID_RE.test(data.nationalId)) {
      issues.push({ field: "nationalId", code: "nationalIdInvalid" });
    }
  }

  if (step === 2) {
    if (!data.email || !EMAIL_RE.test(data.email)) {
      issues.push({ field: "email", code: "emailInvalid" });
    }

    if (!data.phone || !PHONE_RE.test(data.phone)) {
      issues.push({ field: "phone", code: "phoneInvalid" });
    }

    const whatsapp = data.whatsapp || data.phone;
    if (whatsapp && !PHONE_RE.test(whatsapp)) {
      issues.push({ field: "whatsapp", code: "whatsappInvalid" });
    }

    if (!data.country) issues.push({ field: "country", code: "countryRequired" });
    if (!data.governorate || data.governorate.length < 2) {
      issues.push({ field: "governorate", code: "governorateShort" });
    }
    if (!data.city || data.city.length < 2) {
      issues.push({ field: "city", code: "cityShort" });
    }
    if (!data.address || data.address.length < 10) {
      issues.push({ field: "address", code: "addressShort" });
    }
  }

  if (step === 3) {
    if (!data.schoolName || data.schoolName.length < 3) {
      issues.push({ field: "schoolName", code: "schoolNameShort" });
    }
    if (!data.schoolType) issues.push({ field: "schoolType", code: "schoolTypeRequired" });
    if (!data.gradeLevel) issues.push({ field: "gradeLevel", code: "gradeLevelRequired" });
    if (!data.academicTrack) issues.push({ field: "academicTrack", code: "academicTrackRequired" });
    if (!data.graduationYear) issues.push({ field: "graduationYear", code: "graduationYearRequired" });

    if (!data.parentName || data.parentName.length < 3) {
      issues.push({ field: "parentName", code: "parentNameShort" });
    }
    if (!data.parentPhone || !PHONE_RE.test(data.parentPhone)) {
      issues.push({ field: "parentPhone", code: "parentPhoneInvalid" });
    }
    if (normalizePhone(data.parentPhone) === normalizePhone(data.phone)) {
      issues.push({ field: "parentPhone", code: "parentPhoneSame" });
    }
    if (data.parentEmail && !EMAIL_RE.test(data.parentEmail)) {
      issues.push({ field: "parentEmail", code: "parentEmailInvalid" });
    }
  }

  if (step === 4) {
    if (!data.referralSource) {
      issues.push({ field: "referralSource", code: "referralRequired" });
    }
    if (!data.interests?.length) {
      issues.push({ field: "interests", code: "interestsRequired" });
    } else if (data.interests.length > 6) {
      issues.push({ field: "interests", code: "interestsMax" });
    }
    if (data.studyGoals && data.studyGoals.length > 500) {
      issues.push({ field: "studyGoals", code: "studyGoalsLong" });
    }
    if (!data.password) {
      issues.push({ field: "password", code: "passwordRequired" });
    } else if (!PASSWORD_RE.test(data.password)) {
      issues.push({ field: "password", code: "passwordWeak" });
    }
    if (data.password !== data.confirmPassword) {
      issues.push({ field: "confirmPassword", code: "passwordMatch" });
    }
    if (!data.acceptTerms) {
      issues.push({ field: "acceptTerms", code: "termsRequired" });
    }
  }

  return issues;
}

export function validateRegisterFull(data: RegisterPayload): ValidationIssue[] {
  return [1, 2, 3, 4].flatMap((step) => validateRegisterStep(step, data));
}

export function firstIssue(issues: ValidationIssue[]): ValidationIssue | undefined {
  return issues[0];
}
