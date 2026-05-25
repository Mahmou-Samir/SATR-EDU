"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

export default function ChatView() {
  const t = useTranslations("Chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="chat-page">
      {/* HISTORY SIDEBAR */}
      <div className="chat-history-sidebar">
        <div className="chs-head">
          <div className="chs-title">{t("sidebar.title")}</div>
          <div className="chs-search">
            <span style={{ color: "var(--hint)", fontSize: ".85rem" }}>🔍</span>
            <input type="text" placeholder={t("sidebar.searchPlaceholder")} />
          </div>
        </div>
        <div className="chs-list">
          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginBottom: "1rem",
              fontSize: ".82rem",
            }}
          >
            {t("sidebar.newConversation")}
          </button>
          <div className="chs-section-label">{t("sidebar.sections.today")}</div>
          <div className="chs-item active">
            <div className="chs-item-title">
              {t("sidebar.conversations.newton.title")}
            </div>
            <div className="chs-item-meta">
              {t("sidebar.conversations.newton.meta")}
            </div>
          </div>
          <div className="chs-item">
            <div className="chs-item-title">
              {t("sidebar.conversations.integration.title")}
            </div>
            <div className="chs-item-meta">
              {t("sidebar.conversations.integration.meta")}
            </div>
          </div>
          <div className="chs-section-label">
            {t("sidebar.sections.yesterday")}
          </div>
          <div className="chs-item">
            <div className="chs-item-title">
              {t("sidebar.conversations.organic.title")}
            </div>
            <div className="chs-item-meta">
              {t("sidebar.conversations.organic.meta")}
            </div>
          </div>
          <div className="chs-item">
            <div className="chs-item-title">
              {t("sidebar.conversations.arabicEssay.title")}
            </div>
            <div className="chs-item-meta">
              {t("sidebar.conversations.arabicEssay.meta")}
            </div>
          </div>
          <div className="chs-section-label">
            {t("sidebar.sections.thisWeek")}
          </div>
          <div className="chs-item">
            <div className="chs-item-title">
              {t("sidebar.conversations.limits.title")}
            </div>
            <div className="chs-item-meta">
              {t("sidebar.conversations.limits.meta")}
            </div>
          </div>
          <div className="chs-item">
            <div className="chs-item-title">
              {t("sidebar.conversations.ww2.title")}
            </div>
            <div className="chs-item-meta">
              {t("sidebar.conversations.ww2.meta")}
            </div>
          </div>
          <div className="chs-item">
            <div className="chs-item-title">
              {t("sidebar.conversations.python.title")}
            </div>
            <div className="chs-item-meta">
              {t("sidebar.conversations.python.meta")}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="chat-main">
        <div className="chat-main-head">
          <div className="chat-subject">
            <div
              className="subject-icon"
              style={{
                background: "rgba(100,50,201,.2)",
                border: "1px solid rgba(100,50,201,.3)",
              }}
            >
              🔭
            </div>
            <div>
              <div className="subject-name">{t("header.subjectName")}</div>
              <div className="subject-level">{t("header.subjectLevel")}</div>
            </div>
          </div>
          <div className="chat-actions">
            <div className="chat-action-btn" title={t("header.search")}>
              🔍
            </div>
            <div className="chat-action-btn" title={t("header.export")}>
              📤
            </div>
            <div className="chat-action-btn" title={t("header.settings")}>
              ⚙️
            </div>
          </div>
        </div>
        <div className="subject-chips">
          <div className="subj-chip active">{t("subjectChips.physics")}</div>
          <div className="subj-chip">{t("subjectChips.math")}</div>
          <div className="subj-chip">{t("subjectChips.chemistry")}</div>
          <div className="subj-chip">{t("subjectChips.arabic")}</div>
          <div className="subj-chip">{t("subjectChips.english")}</div>
          <div className="subj-chip">{t("subjectChips.biology")}</div>
          <div className="subj-chip">{t("subjectChips.history")}</div>
        </div>
        <div className="chat-messages">
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">
                {t("messages.aiGreeting")}
              </div>
              <div className="msg-time">10:30 AM</div>
            </div>
          </div>
          <div className="chat-msg-row user-row">
            <div className="msg-ava user-ava">AH</div>
            <div className="msg-content">
              <div className="msg-bubble user-bubble">
                {t("messages.userQuestion1")}
              </div>
              <div className="msg-time">10:32 AM</div>
            </div>
          </div>
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">
                <strong>{t("messages.aiAnswer1Title")}</strong>{" "}
                {t("messages.aiAnswer1Body")}
                <div className="formula-box">{t("messages.formula")}</div>
                <strong>{t("messages.aiExampleTitle")}</strong>
                <br />
                {t("messages.aiExampleBody")}
                <br />
                <br />
                {t("messages.aiExampleCalc")}
                <br />
                <br />
                <em>{t("messages.aiExampleNote")}</em>
              </div>
              <div className="msg-time">10:32 AM</div>
            </div>
          </div>
          <div className="chat-msg-row user-row">
            <div className="msg-ava user-ava">AH</div>
            <div className="msg-content">
              <div className="msg-bubble user-bubble">
                {t("messages.userQuestion2")}
              </div>
              <div className="msg-time">10:35 AM</div>
            </div>
          </div>
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">
                {t("messages.aiAnswer2Intro")}
                <br />
                <br />
                <div className="formula-box">
                  {t("messages.aiAnswer2Formula")}
                </div>
                {t("messages.aiAnswer2Example")}
                <br />
                <br />
                {t("messages.aiAnswer2Result")}
                <br />
                <br />
                {t("messages.aiAnswer2Note")}
              </div>
              <div className="msg-time">10:36 AM</div>
            </div>
          </div>
          <div className="chat-msg-row user-row">
            <div className="msg-ava user-ava">AH</div>
            <div className="msg-content">
              <div className="msg-bubble user-bubble">
                {t("messages.userQuestion3")}
              </div>
              <div className="msg-time">10:38 AM</div>
            </div>
          </div>
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">
                {t("messages.aiProblemIntro")}
                <br />
                <br />
                <strong>🏋️ {t("messages.aiProblemTitle")}</strong>
                <br />
                {t("messages.aiProblemBody")}
                <br />
                <br />
                <em>{t("messages.aiProblemFind")}</em>
                <br />
                {t("messages.aiProblemA")}
                <br />
                {t("messages.aiProblemB")}
                <br />
                {t("messages.aiProblemC")}
                <br />
                <br />
                <em>{t("messages.aiProblemHint")}</em>
                <br />
                <br />
                {t("messages.aiProblemClosing")}
              </div>
              <div className="msg-time">10:38 AM</div>
            </div>
          </div>
        </div>
        <div className="chat-input-area">
          <div className="chat-input-box">
            <textarea
              ref={textareaRef}
              onInput={handleInput}
              className="chat-textarea"
              placeholder={t("input.placeholder")}
              rows={1}
            ></textarea>
            <button className="chat-send-btn" title={t("input.send")}>
              →
            </button>
          </div>
          <div className="chat-helper-btns">
            <button className="helper-btn">
              {t("helpers.explainDifferently")}
            </button>
            <button className="helper-btn">{t("helpers.hint")}</button>
            <button className="helper-btn">{t("helpers.practice")}</button>
            <button className="helper-btn">{t("helpers.summarize")}</button>
            <button className="helper-btn">{t("helpers.arabic")}</button>
          </div>
        </div>
      </div>

      {/* CONTEXT PANEL */}
      <div className="ai-context-panel">
        <div className="acp-head">
          <div className="acp-title">{t("context.title")}</div>
          <div className="acp-sub">{t("context.subtitle")}</div>
        </div>
        <div className="acp-section">
          <div className="acp-section-label">{t("context.mastery")}</div>
          <div className="acp-topics">
            <div className="acp-topic">
              <span>{t("context.topics.firstLaw")}</span>
              <span className="acp-topic-strength str-high">
                {t("context.strength.strong")}
              </span>
            </div>
            <div className="acp-topic">
              <span>{t("context.topics.secondLaw")}</span>
              <span className="acp-topic-strength str-med">
                {t("context.strength.learning")}
              </span>
            </div>
            <div className="acp-topic">
              <span>{t("context.topics.thirdLaw")}</span>
              <span className="acp-topic-strength str-low">
                {t("context.strength.weak")}
              </span>
            </div>
            <div className="acp-topic">
              <span>{t("context.topics.friction")}</span>
              <span className="acp-topic-strength str-low">
                {t("context.strength.weak")}
              </span>
            </div>
            <div className="acp-topic">
              <span>{t("context.topics.circular")}</span>
              <span className="acp-topic-strength str-med">
                {t("context.strength.learning")}
              </span>
            </div>
          </div>
          <button className="acp-quiz-btn">{t("context.quizButton")}</button>
        </div>
        <div className="acp-section" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="acp-section-label">{t("context.session")}</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: ".6rem",
            }}
          >
            <div
              style={{
                padding: ".75rem",
                background: "var(--surface)",
                borderRadius: "var(--r8)",
                border: "1px solid var(--border)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--pl)",
                }}
              >
                8
              </div>
              <div
                style={{
                  fontSize: ".68rem",
                  color: "var(--hint)",
                  marginTop: ".2rem",
                }}
              >
                {t("context.messages")}
              </div>
            </div>
            <div
              style={{
                padding: ".75rem",
                background: "var(--surface)",
                borderRadius: "var(--r8)",
                border: "1px solid var(--border)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--a)",
                }}
              >
                12m
              </div>
              <div
                style={{
                  fontSize: ".68rem",
                  color: "var(--hint)",
                  marginTop: ".2rem",
                }}
              >
                {t("context.duration")}
              </div>
            </div>
          </div>
        </div>
        <div className="acp-section" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="acp-section-label">{t("context.related")}</div>
          <div className="related-pills">
            <div className="related-pill">
              {t("context.relatedTopics.momentum")}
            </div>
            <div className="related-pill">
              {t("context.relatedTopics.energy")}
            </div>
            <div className="related-pill">
              {t("context.relatedTopics.workPower")}
            </div>
            <div className="related-pill">
              {t("context.relatedTopics.kinematics")}
            </div>
            <div className="related-pill">
              {t("context.relatedTopics.friction")}
            </div>
            <div className="related-pill">
              {t("context.relatedTopics.gravity")}
            </div>
          </div>
        </div>
        <div className="acp-section" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="acp-section-label">{t("context.examCountdown")}</div>
          <div
            style={{
              padding: "1rem",
              background: "rgba(255,118,76,.08)",
              border: "1px solid rgba(255,118,76,.2)",
              borderRadius: "var(--r8)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font)",
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--a)",
              }}
            >
              8
            </div>
            <div style={{ fontSize: ".75rem", color: "var(--al)" }}>
              {t("context.examDays")}
            </div>
            <div
              style={{
                marginTop: ".6rem",
                fontSize: ".72rem",
                color: "var(--hint)",
              }}
            >
              {t("context.examFocus")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
