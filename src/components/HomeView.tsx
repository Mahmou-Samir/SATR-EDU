import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

const MARQUEE_KEYS = [
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
  "philosophy",
  "art",
] as const;

const FEATURE_ITEMS = [
  { key: "tutor", icon: "🤖", iconClass: "fi-purple", tagOrange: false },
  { key: "ocr", icon: "📷", iconClass: "fi-orange", tagOrange: true },
  { key: "questions", icon: "🧠", iconClass: "fi-purple", tagOrange: false },
  { key: "analytics", icon: "📊", iconClass: "fi-purple", tagOrange: false },
  { key: "marketplace", icon: "🎓", iconClass: "fi-orange", tagOrange: true },
  { key: "educators", icon: "🛒", iconClass: "fi-orange", tagOrange: true },
] as const;

const EXAM_STEPS = ["upload", "ocr", "grade", "report"] as const;

const COURSE_ITEMS = [
  { key: "calculus", thumb: "🧮", thumbClass: "ct-math", freePrice: false },
  { key: "chemistry", thumb: "⚗️", thumbClass: "ct-sci", freePrice: false },
  { key: "english", thumb: "🌐", thumbClass: "ct-lang", freePrice: false },
  { key: "python", thumb: "💻", thumbClass: "ct-prog", freePrice: true },
] as const;

const TESTIMONIAL_ITEMS = [
  {
    key: "youssef",
    initials: "YM",
    avatarStyle: { background: "linear-gradient(135deg,var(--p),var(--pl))" },
  },
  {
    key: "nour",
    initials: "NR",
    avatarStyle: { background: "linear-gradient(135deg,#6d1d6d,#b845b8)" },
  },
  {
    key: "hassan",
    initials: "HT",
    avatarStyle: { background: "linear-gradient(135deg,#1d4d6d,#4580b8)" },
  },
] as const;

const AI_BULLET_KEYS = ["memory", "subjects", "streaming", "rag", "safe"] as const;

const FREE_PLAN_FEATURES = [
  { key: "courses", muted: false },
  { key: "tutor", muted: false },
  { key: "grading", muted: false },
  { key: "dashboard", muted: false },
  { key: "generator", muted: true },
  { key: "unlimitedChat", muted: true },
] as const;

const PRO_PLAN_FEATURES = [
  "courses",
  "tutor",
  "grading",
  "generator",
  "analytics",
  "support",
] as const;

const SCHOOL_PLAN_FEATURES = [
  "pro",
  "teacherDashboard",
  "groupAnalytics",
  "curriculum",
  "manager",
  "api",
] as const;

export default async function HomeView() {
  const t = await getTranslations("Home");

  const marqueeLabels = MARQUEE_KEYS.map((key) => t(`marquee.${key}`));

  return (
    <div className="page active">
      <div className="hero">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="hero-eyebrow">
          <span className="badge badge-purple">
            <span className="badge-dot"></span>
            {t("hero.badge")}
          </span>
        </div>
        <h1 dangerouslySetInnerHTML={{ __html: t.raw("hero.title") }} />
        <p className="hero-sub">{t("hero.subtitle")}</p>
        <div className="hero-btns">
          <Link href="/register" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
            {t("hero.ctaPrimary")}
          </Link>
          <Link href="/chat" className="btn btn-ghost btn-lg" style={{ textDecoration: "none" }}>
            {t("hero.ctaSecondary")}
          </Link>
        </div>
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num">{t("hero.statStudentsNum")}</div>
            <div className="stat-label">{t("hero.statStudents")}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{t("hero.statCoursesNum")}</div>
            <div className="stat-label">{t("hero.statCourses")}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{t("hero.statSatisfactionNum")}</div>
            <div className="stat-label">{t("hero.statSatisfaction")}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{t("hero.statSupportNum")}</div>
            <div className="stat-label">{t("hero.statSupport")}</div>
          </div>
        </div>
      </div>

      <div className="marquee-section">
        <div className="marquee-track">
          {[...marqueeLabels, ...marqueeLabels].map((label, index) => (
            <div key={index} className="marquee-item">
              <div className="marquee-dot"></div>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="feat-header">
          <span className="badge badge-orange" style={{ marginBottom: "1rem" }}>
            {t("features.badge")}
          </span>
          <h2 dangerouslySetInnerHTML={{ __html: t.raw("features.title") }} />
          <p style={{ color: "var(--muted)", maxWidth: "480px", marginTop: ".75rem", lineHeight: "1.8" }}>
            {t("features.subtitle")}
          </p>
        </div>
        <div className="feat-grid">
          {FEATURE_ITEMS.map(({ key, icon, iconClass, tagOrange }) => (
            <div key={key} className="feat-card">
              <div className={`feat-icon ${iconClass}`}>{icon}</div>
              <span className={`feat-tag${tagOrange ? " orange" : ""}`}>{t(`features.items.${key}.tag`)}</span>
              <h3>{t(`features.items.${key}.title`)}</h3>
              <p>{t(`features.items.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(180deg,transparent,rgba(100,50,201,.06),transparent)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="section">
          <div className="ai-section">
            <div className="ai-info">
              <span className="badge badge-purple" style={{ marginBottom: "1.25rem" }}>
                <span className="badge-dot"></span>
                {t("aiTutor.badge")}
              </span>
              <h2 dangerouslySetInnerHTML={{ __html: t.raw("aiTutor.title") }} />
              <p style={{ marginTop: "1rem" }}>{t("aiTutor.subtitle")}</p>
              <div className="ai-bullets">
                {AI_BULLET_KEYS.map((key) => (
                  <div key={key} className="ai-bullet">
                    <div className="bullet-dot"></div>
                    {t(`aiTutor.bullets.${key}`)}
                  </div>
                ))}
              </div>
              <Link href="/chat" className="btn btn-primary" style={{ textDecoration: "none" }}>
                {t("aiTutor.cta")}
              </Link>
            </div>
            <div className="chat-widget">
              <div className="chat-topbar">
                <div className="chat-ai-ava">🤖</div>
                <div>
                  <div className="chat-ai-name">{t("aiTutor.demo.name")}</div>
                  <div className="chat-online">{t("aiTutor.demo.online")}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
                  <span
                    style={{
                      padding: ".25rem .75rem",
                      borderRadius: "100px",
                      background: "rgba(100,50,201,.15)",
                      color: "var(--pl)",
                      fontSize: ".7rem",
                      fontWeight: 600,
                      border: "1px solid rgba(100,50,201,.2)",
                    }}
                  >
                    {t("aiTutor.demo.contextChip")}
                  </span>
                </div>
              </div>
              <div className="chat-body">
                <div className="msg msg-user">
                  <div
                    className="bubble bubble-user"
                    style={{
                      background: "rgba(255,255,255,.07)",
                      color: "var(--muted)",
                      borderRadius: "var(--r12) var(--r12) var(--r12) 4px",
                      maxWidth: "85%",
                    }}
                  >
                    {t("aiTutor.demo.userMessage1")}
                  </div>
                </div>
                <div className="msg msg-ai" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div
                    className="bubble"
                    style={{
                      background: "linear-gradient(135deg,var(--p),#7b45e5)",
                      color: "#fff",
                      borderRadius: "var(--r12) 4px var(--r12) var(--r12)",
                      maxWidth: "85%",
                    }}
                  >
                    {t("aiTutor.demo.aiMessage1")}
                    <br />
                    <div
                      className="formula-box"
                      style={{
                        background: "rgba(0,0,0,.2)",
                        borderColor: "rgba(255,255,255,.2)",
                        color: "#fff",
                        margin: ".6rem 0",
                      }}
                    >
                      {t("aiTutor.demo.formula")}
                    </div>
                    {t("aiTutor.demo.aiExample")}
                  </div>
                </div>
                <div className="msg msg-user">
                  <div
                    className="bubble"
                    style={{
                      background: "rgba(255,255,255,.07)",
                      color: "var(--muted)",
                      borderRadius: "var(--r12) var(--r12) var(--r12) 4px",
                      maxWidth: "85%",
                    }}
                  >
                    {t("aiTutor.demo.userMessage2")}
                  </div>
                </div>
                <div className="typing-row">
                  <div className="typing-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
              <div className="chat-input-bar">
                <input type="text" className="chat-input" placeholder={t("aiTutor.demo.inputPlaceholder")} disabled />
                <div className="chat-send">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="exam-section">
          <div>
            <span className="badge badge-orange" style={{ marginBottom: "1.25rem" }}>
              {t("exam.badge")}
            </span>
            <h2 dangerouslySetInnerHTML={{ __html: t.raw("exam.title") }} />
            <p style={{ color: "var(--muted)", marginTop: "1rem", marginBottom: "2rem", lineHeight: "1.8" }}>
              {t("exam.subtitle")}
            </p>
            <button type="button" className="btn btn-accent">
              {t("exam.cta")}
            </button>
          </div>
          <div>
            <div
              style={{
                marginBottom: ".75rem",
                padding: ".6rem 1rem",
                background: "rgba(255,118,76,.08)",
                border: "1px solid rgba(255,118,76,.15)",
                borderRadius: "var(--r8)",
                fontSize: ".78rem",
                color: "var(--al)",
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
              }}
            >
              ⚡ {t("exam.avgTime")} <strong>{t("exam.avgTimeValue")}</strong>
            </div>
            <div className="exam-steps">
              {EXAM_STEPS.map((step, index) => (
                <div key={step} className="step-card">
                  <div className="step-num">{String(index + 1).padStart(2, "0")}</div>
                  <div className="step-text">
                    <h4>{t(`exam.steps.${step}.title`)}</h4>
                    <p>{t(`exam.steps.${step}.desc`)}</p>
                  </div>
                  <div className="step-pill">{t(`exam.steps.${step}.pill`)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div className="section">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <span className="badge badge-purple" style={{ marginBottom: ".75rem" }}>
                {t("coursesPreview.badge")}
              </span>
              <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", letterSpacing: "-.03em" }}>
                {t("coursesPreview.title")}
              </h2>
            </div>
            <Link href="/courses" className="btn btn-ghost" style={{ textDecoration: "none" }}>
              {t("coursesPreview.viewAll")}
            </Link>
          </div>
          <div className="courses-row">
            {COURSE_ITEMS.map(({ key, thumb, thumbClass, freePrice }) => (
              <Link key={key} href="/courses" style={{ textDecoration: "none", color: "inherit" }} className="course-card">
                <div className={`course-thumb ${thumbClass}`}>{thumb}</div>
                <div className="course-body">
                  <div className="course-tag">{t(`coursesPreview.items.${key}.tag`)}</div>
                  <div className="course-title">{t(`coursesPreview.items.${key}.title`)}</div>
                  <div className="course-author">{t(`coursesPreview.items.${key}.author`)}</div>
                  <div className="course-meta">
                    <span className="course-rating">{t(`coursesPreview.items.${key}.rating`)}</span>
                    <span className="course-price" style={freePrice ? { color: "#4ade80" } : undefined}>
                      {t(`coursesPreview.items.${key}.price`)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "rgba(100,50,201,.04)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="section">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge badge-purple" style={{ marginBottom: "1rem" }}>
              {t("testimonials.badge")}
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", letterSpacing: "-.03em" }}>
              {t("testimonials.title")}
            </h2>
          </div>
          <div className="testi-grid">
            {TESTIMONIAL_ITEMS.map(({ key, initials, avatarStyle }) => (
              <div key={key} className="testi-card">
                <div className="testi-stars">★★★★★</div>
                <div className="testi-text">{t(`testimonials.items.${key}.text`)}</div>
                <div className="testi-author">
                  <div className="testi-ava" style={avatarStyle}>
                    {initials}
                  </div>
                  <div>
                    <div className="testi-name">{t(`testimonials.items.${key}.name`)}</div>
                    <div className="testi-role">{t(`testimonials.items.${key}.role`)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <span className="badge badge-orange" style={{ marginBottom: "1rem" }}>
            {t("pricing.badge")}
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", letterSpacing: "-.03em" }}>{t("pricing.title")}</h2>
          <p style={{ color: "var(--muted)", marginTop: ".75rem" }}>{t("pricing.subtitle")}</p>
        </div>
        <div className="pricing-grid">
          <div className="plan">
            <div className="plan-name">{t("pricing.plans.free.name")}</div>
            <div className="plan-price">
              {t("pricing.plans.free.price")}
              <sub>{t("pricing.plans.free.currency")}</sub>
            </div>
            <div className="plan-period">{t("pricing.plans.free.period")}</div>
            <ul className="plan-features">
              {FREE_PLAN_FEATURES.map(({ key, muted }) => (
                <li key={key} className={muted ? "muted" : undefined}>
                  {t(`pricing.plans.free.features.${key}`)}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
              {t("pricing.plans.free.cta")}
            </Link>
          </div>
          <div className="plan featured">
            <div className="plan-ribbon">{t("pricing.plans.pro.ribbon")}</div>
            <div className="plan-name">{t("pricing.plans.pro.name")}</div>
            <div className="plan-price">
              {t("pricing.plans.pro.price")}
              <sub>{t("pricing.plans.pro.currency")}</sub>
            </div>
            <div className="plan-period">{t("pricing.plans.pro.period")}</div>
            <ul className="plan-features">
              {PRO_PLAN_FEATURES.map((key) => (
                <li key={key}>{t(`pricing.plans.pro.features.${key}`)}</li>
              ))}
            </ul>
            <button type="button" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              {t("pricing.plans.pro.cta")}
            </button>
          </div>
          <div className="plan">
            <div className="plan-name">{t("pricing.plans.school.name")}</div>
            <div className="plan-price">
              {t("pricing.plans.school.price")}
              <sub>{t("pricing.plans.school.currency")}</sub>
            </div>
            <div className="plan-period">{t("pricing.plans.school.period")}</div>
            <ul className="plan-features">
              {SCHOOL_PLAN_FEATURES.map((key) => (
                <li key={key}>{t(`pricing.plans.school.features.${key}`)}</li>
              ))}
            </ul>
            <button type="button" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
              {t("pricing.plans.school.cta")}
            </button>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingTop: "0" }}>
        <div className="cta-block">
          <h2 dangerouslySetInnerHTML={{ __html: t.raw("cta.title") }} />
          <p>{t("cta.subtitle")}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
              {t("cta.primary")}
            </Link>
            <Link href="/chat" className="btn btn-ghost btn-lg" style={{ textDecoration: "none" }}>
              {t("cta.secondary")}
            </Link>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-logo">
          <span>
            SATR<span style={{ color: "var(--pl)" }}>EDU</span>
          </span>
        </div>
        <div className="footer-links">
          <Link href="#">{t("footer.about")}</Link>
          <Link href="/courses">{t("footer.courses")}</Link>
          <Link href="#">{t("footer.schools")}</Link>
          <Link href="#">{t("footer.blog")}</Link>
          <Link href="#">{t("footer.privacy")}</Link>
          <Link href="#">{t("footer.terms")}</Link>
          <Link href="#">{t("footer.contact")}</Link>
        </div>
        <div className="footer-copy">{t("footer.copy")}</div>
      </footer>
    </div>
  );
}
