"use client";

import "./LoginView.css";
import "./RegisterView.css";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  validateRegisterStep,
  type RegisterPayload,
} from "@/lib/register-validation";

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

const PASSWORD_FILTER = ["passwordRequired", "passwordWeak", "passwordMatch"] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}

type FormState = Omit<RegisterPayload, "password" | "confirmPassword"> & {
  newsletter: boolean;
};

type OAuthUser = {
  name: string;
  email: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
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
  newsletter: false,
  acceptTerms: false,
};

function formToPayload(form: FormState): RegisterPayload {
  return {
    ...form,
    password: "Aa1234567",
    confirmPassword: "Aa1234567",
  };
}

export default function CompleteProfileView() {
  const t = useTranslations("CompleteProfile");
  const tRegister = useTranslations("Register");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [oauthUser, setOauthUser] = useState<OAuthUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // Safety net: if the server never responds, stop loading after 10s
    const timeout = setTimeout(() => controller.abort(), 10_000);

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/complete-profile", {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          // 401 = not authenticated — send to login
          if (response.status === 401) {
            window.location.replace("/login");
            return;
          }
          throw new Error(data.error || tRegister("errorGeneric"));
        }

        if (cancelled) return;

        const user = data.user as OAuthUser;
        setOauthUser(user);

        const firstName = user.firstName || user.name?.split(" ")[0] || "";
        const lastName = user.lastName || user.name?.split(" ").slice(1).join(" ") || "";

        setForm((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: user.email || "",
        }));
      } catch (loadErr) {
        if (cancelled) return;
        if ((loadErr as { name?: string }).name === "AbortError") {
          setError("انتهت مهلة الاتصال. تحقق من الاتصال وأعد تحميل الصفحة.");
        } else {
          setError(loadErr instanceof Error ? loadErr.message : tRegister("errorGeneric"));
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [tRegister]);

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
    let issues = validateRegisterStep(current, formToPayload(form));
    if (current === 4) {
      issues = issues.filter(
        (issue) => !PASSWORD_FILTER.includes(issue.code as (typeof PASSWORD_FILTER)[number])
      );
    }

    const map: Record<string, string> = {};
    for (const issue of issues) {
      if (!map[issue.field]) {
        map[issue.field] = tRegister(`errors.${issue.code}` as "errors.firstNameShort");
      }
    }
    setFieldErrors(map);
    if (issues.length > 0) {
      setError(tRegister(`errors.${issues[0].code}` as "errors.firstNameShort"));
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
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errorCode) {
          const msg = tRegister(`errors.${data.errorCode}` as "errors.emailInvalid");
          if (data.field) {
            setFieldErrors({ [data.field]: msg });
          }
          throw new Error(msg);
        }
        throw new Error(data.error || tRegister("errorGeneric"));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitErr) {
      setError(submitErr instanceof Error ? submitErr.message : tRegister("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  const inv = (field: string) => (fieldErrors[field] ? " input-invalid" : "");

  const stepLabels = [
    t("steps.personal"),
    t("steps.contact"),
    t("steps.education"),
    t("steps.preferences"),
  ];

  if (profileLoading) {
    return (
      <div className="login-wrapper register-wrapper">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="login-container">
          <div className="login-card register-card" style={{ textAlign: "center" }}>
            <div className="login-header">
              <h1>{t("title")}</h1>
              <p>{t("loading")}</p>
            </div>
            <span className="oauth-spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: "1.5rem auto", display: "block" }} />
          </div>
        </div>
      </div>
    );
  }

  // If fetch failed before the form could load, show error + retry
  if (error && !oauthUser) {
    return (
      <div className="login-wrapper register-wrapper">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="login-container">
          <div className="login-card register-card" style={{ textAlign: "center" }}>
            <div className="login-header">
              <h1>{t("title")}</h1>
            </div>
            <div className="login-error" style={{ margin: "1rem 0" }}>{error}</div>
            <button
              className="btn-primary full-width"
              style={{ marginTop: "1rem" }}
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </button>
            <button
              className="btn-ghost"
              style={{ marginTop: "0.75rem", width: "100%" }}
              onClick={() => window.location.replace("/login")}
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper register-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="login-container">
        <div className="login-card register-card">
          <div className="login-header">
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
            <p className="register-section-desc" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
              {t("oauthBanner")}
            </p>
          </div>

          {oauthUser && (
            <div
              className="register-section"
              style={{
                marginBottom: "1.25rem",
                paddingBottom: "1.25rem",
                borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                {oauthUser.avatar ? (
                  <img
                    src={oauthUser.avatar}
                    alt=""
                    width={44}
                    height={44}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(99, 102, 241, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "var(--pl, #6366f1)",
                    }}
                  >
                    {(oauthUser.email?.[0] || "?").toUpperCase()}
                  </div>
                )}
                <div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--muted-foreground, #64748b)",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {t("readonlyEmail", { email: oauthUser.email })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="register-progress">
            {stepLabels.map((label, index) => {
              const num = index + 1;
              const cls =
                num === step
                  ? "register-step-pill active"
                  : num < step
                    ? "register-step-pill done"
                    : "register-step-pill";
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
                <h3 className="register-section-title">{tRegister("sections.personal")}</h3>
                <p className="register-section-desc">{tRegister("sections.personalDesc")}</p>
                <div className="register-grid">
                  <div className="input-group">
                    <label>{tRegister("firstName")}</label>
                    <div className={`input-wrapper${inv("firstName")}`}>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => update({ firstName: e.target.value })}
                        placeholder={tRegister("firstNamePlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.firstName} />
                  </div>
                  <div className="input-group">
                    <label>{tRegister("lastName")}</label>
                    <div className={`input-wrapper${inv("lastName")}`}>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => update({ lastName: e.target.value })}
                        placeholder={tRegister("lastNamePlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.lastName} />
                  </div>
                  <div className="input-group">
                    <label>{tRegister("dateOfBirth")}</label>
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
                    <label>{tRegister("gender")}</label>
                    <select
                      className={`register-select${inv("gender")}`}
                      required
                      value={form.gender}
                      onChange={(e) => update({ gender: e.target.value })}
                    >
                      <option value="">{tRegister("selectOption")}</option>
                      <option value="male">{tRegister("genderMale")}</option>
                      <option value="female">{tRegister("genderFemale")}</option>
                      <option value="prefer_not">{tRegister("genderPreferNot")}</option>
                    </select>
                    <FieldError message={fieldErrors.gender} />
                  </div>
                  <div className="input-group full-width">
                    <label>{tRegister("nationalId")}</label>
                    <div className={`input-wrapper${inv("nationalId")}`}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.nationalId}
                        onChange={(e) =>
                          update({ nationalId: e.target.value.replace(/\D/g, "").slice(0, 14) })
                        }
                        placeholder={tRegister("nationalIdPlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.nationalId} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="register-section">
                <h3 className="register-section-title">{tRegister("sections.contact")}</h3>
                <p className="register-section-desc">{tRegister("sections.contactDesc")}</p>
                <div className="register-grid">
                  <div className="input-group">
                    <label>{tRegister("phone")}</label>
                    <div className={`input-wrapper${inv("phone")}`}>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => update({ phone: e.target.value })}
                        placeholder="+20 1XX XXX XXXX"
                      />
                    </div>
                    <FieldError message={fieldErrors.phone} />
                  </div>
                  <div className="input-group">
                    <label>{tRegister("whatsapp")}</label>
                    <div className={`input-wrapper${inv("whatsapp")}`}>
                      <input
                        type="tel"
                        value={form.whatsapp}
                        onChange={(e) => update({ whatsapp: e.target.value })}
                        placeholder={tRegister("whatsappPlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.whatsapp} />
                  </div>
                  <div className="input-group">
                    <label>{tRegister("country")}</label>
                    <select
                      className={`register-select${inv("country")}`}
                      required
                      value={form.country}
                      onChange={(e) => update({ country: e.target.value })}
                    >
                      <option value="Egypt">{tRegister("countryEgypt")}</option>
                      <option value="Saudi Arabia">{tRegister("countrySaudi")}</option>
                      <option value="UAE">{tRegister("countryUae")}</option>
                      <option value="Other">{tRegister("countryOther")}</option>
                    </select>
                    <FieldError message={fieldErrors.country} />
                  </div>
                  <div className="input-group">
                    <label>{tRegister("governorate")}</label>
                    <div className={`input-wrapper${inv("governorate")}`}>
                      <input
                        type="text"
                        required
                        value={form.governorate}
                        onChange={(e) => update({ governorate: e.target.value })}
                        placeholder={tRegister("governoratePlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.governorate} />
                  </div>
                  <div className="input-group">
                    <label>{tRegister("city")}</label>
                    <div className={`input-wrapper${inv("city")}`}>
                      <input
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => update({ city: e.target.value })}
                        placeholder={tRegister("cityPlaceholder")}
                      />
                    </div>
                    <FieldError message={fieldErrors.city} />
                  </div>
                  <div className="input-group full-width">
                    <label>{tRegister("address")}</label>
                    <textarea
                      className={`register-textarea${inv("address")}`}
                      required
                      value={form.address}
                      onChange={(e) => update({ address: e.target.value })}
                      placeholder={tRegister("addressPlaceholder")}
                    />
                    <FieldError message={fieldErrors.address} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="register-section">
                  <h3 className="register-section-title">{tRegister("sections.education")}</h3>
                  <p className="register-section-desc">{tRegister("sections.educationDesc")}</p>
                  <div className="register-grid">
                    <div className="input-group full-width">
                      <label>{tRegister("schoolName")}</label>
                      <div className={`input-wrapper${inv("schoolName")}`}>
                        <input
                          type="text"
                          required
                          value={form.schoolName}
                          onChange={(e) => update({ schoolName: e.target.value })}
                          placeholder={tRegister("schoolNamePlaceholder")}
                        />
                      </div>
                      <FieldError message={fieldErrors.schoolName} />
                    </div>
                    <div className="input-group">
                      <label>{tRegister("schoolType")}</label>
                      <select
                        className={`register-select${inv("schoolType")}`}
                        required
                        value={form.schoolType}
                        onChange={(e) => update({ schoolType: e.target.value })}
                      >
                        <option value="">{tRegister("selectOption")}</option>
                        <option value="public">{tRegister("schoolPublic")}</option>
                        <option value="private">{tRegister("schoolPrivate")}</option>
                        <option value="international">{tRegister("schoolInternational")}</option>
                        <option value="other">{tRegister("schoolOther")}</option>
                      </select>
                      <FieldError message={fieldErrors.schoolType} />
                    </div>
                    <div className="input-group">
                      <label>{tRegister("gradeLevel")}</label>
                      <select
                        className={`register-select${inv("gradeLevel")}`}
                        required
                        value={form.gradeLevel}
                        onChange={(e) => update({ gradeLevel: e.target.value })}
                      >
                        <option value="">{tRegister("selectOption")}</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="University Year 1">University Year 1</option>
                        <option value="University Year 2+">University Year 2+</option>
                      </select>
                      <FieldError message={fieldErrors.gradeLevel} />
                    </div>
                    <div className="input-group">
                      <label>{tRegister("academicTrack")}</label>
                      <select
                        className={`register-select${inv("academicTrack")}`}
                        required
                        value={form.academicTrack}
                        onChange={(e) => update({ academicTrack: e.target.value })}
                      >
                        <option value="">{tRegister("selectOption")}</option>
                        <option value="Science">{tRegister("trackScience")}</option>
                        <option value="Literary">{tRegister("trackLiterary")}</option>
                        <option value="Mixed">{tRegister("trackMixed")}</option>
                      </select>
                      <FieldError message={fieldErrors.academicTrack} />
                    </div>
                    <div className="input-group">
                      <label>{tRegister("graduationYear")}</label>
                      <select
                        className={`register-select${inv("graduationYear")}`}
                        required
                        value={form.graduationYear}
                        onChange={(e) => update({ graduationYear: e.target.value })}
                      >
                        <option value="">{tRegister("selectOption")}</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                      </select>
                      <FieldError message={fieldErrors.graduationYear} />
                    </div>
                    <div className="input-group">
                      <label>{tRegister("studentId")}</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          value={form.studentId}
                          onChange={(e) => update({ studentId: e.target.value })}
                          placeholder={tRegister("studentIdPlaceholder")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="register-section">
                  <h3 className="register-section-title">{tRegister("sections.parent")}</h3>
                  <p className="register-section-desc">{tRegister("sections.parentDesc")}</p>
                  <div className="register-grid">
                    <div className="input-group full-width">
                      <label>{tRegister("parentName")}</label>
                      <div className={`input-wrapper${inv("parentName")}`}>
                        <input
                          type="text"
                          required
                          value={form.parentName}
                          onChange={(e) => update({ parentName: e.target.value })}
                          placeholder={tRegister("parentNamePlaceholder")}
                        />
                      </div>
                      <FieldError message={fieldErrors.parentName} />
                    </div>
                    <div className="input-group">
                      <label>{tRegister("parentPhone")}</label>
                      <div className={`input-wrapper${inv("parentPhone")}`}>
                        <input
                          type="tel"
                          required
                          value={form.parentPhone}
                          onChange={(e) => update({ parentPhone: e.target.value })}
                          placeholder="+20 ..."
                        />
                      </div>
                      <FieldError message={fieldErrors.parentPhone} />
                    </div>
                    <div className="input-group">
                      <label>{tRegister("parentEmail")}</label>
                      <div className={`input-wrapper${inv("parentEmail")}`}>
                        <input
                          type="email"
                          value={form.parentEmail}
                          onChange={(e) => update({ parentEmail: e.target.value })}
                          placeholder="parent@example.com"
                        />
                      </div>
                      <FieldError message={fieldErrors.parentEmail} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="register-section">
                <h3 className="register-section-title">{tRegister("sections.preferences")}</h3>
                <p className="register-section-desc">{tRegister("sections.preferencesDesc")}</p>
                <div className="register-grid">
                  <div className="input-group">
                    <label>{tRegister("preferredLanguage")}</label>
                    <select
                      className="register-select"
                      value={form.preferredLanguage}
                      onChange={(e) => update({ preferredLanguage: e.target.value })}
                    >
                      <option value="ar">{tRegister("langAr")}</option>
                      <option value="en">{tRegister("langEn")}</option>
                      <option value="both">{tRegister("langBoth")}</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>{tRegister("referralSource")}</label>
                    <select
                      className={`register-select${inv("referralSource")}`}
                      required
                      value={form.referralSource}
                      onChange={(e) => update({ referralSource: e.target.value })}
                    >
                      <option value="">{tRegister("selectOption")}</option>
                      <option value="friend">{tRegister("referralFriend")}</option>
                      <option value="school">{tRegister("referralSchool")}</option>
                      <option value="social">{tRegister("referralSocial")}</option>
                      <option value="search">{tRegister("referralSearch")}</option>
                      <option value="other">{tRegister("referralOther")}</option>
                    </select>
                    <FieldError message={fieldErrors.referralSource} />
                  </div>
                  <div className="input-group full-width">
                    <label>{tRegister("interests")}</label>
                    <div className="register-interests">
                      {INTEREST_KEYS.map((key) => (
                        <label key={key} className="register-interest">
                          <input
                            type="checkbox"
                            checked={form.interests.includes(key)}
                            onChange={() => toggleInterest(key)}
                          />
                          {tRegister(`interest.${key}`)}
                        </label>
                      ))}
                    </div>
                    <FieldError message={fieldErrors.interests} />
                  </div>
                  <div className="input-group full-width">
                    <label>{tRegister("studyGoals")}</label>
                    <textarea
                      className={`register-textarea${inv("studyGoals")}`}
                      value={form.studyGoals}
                      onChange={(e) => update({ studyGoals: e.target.value })}
                      placeholder={tRegister("studyGoalsPlaceholder")}
                    />
                    <FieldError message={fieldErrors.studyGoals} />
                  </div>
                </div>

                <FieldError message={fieldErrors.acceptTerms} />

                <label className="register-check-row">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(e) => update({ acceptTerms: e.target.checked })}
                  />
                  <span>{tRegister("acceptTerms")}</span>
                </label>
                <label className="register-check-row">
                  <input
                    type="checkbox"
                    checked={form.newsletter}
                    onChange={(e) => update({ newsletter: e.target.checked })}
                  />
                  <span>{tRegister("newsletter")}</span>
                </label>
              </div>
            )}

            <div className="register-nav">
              {step > 1 ? (
                <button type="button" className="btn-ghost" onClick={prevStep}>
                  ← {tRegister("back")}
                </button>
              ) : (
                <span />
              )}

              {step < TOTAL_STEPS ? (
                <button type="button" className="btn-primary" onClick={nextStep}>
                  {tRegister("next")} →
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? t("loading") : t("submit")}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
