"use client";
import { useRef } from "react";

export default function ChatView() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="chat-page">
      {/* HISTORY SIDEBAR */}
      <div className="chat-history-sidebar">
        <div className="chs-head">
          <div className="chs-title">AI Tutor Chats</div>
          <div className="chs-search"><span style={{ color: "var(--hint)", fontSize: ".85rem" }}>🔍</span><input type="text" placeholder="Search conversations..." /></div>
        </div>
        <div className="chs-list">
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "1rem", fontSize: ".82rem" }}>+ New Conversation</button>
          <div className="chs-section-label">Today</div>
          <div className="chs-item active"><div className="chs-item-title">Newton s Laws of Motion</div><div className="chs-item-meta">Math · 2 hours ago</div></div>
          <div className="chs-item"><div className="chs-item-title">Integration by Parts Practice</div><div className="chs-item-meta">Math · 5 hours ago</div></div>
          <div className="chs-section-label">Yesterday</div>
          <div className="chs-item"><div className="chs-item-title">Organic Chemistry — Reactions</div><div className="chs-item-meta">Chemistry · 1 day ago</div></div>
          <div className="chs-item"><div className="chs-item-title">Arabic Essay Structure</div><div className="chs-item-meta">Arabic · 1 day ago</div></div>
          <div className="chs-section-label">This Week</div>
          <div className="chs-item"><div className="chs-item-title">Limits & Continuity</div><div className="chs-item-meta">Math · 3 days ago</div></div>
          <div className="chs-item"><div className="chs-item-title">World War II Summary</div><div className="chs-item-meta">History · 4 days ago</div></div>
          <div className="chs-item"><div className="chs-item-title">Python Functions & Loops</div><div className="chs-item-meta">Programming · 5 days ago</div></div>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="chat-main">
        <div className="chat-main-head">
          <div className="chat-subject">
            <div className="subject-icon" style={{ background: "rgba(100,50,201,.2)", border: "1px solid rgba(100,50,201,.3)" }}>🔭</div>
            <div>
              <div className="subject-name">Physics — Mechanics</div>
              <div className="subject-level">Grade 12 · Newton s Laws</div>
            </div>
          </div>
          <div className="chat-actions">
            <div className="chat-action-btn" title="Search">🔍</div>
            <div className="chat-action-btn" title="Export">📤</div>
            <div className="chat-action-btn" title="Settings">⚙️</div>
          </div>
        </div>
        <div className="subject-chips">
          <div className="subj-chip active">Physics</div>
          <div className="subj-chip">Math</div>
          <div className="subj-chip">Chemistry</div>
          <div className="subj-chip">Arabic</div>
          <div className="subj-chip">English</div>
          <div className="subj-chip">Biology</div>
          <div className="subj-chip">History</div>
        </div>
        <div className="chat-messages">
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">Hello Ahmed! I m your Satr AI Tutor. I can see studying Physics — Mechanics today. What would you like to explore? I can explain concepts, solve problems with you, or generate practice questions!</div>
              <div className="msg-time">10:30 AM</div>
            </div>
          </div>
          <div className="chat-msg-row user-row">
            <div className="msg-ava user-ava">AH</div>
            <div className="msg-content">
              <div className="msg-bubble user-bubble">Explain Newton s Second Law with a real-world example please</div>
              <div className="msg-time">10:32 AM</div>
            </div>
          </div>
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">
                <strong>Newton s Second Law of Motion</strong> states that the net force acting on an object equals its mass multiplied by its acceleration:
                <div className="formula-box">F = m × a</div>
                <strong>Real-world example — Car acceleration:</strong><br />
                Imagine a car with a mass of <strong>1,000 kg</strong>. When the engine applies a net force of <strong>5,000 N</strong>, the car accelerates at:<br /><br />
                a = F/m = 5,000 / 1,000 = <strong>5 m/s²</strong><br /><br />
                Now if the same force is applied to a heavier truck (2,000 kg), it only accelerates at 2.5 m/s². <em>More mass = less acceleration for the same force.</em>
              </div>
              <div className="msg-time">10:32 AM</div>
            </div>
          </div>
          <div className="chat-msg-row user-row">
            <div className="msg-ava user-ava">AH</div>
            <div className="msg-content">
              <div className="msg-bubble user-bubble">What happens if we double the force but keep the same mass?</div>
              <div className="msg-time">10:35 AM</div>
            </div>
          </div>
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">
                Great question! If you <strong>double the force</strong> while keeping mass constant, the acceleration also doubles — they have a <em>directly proportional</em> relationship.<br /><br />
                <div className="formula-box">F×2 → a×2 (mass stays constant)</div>
                Using our car example: if we apply 10,000 N instead of 5,000 N to the 1,000 kg car:<br /><br />
                a = 10,000 / 1,000 = <strong>10 m/s²</strong> (exactly doubled! ✓)<br /><br />
                This is why sports cars with more powerful engines accelerate much faster — more force, same mass.
              </div>
              <div className="msg-time">10:36 AM</div>
            </div>
          </div>
          <div className="chat-msg-row user-row">
            <div className="msg-ava user-ava">AH</div>
            <div className="msg-content">
              <div className="msg-bubble user-bubble">Can you give me a practice problem to test myself?</div>
              <div className="msg-time">10:38 AM</div>
            </div>
          </div>
          <div className="chat-msg-row">
            <div className="msg-ava ai-ava">🤖</div>
            <div className="msg-content">
              <div className="msg-bubble ai-bubble">
                Of course! Here s a problem:<br /><br />
                <strong>🏋️ Problem:</strong><br />
                A 5 kg box is pushed across a frictionless floor with a net force of 20 N for 3 seconds.<br /><br />
                <em>Find:</em><br />
                a) The acceleration of the box<br />
                b) The velocity of the box after 3 seconds (starting from rest)<br />
                c) The distance covered in 3 seconds<br /><br />
                <em>Hint: You ll need F = ma and kinematic equations!</em><br /><br />
                Take your time and share your working — I ll check every step! 💪
              </div>
              <div className="msg-time">10:38 AM</div>
            </div>
          </div>
        </div>
        <div className="chat-input-area">
          <div className="chat-input-box">
            <textarea ref={textareaRef} onInput={handleInput} className="chat-textarea" placeholder="Ask anything — a concept, a problem, a formula..." rows={1}></textarea>
            <button className="chat-send-btn">→</button>
          </div>
          <div className="chat-helper-btns">
            <button className="helper-btn">Explain differently</button>
            <button className="helper-btn">Give me a hint</button>
            <button className="helper-btn">Generate practice questions</button>
            <button className="helper-btn">Summarize this topic</button>
            <button className="helper-btn">باللغة العربية</button>
          </div>
        </div>
      </div>

      {/* CONTEXT PANEL */}
      <div className="ai-context-panel">
        <div className="acp-head">
          <div className="acp-title">✨ AI Context Panel</div>
          <div className="acp-sub">Personalized to your learning profile</div>
        </div>
        <div className="acp-section">
          <div className="acp-section-label">Topic Mastery</div>
          <div className="acp-topics">
            <div className="acp-topic"><span>Newton s 1st Law</span><span className="acp-topic-strength str-high">Strong ●</span></div>
            <div className="acp-topic"><span>Newton s 2nd Law</span><span className="acp-topic-strength str-med">Learning ◐</span></div>
            <div className="acp-topic"><span>Newton s 3rd Law</span><span className="acp-topic-strength str-low">Weak ○</span></div>
            <div className="acp-topic"><span>Friction Forces</span><span className="acp-topic-strength str-low">Weak ○</span></div>
            <div className="acp-topic"><span>Circular Motion</span><span className="acp-topic-strength str-med">Learning ◐</span></div>
          </div>
          <button className="acp-quiz-btn">Generate Quick Quiz →</button>
        </div>
        <div className="acp-section" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="acp-section-label">Today s Session</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
            <div style={{ padding: ".75rem", background: "var(--surface)", borderRadius: "var(--r8)", border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font)", fontSize: "1.3rem", fontWeight: 800, color: "var(--pl)" }}>8</div>
              <div style={{ fontSize: ".68rem", color: "var(--hint)", marginTop: ".2rem" }}>Messages</div>
            </div>
            <div style={{ padding: ".75rem", background: "var(--surface)", borderRadius: "var(--r8)", border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font)", fontSize: "1.3rem", fontWeight: 800, color: "var(--a)" }}>12m</div>
              <div style={{ fontSize: ".68rem", color: "var(--hint)", marginTop: ".2rem" }}>Duration</div>
            </div>
          </div>
        </div>
        <div className="acp-section" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="acp-section-label">Related Topics</div>
          <div className="related-pills">
            <div className="related-pill">Momentum</div>
            <div className="related-pill">Energy</div>
            <div className="related-pill">Work & Power</div>
            <div className="related-pill">Kinematics</div>
            <div className="related-pill">Friction</div>
            <div className="related-pill">Gravity</div>
          </div>
        </div>
        <div className="acp-section" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="acp-section-label">Exam Countdown</div>
          <div style={{ padding: "1rem", background: "rgba(255,118,76,.08)", border: "1px solid rgba(255,118,76,.2)", borderRadius: "var(--r8)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font)", fontSize: "2rem", fontWeight: 800, color: "var(--a)" }}>8</div>
            <div style={{ fontSize: ".75rem", color: "var(--al)" }}>days until Physics Exam</div>
            <div style={{ marginTop: ".6rem", fontSize: ".72rem", color: "var(--hint)" }}>Focus: Newton s Laws, Friction, Circular Motion</div>
          </div>
        </div>
      </div>
    </div>
  );
}