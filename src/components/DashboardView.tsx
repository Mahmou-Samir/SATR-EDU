import Link from "next/link";

export default function DashboardView() {
  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-user">
          <div className="sidebar-ava">AH</div>
          <div className="sidebar-name">Ahmed Hassan</div>
          <div className="sidebar-role">Grade 12 · Science Track</div>
          <div className="sidebar-xp"><div className="sidebar-xp-fill" style={{ width: "68%" }}></div></div>
          <div className="sidebar-xp-label">Level 8 · 1,240 / 1,800 XP</div>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-nav-label">Main</div>
          <div className="sidebar-nav-item active"><span className="nav-icon">📊</span> Overview</div>
          <Link href="/courses" style={{ textDecoration: "none", color: "inherit" }}><div className="sidebar-nav-item"><span className="nav-icon">🎓</span> My Courses</div></Link>
          <Link href="/chat" style={{ textDecoration: "none", color: "inherit" }}><div className="sidebar-nav-item"><span className="nav-icon">🤖</span> AI Tutor <span className="nav-badge">New</span></div></Link>
          <div className="sidebar-nav-item"><span className="nav-icon">📝</span> Exams</div>
          <div className="sidebar-nav-item"><span className="nav-icon">🧠</span> Practice</div>
          <div className="sidebar-nav-label">Progress</div>
          <div className="sidebar-nav-item"><span className="nav-icon">📈</span> Analytics</div>
          <div className="sidebar-nav-item"><span className="nav-icon">🏆</span> Achievements</div>
          <div className="sidebar-nav-item"><span className="nav-icon">🔖</span> Bookmarks</div>
          <div className="sidebar-nav-label">Account</div>
          <div className="sidebar-nav-item"><span className="nav-icon">⚙️</span> Settings</div>
          <div className="sidebar-nav-item"><span className="nav-icon">💳</span> Subscription</div>
        </div>
      </div>

      {/* MAIN */}
      <div className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-greeting">Good morning, Ahmed 👋</div>
            <div className="dash-date">Thursday, May 22 · Your exam is in 8 days</div>
          </div>
          <div className="dash-header-right">
            <div className="notif-btn">🔔<div className="notif-dot"></div></div>
            <Link href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Ask AI Tutor</Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="kpi-grid">
          <div className="kpi"><div className="kpi-icon">📚</div><div className="kpi-val">14</div><div className="kpi-label">Lessons Completed</div><div className="kpi-change kpi-up">↑ 3 this week</div></div>
          <div className="kpi"><div className="kpi-icon">⏱</div><div className="kpi-val">4.2h</div><div className="kpi-label">Study Time Today</div><div className="kpi-change kpi-up">↑ Above daily goal</div></div>
          <div className="kpi"><div className="kpi-icon">📊</div><div className="kpi-val">87%</div><div className="kpi-label">Avg. Score</div><div className="kpi-change kpi-up">↑ 5% from last week</div></div>
          <div className="kpi"><div className="kpi-icon">🔥</div><div className="kpi-val">21</div><div className="kpi-label">Day Streak</div><div className="kpi-change" style={{ color: "var(--al)" }}>Keep it going!</div></div>
        </div>

        {/* chart area */}
        <div className="dash-grid">
          <div className="chart-card">
            <div className="chart-card-head">
              <div className="chart-card-title">Weekly Performance</div>
              <div className="chart-tabs">
                <button className="chart-tab active">Scores</button>
                <button className="chart-tab">Time</button>
                <button className="chart-tab">Topics</button>
              </div>
            </div>
            <div className="bar-chart">
              <div className="bar-col"><div className="bar-fill primary" style={{ height: "65%" }}></div><div className="bar-x">Mon</div></div>
              <div className="bar-col"><div className="bar-fill primary" style={{ height: "80%" }}></div><div className="bar-x">Tue</div></div>
              <div className="bar-col"><div className="bar-fill accent" style={{ height: "55%" }}></div><div className="bar-x">Wed</div></div>
              <div className="bar-col"><div className="bar-fill primary" style={{ height: "92%" }}></div><div className="bar-x">Thu</div></div>
              <div className="bar-col"><div className="bar-fill primary" style={{ height: "75%" }}></div><div className="bar-x">Fri</div></div>
              <div className="bar-col"><div className="bar-fill accent" style={{ height: "88%" }}></div><div className="bar-x">Sat</div></div>
              <div className="bar-col"><div className="bar-fill primary" style={{ height: "70%" }}></div><div className="bar-x">Sun</div></div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "var(--muted)" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--p)" }}></div>Score</div>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "var(--muted)" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--a)" }}></div>Exam</div>
            </div>
          </div>
          <div className="streak-card">
            <div className="streak-title">Study Streak — May 2026</div>
            <div className="streak-grid">
              <div className="streak-day empty">1</div><div className="streak-day done">2</div><div className="streak-day done">3</div><div className="streak-day done">4</div><div className="streak-day partial">5</div><div className="streak-day done">6</div><div className="streak-day done">7</div>
              <div className="streak-day done">8</div><div className="streak-day done">9</div><div className="streak-day done">10</div><div className="streak-day done">11</div><div className="streak-day done">12</div><div className="streak-day done">13</div><div className="streak-day done">14</div>
              <div className="streak-day done">15</div><div className="streak-day done">16</div><div className="streak-day partial">17</div><div className="streak-day done">18</div><div className="streak-day done">19</div><div className="streak-day done">20</div><div className="streak-day done">21</div>
              <div className="streak-day today">22</div><div className="streak-day empty">23</div><div className="streak-day empty">24</div><div className="streak-day empty">25</div><div className="streak-day empty">26</div><div className="streak-day empty">27</div><div className="streak-day empty">28</div>
            </div>
            <div className="streak-stat"><div className="streak-num">🔥 21</div><div className="streak-lbl">Day streak — Personal best!</div></div>
          </div>
        </div>

        {/* current courses */}
        <div style={{ fontSize: ".875rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)" }}>Continue Learning</div>
        <div className="current-courses">
          <div className="current-course">
            <div className="cc-thumb" style={{ background: "linear-gradient(135deg,rgba(56,29,109,.8),rgba(100,50,201,.4))" }}>🧮</div>
            <div className="cc-info">
              <div className="cc-title">Calculus — Differentiation & Integration</div>
              <div className="cc-sub">Lesson 8 of 24 · Dr. Ahmed Hassan</div>
              <div className="cc-progress-bar"><div className="cc-fill" style={{ width: "33%" }}></div></div>
            </div>
            <div className="cc-pct">33%</div>
            <button className="cc-resume">Resume</button>
          </div>
          <div className="current-course">
            <div className="cc-thumb" style={{ background: "linear-gradient(135deg,rgba(20,20,60,.9),rgba(100,50,201,.25))" }}>⚗️</div>
            <div className="cc-info">
              <div className="cc-title">Organic Chemistry — Reactions & Mechanisms</div>
              <div className="cc-sub">Lesson 14 of 20 · Ms. Sara Khalil</div>
              <div className="cc-progress-bar"><div className="cc-fill" style={{ width: "70%" }}></div></div>
            </div>
            <div className="cc-pct">70%</div>
            <button className="cc-resume">Resume</button>
          </div>
          <div className="current-course">
            <div className="cc-thumb" style={{ background: "linear-gradient(135deg,rgba(10,30,10,.8),rgba(80,180,60,.25))" }}>💻</div>
            <div className="cc-info">
              <div className="cc-title">Python for Beginners — Zero to Hero</div>
              <div className="cc-sub">Lesson 3 of 18 · Eng. Mona Samir</div>
              <div className="cc-progress-bar"><div className="cc-fill" style={{ width: "17%" }}></div></div>
            </div>
            <div className="cc-pct">17%</div>
            <button className="cc-resume">Resume</button>
          </div>
        </div>

        {/* AI suggestions */}
        <div className="ai-suggest">
          <div className="ai-suggest-head"><span className="ai-spark">✨</span><div className="ai-suggest-title">AI Recommendations for you</div></div>
          <div className="ai-suggest-items">
            <div className="ai-suggest-item"><span className="ai-suggest-text">📉 You struggled with integration by parts last session — review it before Thursday</span><Link href="/chat" style={{ textDecoration: "none" }} className="ai-suggest-action">Practice →</Link></div>
            <div className="ai-suggest-item"><span className="ai-suggest-text">🧪 Chemistry exam in 8 days — start the Organic Reactions quiz now</span><span className="ai-suggest-action">Start quiz →</span></div>
            <div className="ai-suggest-item"><span className="ai-suggest-text">🌟 You re 2 lessons away from completing Calculus — finish strong!</span><Link href="/courses" style={{ textDecoration: "none" }} className="ai-suggest-action">Continue →</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}