import Link from "next/link";

export default function HomeView() {
  return (
    <div className="page active">
      {/* HERO */}
      <div className="hero">
        <div className="orb orb-1"></div><div className="orb orb-2"></div><div className="orb orb-3"></div>
        <div className="hero-eyebrow">
          <span className="badge badge-purple"><span className="badge-dot"></span>AI-powered education platform</span>
        </div>
        <h1>Learn smarter.<br />Achieve <em>more.</em></h1>
        <p className="hero-sub">The first truly AI-native learning platform for students — with a personal tutor, smart exams, and adaptive courses all in one place.</p>
        <div className="hero-btns">
          <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>Start learning free →</Link>
          <Link href="/chat" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>Try AI Tutor</Link>
        </div>
        <div className="stats-bar">
          <div className="stat-item"><div className="stat-num">1M+</div><div className="stat-label">Active Students</div></div>
          <div className="stat-item"><div className="stat-num">500+</div><div className="stat-label">Expert Courses</div></div>
          <div className="stat-item"><div className="stat-num">98%</div><div className="stat-label">Satisfaction</div></div>
          <div className="stat-item"><div className="stat-num">24/7</div><div className="stat-label">AI Support</div></div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-item"><div className="marquee-dot"></div>Mathematics</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Physics</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Chemistry</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Biology</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Arabic Language</div>
          <div className="marquee-item"><div className="marquee-dot"></div>English</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Programming</div>
          <div className="marquee-item"><div className="marquee-dot"></div>History</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Geography</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Economics</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Philosophy</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Art & Design</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Mathematics</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Physics</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Chemistry</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Biology</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Arabic Language</div>
          <div className="marquee-item"><div className="marquee-dot"></div>English</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Programming</div>
          <div className="marquee-item"><div className="marquee-dot"></div>History</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Geography</div>
          <div className="marquee-item"><div className="marquee-dot"></div>Economics</div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section">
        <div className="feat-header">
          <span className="badge badge-orange" style={{ marginBottom: '1rem' }}>Everything you need</span>
          <h2>Built for the way<br />students actually learn</h2>
          <p style={{ color: 'var(--muted)', maxWidth: '480px', marginTop: '.75rem', lineHeight: '1.8' }}>Six core systems working together — from AI tutoring to OCR grading — designed to adapt to every  pace and style.</p>
        </div>
        <div className="feat-grid">
          <div className="feat-card"><div className="feat-icon fi-purple">🤖</div><span className="feat-tag">AI Core</span><h3>Personal AI Tutor</h3><p>Context-aware assistant that remembers your learning history, explains concepts step-by-step, and adapts to your level in real time.</p></div>
          <div className="feat-card"><div className="feat-icon fi-orange">📷</div><span className="feat-tag orange">OCR</span><h3>Handwritten Exam Grading</h3><p>Upload a photo of your handwritten answer sheet. Our OCR engine reads it, grades it, and provides detailed feedback in under 30 seconds.</p></div>
          <div className="feat-card"><div className="feat-icon fi-purple">🧠</div><span className="feat-tag">AI Core</span><h3>AI Question Generator</h3><p>Instantly generate practice questions on any topic, with difficulty tuned to your current level. Never run out of study material.</p></div>
          <div className="feat-card"><div className="feat-icon fi-purple">📊</div><span className="feat-tag">Analytics</span><h3>Performance Analytics</h3><p>Real-time dashboards tracking your progress, identifying weak spots, and recommending what to study next using ML models.</p></div>
          <div className="feat-card"><div className="feat-icon fi-orange">🎓</div><span className="feat-tag orange">Content</span><h3>Course Marketplace</h3><p>500+ expert-designed courses with video lessons, interactive exercises, and downloadable materials across all subjects.</p></div>
          <div className="feat-card"><div className="feat-icon fi-orange">🛒</div><span className="feat-tag orange">Platform</span><h3>Educator Marketplace</h3><p>Teachers can publish and sell their own courses, track student progress, and build a sustainable income from their expertise.</p></div>
        </div>
      </div>

      {/* AI CHAT SECTION */}
      <div style={{ background: 'linear-gradient(180deg,transparent,rgba(100,50,201,.06),transparent)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section">
          <div className="ai-section">
            <div className="ai-info">
              <span className="badge badge-purple" style={{ marginBottom: '1.25rem' }}><span className="badge-dot"></span>AI Tutor — Live</span>
              <h2>Your personal teacher.<br />Available 24/7.</h2>
              <p style={{ marginTop: '1rem' }}>Ask anything — from a quick formula to a full concept explanation. The AI Tutor understands context, remembers previous conversations, and speaks your language.</p>
              <div className="ai-bullets">
                <div className="ai-bullet"><div className="bullet-dot"></div>Multi-turn memory — it remembers what you discussed last session</div>
                <div className="ai-bullet"><div className="bullet-dot"></div>Subject-aware — switches mode from Math to Arabic literature seamlessly</div>
                <div className="ai-bullet"><div className="bullet-dot"></div>Streaming responses — answers appear word-by-word in real time</div>
                <div className="ai-bullet"><div className="bullet-dot"></div>RAG-powered — pulls from your course materials for precise answers</div>
                <div className="ai-bullet"><div className="bullet-dot"></div>Safe & filtered — all responses are validated before reaching you</div>
              </div>
              <Link href="/chat" className="btn btn-primary" style={{ textDecoration: 'none' }}>Open AI Tutor →</Link>
            </div>
            <div className="chat-widget">
              <div className="chat-topbar">
                <div className="chat-ai-ava">🤖</div>
                <div>
                  <div className="chat-ai-name">Satr AI Tutor</div>
                  <div className="chat-online">Online now</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
                  <span style={{ padding: '.25rem .75rem', borderRadius: '100px', background: 'rgba(100,50,201,.15)', color: 'var(--pl)', fontSize: '.7rem', fontWeight: 600, border: '1px solid rgba(100,50,201,.2)' }}>Math · Grade 12</span>
                </div>
              </div>
              <div className="chat-body">
                <div className="msg msg-user"><div className="bubble bubble-user" style={{ background: 'rgba(255,255,255,.07)', color: 'var(--muted)', borderRadius: 'var(--r12) var(--r12) var(--r12) 4px', maxWidth: '85%' }}>Explain Newton s Second Law with an example</div></div>
                <div className="msg msg-ai" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div className="bubble" style={{ background: 'linear-gradient(135deg,var(--p),#7b45e5)', color: '#fff', borderRadius: 'var(--r12) 4px var(--r12) var(--r12)', maxWidth: '85%' }}>
                    Newton s Second Law states that the net force on an object equals its mass times acceleration:<br />
                    <div className="formula-box" style={{ background: 'rgba(0,0,0,.2)', borderColor: 'rgba(255,255,255,.2)', color: '#fff', margin: '.6rem 0' }}>F = m × a</div>
                    <strong>Example:</strong> A soccer ball (0.5 kg) kicked with 10N of force accelerates at 20 m/s² — it moves fast because it s light!
                  </div>
                </div>
                <div className="msg msg-user"><div className="bubble" style={{ background: 'rgba(255,255,255,.07)', color: 'var(--muted)', borderRadius: 'var(--r12) var(--r12) var(--r12) 4px', maxWidth: '85%' }}>What if the mass doubles?</div></div>
                <div className="typing-row"><div className="typing-bubble"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div></div>
              </div>
              <div className="chat-input-bar">
                <input type="text" className="chat-input" placeholder="Ask anything..." disabled />
                <div className="chat-send">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXAM SECTION */}
      <div className="section">
        <div className="exam-section">
          <div>
            <span className="badge badge-orange" style={{ marginBottom: '1.25rem' }}>Exam System</span>
            <h2>Upload. Grade.<br />Improve instantly.</h2>
            <p style={{ color: 'var(--muted)', marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.8' }}>Revolutionary OCR technology reads your handwriting, grades your answers against the model solution, and tells you exactly where you lost marks — all in under 30 seconds.</p>
            <button className="btn btn-accent">Try exam grading →</button>
          </div>
          <div>
            <div style={{ marginBottom: '.75rem', padding: '.6rem 1rem', background: 'rgba(255,118,76,.08)', border: '1px solid rgba(255,118,76,.15)', borderRadius: 'var(--r8)', fontSize: '.78rem', color: 'var(--al)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              ⚡ Average grading time: <strong>28 seconds</strong>
            </div>
            <div className="exam-steps">
              <div className="step-card"><div className="step-num">01</div><div className="step-text"><h4>Upload your answer sheet</h4><p>Photo, scan, or PDF — any format works</p></div><div className="step-pill">📤 Upload</div></div>
              <div className="step-card"><div className="step-num">02</div><div className="step-text"><h4>AI reads your handwriting</h4><p>Arabic & English handwriting recognition</p></div><div className="step-pill">👁 OCR</div></div>
              <div className="step-card"><div className="step-num">03</div><div className="step-text"><h4>Automatic grading</h4><p>Compared against model answer with scoring</p></div><div className="step-pill">✓ Grade</div></div>
              <div className="step-card"><div className="step-num">04</div><div className="step-text"><h4>Detailed report</h4><p>Score breakdown, errors explained, next steps</p></div><div className="step-pill">📊 Report</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* COURSES PREVIEW */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="section">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '.75rem' }}>Course Library</span>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '-.03em' }}>Top courses this week</h2>
            </div>
            <Link href="/courses" className="btn btn-ghost" style={{ textDecoration: 'none' }}>View all 500+ courses →</Link>
          </div>
          <div className="courses-row">
            <Link href="/courses" style={{ textDecoration: 'none', color: 'inherit' }} className="course-card">
              <div className="course-thumb ct-math">🧮</div>
              <div className="course-body">
                <div className="course-tag">Mathematics</div>
                <div className="course-title">Calculus — Differentiation & Integration</div>
                <div className="course-author">Dr. Ahmed Hassan</div>
                <div className="course-meta"><span className="course-rating">⭐ 4.9 (2.1k)</span><span className="course-price">149 EGP</span></div>
              </div>
            </Link>
            <Link href="/courses" style={{ textDecoration: 'none', color: 'inherit' }} className="course-card">
              <div className="course-thumb ct-sci">⚗️</div>
              <div className="course-body">
                <div className="course-tag">Chemistry</div>
                <div className="course-title">Organic Chemistry for High School</div>
                <div className="course-author">Ms. Sara Khalil</div>
                <div className="course-meta"><span className="course-rating">⭐ 4.8 (1.8k)</span><span className="course-price">129 EGP</span></div>
              </div>
            </Link>
            <Link href="/courses" style={{ textDecoration: 'none', color: 'inherit' }} className="course-card">
              <div className="course-thumb ct-lang">🌐</div>
              <div className="course-body">
                <div className="course-tag">Languages</div>
                <div className="course-title">English Conversation Mastery</div>
                <div className="course-author">Mr. Omar Farid</div>
                <div className="course-meta"><span className="course-rating">⭐ 4.7 (3.2k)</span><span className="course-price">99 EGP</span></div>
              </div>
            </Link>
            <Link href="/courses" style={{ textDecoration: 'none', color: 'inherit' }} className="course-card">
              <div className="course-thumb ct-prog">💻</div>
              <div className="course-body">
                <div className="course-tag">Programming</div>
                <div className="course-title">Python for Beginners — Zero to Hero</div>
                <div className="course-author">Eng. Mona Samir</div>
                <div className="course-meta"><span className="course-rating">⭐ 4.9 (4.1k)</span><span className="course-price" style={{ color: '#4ade80' }}>Free</span></div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ background: 'rgba(100,50,201,.04)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-purple" style={{ marginBottom: '1rem' }}>Student Stories</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '-.03em' }}>Loved by over a million students</h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">The AI Tutor explained derivatives in a way my teacher never could. I went from failing math to scoring 95% on my finals.</div>
              <div className="testi-author">
                <div className="testi-ava" style={{ background: 'linear-gradient(135deg,var(--p),var(--pl))' }}>YM</div>
                <div><div className="testi-name">Youssef Mahmoud</div><div className="testi-role">Grade 12, Cairo</div></div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">The OCR exam grading is mind-blowing. I upload my test, and within seconds I know exactly which topics to review before the next exam</div>
              <div className="testi-author">
                <div className="testi-ava" style={{ background: 'linear-gradient(135deg,#6d1d6d,#b845b8)' }}>NR</div>
                <div><div className="testi-name">Nour Rashed</div><div className="testi-role">University Student, Alexandria</div></div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">  I use Satr Edu to create content for my students. The question generator saves me hours every week and the quality is outstanding.  </div>
              <div className="testi-author">
                <div className="testi-ava" style={{ background: 'linear-gradient(135deg,#1d4d6d,#4580b8)' }}>HT</div>
                <div><div className="testi-name">Hassan Tawfik</div><div className="testi-role">Teacher, Giza</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="section">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span className="badge badge-orange" style={{ marginBottom: '1rem' }}>Pricing</span>
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '-.03em' }}>Start free. Scale when ready.</h2>
          <p style={{ color: 'var(--muted)', marginTop: '.75rem' }}>No hidden fees. Cancel anytime.</p>
        </div>
        <div className="pricing-grid">
          <div className="plan">
            <div className="plan-name">Free</div>
            <div className="plan-price">0<sub>EGP</sub></div>
            <div className="plan-period">forever free</div>
            <ul className="plan-features">
              <li>5 free courses</li>
              <li>AI Tutor (10 messages/day)</li>
              <li>Basic exam grading (3/month)</li>
              <li>Performance dashboard</li>
              <li className="muted">Question generator</li>
              <li className="muted">Unlimited AI chat</li>
            </ul>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Get started free</button>
          </div>
          <div className="plan featured">
            <div className="plan-ribbon">Most Popular</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price">199<sub>EGP</sub></div>
            <div className="plan-period">per month</div>
            <ul className="plan-features">
              <li>Unlimited courses</li>
              <li>Unlimited AI Tutor</li>
              <li>Unlimited exam grading</li>
              <li>AI Question Generator</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Start Pro today</button>
          </div>
          <div className="plan">
            <div className="plan-name">School</div>
            <div className="plan-price">999<sub>EGP</sub></div>
            <div className="plan-period">per month · up to 100 students</div>
            <ul className="plan-features">
              <li>Everything in Pro</li>
              <li>Teacher dashboard</li>
              <li>Group analytics & reports</li>
              <li>Custom curriculum builder</li>
              <li>Dedicated account manager</li>
              <li>API access</li>
            </ul>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Contact sales</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="section" style={{ paddingTop: '0' }}>
        <div className="cta-block">
          <h2>Ready to transform<br />how you learn?</h2>
          <p>Join over 1 million students already using Satr Edu to study smarter, score higher, and reach their goals.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>Start for free today →</Link>
            <Link href="/chat" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>Try AI Tutor first</Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">
          <span>SATR<span style={{ color: 'var(--pl)' }}>EDU</span></span>
        </div>
        <div className="footer-links">
          <Link href="#">About</Link><Link href="/courses">Courses</Link><Link href="#">For Schools</Link>
          <Link href="#">Blog</Link><Link href="#">Privacy</Link><Link href="#">Terms</Link><Link href="#">Contact</Link>
        </div>
        <div className="footer-copy">© 2026 Satr Edu. All rights reserved.</div>
      </footer>
    </div>
  );
}