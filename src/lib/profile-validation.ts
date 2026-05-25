import {
  validateRegisterStep,
  type RegisterPayload,
  type ValidationIssue,
} from "@/lib/register-validation";

export function validateProfileCompletion(
  data: Omit<RegisterPayload, "password" | "confirmPassword">
): ValidationIssue[] {
  const withPassword: RegisterPayload = {
    ...data,
    password: "Aa1234567",
    confirmPassword: "Aa1234567",
  };

  const stepIssues = [1, 2, 3].flatMap((step) => validateRegisterStep(step, withPassword));
  const step4 = validateRegisterStep(4, withPassword).filter(
    (issue) => !["passwordRequired", "passwordWeak", "passwordMatch"].includes(issue.code)
  );

  return [...stepIssues, ...step4];
}
