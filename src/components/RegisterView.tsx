"use client";

import "./LoginView.css";
import "./RegisterView.css";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { validateRegisterStep } from "@/lib/register-validation";

const INTEREST_KEYS = [
  "math",
  "physics",
  "chemistry",
  "biology",
  "arabic",
  "english",
  "programming",
  "history",
  "geography",
  "economics",
] as const;

const TOTAL_STEPS = 4;

function passwordStrength(password: string): "none" | "weak" | "medium" | "strong" {
  if (!password) return "none";
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return "weak";
  if (score <= 2) return "medium";
  return "strong";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}

type FormState = {
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
  newsletter: boolean;
  acceptTerms: boolean;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationalId: "",
  email: "",
  phone: "",
  whatsapp: "",
  country: "Egypt",
  governorate: "",
  city: "",
  address: "",
  schoolName: "",
  schoolType: "",
  gradeLevel: "",
  academicTrack: "",
  graduationYear: "",
  studentId: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  preferredLanguage: "ar",
  referralSource: "",
  studyGoals: "",
  interests: [],
  password: "",
  confirmPassword: "",
  newsletter: false,
  acceptTerms: false,
};

export default function RegisterView() {
  const t = useTranslations("Register");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    const cleared = Object.keys(patch);
    setFieldErrors((prev) => {
      const next = { ...prev };
      cleared.forEach((k) => delete next[k]);
      return next;
    });
  };

  const applyValidation = (current: number) => {
    const issues = validateRegisterStep(current, form);
    const map: Record<string, string> = {};
    for (const issue of issues) {
      if (!map[issue.field]) {
        map[issue.field] = t(`errors.${issue.code}` as "errors.firstNameShort");
      }
    }
    setFieldErrors(map);
    if (issues.length > 0) {
      setError(t(`errors.${issues[0].code}` as "errors.firstNameShort"));
    } else {
      setError("");
    }
    return issues.length === 0;
  };

  const toggleInterest = (key: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(key)
        ? prev.interests.filter((i) => i !== key)
        : [...prev.interests, key],
    }));
  };

  const nextStep = () => {
    if (!applyValidation(step)) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setError("");
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyValidation(4)) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errorCode) {
          const msg = t(`errors.${data.errorCode}` as "errors.emailInvalid");
          if (data.field) {
            setFieldErrors({ [data.field]: msg });
          }
          throw new Error(msg);
        }
        throw new Error(data.error || t("errorGeneric"));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitErr) {
      setError(submitErr instanceof Error ? submitErr.message : t("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  const strength = passwordStrength(form.password);
  const inv = (field: string) => (fieldErrors[field] ? " input-invalid" : "");

  const stepLabels = [t("steps.personal"), t("steps.contact"), t("steps.education"), t("steps.account")];

  return (
    <div className="login-wrapper register-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="login-container">
        <div className="login-card register-card">
          <div className="login-header">
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
          </div>

          <div className="register-progress">
            {stepLabels.map((label, index) => {
              const num = index + 1;
              const cls =
                num === step ? "register-step-pill active" : num < step ? "register-step-pill done" : "register-step-pill";
              return (
                <div key={label} className={cls}>
                  {num < step ? "✓ " : `${num}. `}
                  {label}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}

            {step === 1 && (
              <div className="register-section">
                <h3 className="register-section-title">{t("sections.personal")}</h3>
                <p className="register-section-desc">{t("sections.personalDesc")}</p>
                <div className="register-grid">
                  <div className="input-group">
                    <label>{t("firstName")}</label>
                    <div className={`input-wrapper${inv("firstName")}`}>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => update({ firstName: e.target.value })}
                        placeholder={t("firstNamePlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.firstName} />
                  </div>
                  <div className="input-group">
                    <label>{t("lastName")}</label>
                    <div className={`input-wrapper${inv("lastName")}`}>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => update({ lastName: e.target.value })}
                        placeholder={t("lastNamePlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.lastName} />
                  </div>
                  <div className="input-group">
                    <label>{t("dateOfBirth")}</label>
                    <div className={`input-wrapper${inv("dateOfBirth")}`}>
                      <input
                        type="date"
                        required
                        value={form.dateOfBirth}
                        onChange={(e) => update({ dateOfBirth: e.target.value })}
                      />
                    </div>
                    <FieldError message={fieldErrors.dateOfBirth} />
                  </div>
                  <div className="input-group">
                    <label>{t("gender")}</label>
                    <select
                      className={`register-select${inv("gender")}`}
                      required
                      value={form.gender}
                      onChange={(e) => update({ gender: e.target.value })}
                    >
                      <option value="">{t("selectOption")}</option>
                      <option value="male">{t("genderMale")}</option>
                      <option value="female">{t("genderFemale")}</option>
                      <option value="prefer_not">{t("genderPreferNot")}</option>
                    </select>
                    <FieldError message={fieldErrors.gender} />
                  </div>
                  <div className="input-group full-width">
                    <label>{t("nationalId")}</label>
                    <div className={`input-wrapper${inv("nationalId")}`}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.nationalId}
                        onChange={(e) => update({ nationalId: e.target.value.replace(/\D/g, "").slice(0, 14) })}
                        placeholder={t("nationalIdPlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.nationalId} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="register-section">
                <h3 className="register-section-title">{t("sections.contact")}</h3>
                <p className="register-section-desc">{t("sections.contactDesc")}</p>
                <div className="register-grid">
                  <div className="input-group full-width">
                    <label>{t("email")}</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update({ email: e.target.value })}
                        placeholder="name@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t("phone")}</label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => update({ phone: e.target.value })}
                        placeholder="+20 1XX XXX XXXX"
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t("whatsapp")}</label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        value={form.whatsapp}
                        onChange={(e) => update({ whatsapp: e.target.value })}
                        placeholder={t("whatsappPlaceholder")}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t("country")}</label>
                    <select
                      className="register-select"
                      required
                      value={form.country}
                      onChange={(e) => update({ country: e.target.value })}
                    >
                      <option value="Egypt">{t("countryEgypt")}</option>
                      <option value="Saudi Arabia">{t("countrySaudi")}</option>
                      <option value="UAE">{t("countryUae")}</option>
                      <option value="Other">{t("countryOther")}</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>{t("governorate")}</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        required
                        value={form.governorate}
                        onChange={(e) => update({ governorate: e.target.value })}
                        placeholder={t("governoratePlaceholder")}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t("city")}</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => update({ city: e.target.value })}
                        placeholder={t("cityPlaceholder")}
                      />
                    </div>
                  </div>
                  <div className="input-group full-width">
                    <label>{t("address")}</label>
                    <textarea
                      className="register-textarea"
                      required
                      value={form.address}
                      onChange={(e) => update({ address: e.target.value })}
                      placeholder={t("addressPlaceholder")}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="register-section">
                  <h3 className="register-section-title">{t("sections.education")}</h3>
                  <p className="register-section-desc">{t("sections.educationDesc")}</p>
                  <div className="register-grid">
                    <div className="input-group full-width">
                      <label>{t("schoolName")}</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          required
                          value={form.schoolName}
                          onChange={(e) => update({ schoolName: e.target.value })}
                          placeholder={t("schoolNamePlaceholder")}
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>{t("schoolType")}</label>
                      <select
                        className="register-select"
                        required
                        value={form.schoolType}
                        onChange={(e) => update({ schoolType: e.target.value })}
                      >
                        <option value="">{t("selectOption")}</option>
                        <option value="public">{t("schoolPublic")}</option>
                        <option value="private">{t("schoolPrivate")}</option>
                        <option value="international">{t("schoolInternational")}</option>
                        <option value="other">{t("schoolOther")}</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t("gradeLevel")}</label>
                      <select
                        className="register-select"
                        required
                        value={form.gradeLevel}
                        onChange={(e) => update({ gradeLevel: e.target.value })}
                      >
                        <option value="">{t("selectOption")}</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="University Year 1">University Year 1</option>
                        <option value="University Year 2+">University Year 2+</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t("academicTrack")}</label>
                      <select
                        className="register-select"
                        required
                        value={form.academicTrack}
                        onChange={(e) => update({ academicTrack: e.target.value })}
                      >
                        <option value="">{t("selectOption")}</option>
                        <option value="Science">{t("trackScience")}</option>
                        <option value="Literary">{t("trackLiterary")}</option>
                        <option value="Mixed">{t("trackMixed")}</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t("graduationYear")}</label>
                      <select
                        className="register-select"
                        required
                        value={form.graduationYear}
                        onChange={(e) => update({ graduationYear: e.target.value })}
                      >
                        <option value="">{t("selectOption")}</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t("studentId")}</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          value={form.studentId}
                          onChange={(e) => update({ studentId: e.target.value })}
                          placeholder={t("studentIdPlaceholder")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="register-section">
                  <h3 className="register-section-title">{t("sections.parent")}</h3>
                  <p className="register-section-desc">{t("sections.parentDesc")}</p>
                  <div className="register-grid">
                    <div className="input-group full-width">
                      <label>{t("parentName")}</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          required
                          value={form.parentName}
                          onChange={(e) => update({ parentName: e.target.value })}
                          placeholder={t("parentNamePlaceholder")}
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>{t("parentPhone")}</label>
                      <div className="input-wrapper">
                        <input
                          type="tel"
                          required
                          value={form.parentPhone}
                          onChange={(e) => update({ parentPhone: e.target.value })}
                          placeholder="+20 ..."
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>{t("parentEmail")}</label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          value={form.parentEmail}
                          onChange={(e) => update({ parentEmail: e.target.value })}
                          placeholder="parent@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="register-section">
                  <h3 className="register-section-title">{t("sections.preferences")}</h3>
                  <p className="register-section-desc">{t("sections.preferencesDesc")}</p>
                  <div className="register-grid">
                    <div className="input-group">
                      <label>{t("preferredLanguage")}</label>
                      <select
                        className="register-select"
                        value={form.preferredLanguage}
                        onChange={(e) => update({ preferredLanguage: e.target.value })}
                      >
                        <option value="ar">{t("langAr")}</option>
                        <option value="en">{t("langEn")}</option>
                        <option value="both">{t("langBoth")}</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t("referralSource")}</label>
                      <select
                        className="register-select"
                        required
                        value={form.referralSource}
                        onChange={(e) => update({ referralSource: e.target.value })}
                      >
                        <option value="">{t("selectOption")}</option>
                        <option value="friend">{t("referralFriend")}</option>
                        <option value="school">{t("referralSchool")}</option>
                        <option value="social">{t("referralSocial")}</option>
                        <option value="search">{t("referralSearch")}</option>
                        <option value="other">{t("referralOther")}</option>
                      </select>
                    </div>
                    <div className="input-group full-width">
                      <label>{t("interests")}</label>
                      <div className="register-interests">
                        {INTEREST_KEYS.map((key) => (
                          <label key={key} className="register-interest">
                            <input
                              type="checkbox"
                              checked={form.interests.includes(key)}
                              onChange={() => toggleInterest(key)}
                            />
                            {t(`interest.${key}`)}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="input-group full-width">
                      <label>{t("studyGoals")}</label>
                      <textarea
                        className="register-textarea"
                        value={form.studyGoals}
                        onChange={(e) => update({ studyGoals: e.target.value })}
                        placeholder={t("studyGoalsPlaceholder")}
                      />
                    </div>
                  </div>
                </div>

                <div className="register-section">
                  <h3 className="register-section-title">{t("sections.security")}</h3>
                  <p className="register-section-desc">{t("sections.securityDesc")}</p>
                  <div className="register-grid">
                    <div className="input-group">
                      <label>{t("password")}</label>
                      <div className={`input-wrapper${inv("password")}`}>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={form.password}
                          onChange={(e) => update({ password: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "🙈" : "👁"}
                        </button>
                      </div>
                      <p className="field-hint">{t("passwordHint")}</p>
                      {strength !== "none" && (
                        <div className={`password-strength strength-${strength}`}>
                          <div className="password-strength-bar" />
                          <p className="password-strength-label">
                            {strength === "weak" && t("strengthWeak")}
                            {strength === "medium" && t("strengthMedium")}
                            {strength === "strong" && t("strengthStrong")}
                          </p>
                        </div>
                      )}
                      <FieldError message={fieldErrors.password} />
                    </div>
                    <div className="input-group">
                      <label>{t("confirmPassword")}</label>
                      <div className={`input-wrapper${inv("confirmPassword")}`}>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={form.confirmPassword}
                          onChange={(e) => update({ confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                      <FieldError message={fieldErrors.confirmPassword} />
                    </div>
                  </div>

                  <FieldError message={fieldErrors.acceptTerms} />

                  <label className="register-check-row">
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(e) => update({ acceptTerms: e.target.checked })}
                    />
                    <span>{t("acceptTerms")}</span>
                  </label>
                  <label className="register-check-row">
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={(e) => update({ newsletter: e.target.checked })}
                    />
                    <span>{t("newsletter")}</span>
                  </label>
                </div>
              </>
            )}

            <div className="register-nav">
              {step > 1 ? (
                <button type="button" className="btn-ghost" onClick={prevStep}>
                  ← {t("back")}
                </button>
              ) : (
                <span />
              )}

              {step < TOTAL_STEPS ? (
                <button type="button" className="btn-primary" onClick={nextStep}>
                  {t("next")} →
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? t("loading") : t("submit")}
                </button>
              )}
            </div>
          </form>

          <p className="signup-link">
            {t("hasAccount")} <Link href="/login">{t("login")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
