export default function CoursesView() {
  return (
    <div className="courses-page">
      <div className="courses-hero">
        <span className="badge badge-purple" style={{ marginBottom: "1rem" }}>Course Library</span>
        <h1>Find your next course</h1>
        <p>500+ expert-designed courses across all subjects. Learn at your own pace with AI-powered support every step of the way.</p>
        <div className="courses-search-bar">
          <div className="csearch">
            <span style={{ color: "var(--hint)" }}>🔍</span>
            <input type="text" placeholder="Search courses, subjects, teachers..." />
          </div>
          <button className="btn btn-primary">Search</button>
        </div>
      </div>
      <div className="courses-layout">
        {/* FILTERS */}
        <div className="courses-filter-sidebar">
          <div className="filter-title">Filters</div>
          <div className="filter-group">
            <div className="filter-group-label">Subject</div>
            <div className="filter-option"><div className="filter-check checked">✓</div>Mathematics<span className="filter-count">84</span></div>
            <div className="filter-option"><div className="filter-check checked">✓</div>Physics<span className="filter-count">62</span></div>
            <div className="filter-option"><div className="filter-check"></div>Chemistry<span className="filter-count">58</span></div>
            <div className="filter-option"><div className="filter-check"></div>Biology<span className="filter-count">47</span></div>
            <div className="filter-option"><div className="filter-check"></div>Arabic<span className="filter-count">39</span></div>
            <div className="filter-option"><div className="filter-check"></div>English<span className="filter-count">71</span></div>
            <div className="filter-option"><div className="filter-check"></div>Programming<span className="filter-count">95</span></div>
          </div>
          <div className="filter-group">
            <div className="filter-group-label">Level</div>
            <div className="filter-option"><div className="filter-check"></div>Beginner<span className="filter-count">180</span></div>
            <div className="filter-option"><div className="filter-check checked">✓</div>Intermediate<span className="filter-count">210</span></div>
            <div className="filter-option"><div className="filter-check"></div>Advanced<span className="filter-count">110</span></div>
          </div>
          <div className="filter-group">
            <div className="filter-group-label">Price</div>
            <div className="filter-option"><div className="filter-check"></div>Free<span className="filter-count">45</span></div>
            <div className="filter-option"><div className="filter-check checked">✓</div>Paid<span className="filter-count">455</span></div>
          </div>
          <div className="filter-group">
            <div className="filter-group-label">Rating</div>
            <div className="filter-option"><div className="filter-check checked">✓</div>4.5+ stars<span className="filter-count">220</span></div>
            <div className="filter-option"><div className="filter-check"></div>4.0+ stars<span className="filter-count">380</span></div>
          </div>
        </div>
        {/* COURSES CONTENT */}
        <div className="courses-content">
          <div className="courses-toolbar">
            <div className="courses-count">Showing <strong style={{ color: "var(--text)" }}>248 courses</strong> for your filters</div>
            <div className="courses-sort">Sort by: <select className="sort-select"><option>Most Popular</option><option>Highest Rated</option><option>Newest</option><option>Price: Low to High</option></select></div>
          </div>
          <div className="courses-cat-tabs">
            <div className="cat-tab active">All</div>
            <div className="cat-tab">Math</div>
            <div className="cat-tab">Physics</div>
            <div className="cat-tab">Chemistry</div>
            <div className="cat-tab">Languages</div>
            <div className="cat-tab">Programming</div>
            <div className="cat-tab">History</div>
          </div>
          <div className="full-courses-grid">
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(56,29,109,.8),rgba(100,50,201,.4))" }}>🧮</div><div className="fcc-body"><div className="fcc-tag">Mathematics</div><div className="fcc-title">Calculus — Differentiation & Integration</div><div className="fcc-author">Dr. Ahmed Hassan</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.9</span><span className="fcc-price">149 EGP</span></div><div className="fcc-students">2,100 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(20,20,60,.9),rgba(100,50,201,.25))" }}>🔭</div><div className="fcc-body"><div className="fcc-tag">Physics</div><div className="fcc-title">Mechanics — Forces, Motion & Energy</div><div className="fcc-author">Prof. Karim Nour</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.8</span><span className="fcc-price">179 EGP</span></div><div className="fcc-students">1,540 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(20,50,20,.8),rgba(100,180,60,.25))" }}>🧬</div><div className="fcc-body"><div className="fcc-tag">Biology</div><div className="fcc-title">Cell Biology & Genetics — Complete Guide</div><div className="fcc-author">Dr. Mona Youssef</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.7</span><span className="fcc-price">139 EGP</span></div><div className="fcc-students">980 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(100,30,10,.6),rgba(255,118,76,.3))" }}>🌐</div><div className="fcc-body"><div className="fcc-tag">Languages</div><div className="fcc-title">English Conversation Mastery B2–C1</div><div className="fcc-author">Mr. Omar Farid</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.7</span><span className="fcc-price">99 EGP</span></div><div className="fcc-students">3,200 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(10,30,10,.8),rgba(80,180,60,.25))" }}>💻</div><div className="fcc-body"><div className="fcc-tag">Programming</div><div className="fcc-title">Python for Beginners — Zero to Hero</div><div className="fcc-author">Eng. Mona Samir</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.9</span><span className="fcc-price free">Free</span></div><div className="fcc-students">4,100 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(20,20,60,.9),rgba(100,50,201,.25))" }}>⚗️</div><div className="fcc-body"><div className="fcc-tag">Chemistry</div><div className="fcc-title">Organic Chemistry — Reactions & Mechanisms</div><div className="fcc-author">Ms. Sara Khalil</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.8</span><span className="fcc-price">129 EGP</span></div><div className="fcc-students">1,800 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(56,29,109,.6),rgba(255,180,151,.2))" }}>🏛️</div><div className="fcc-body"><div className="fcc-tag">History</div><div className="fcc-title">Modern Egypt — 1800 to Present Day</div><div className="fcc-author">Dr. Hany Tawfik</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.9</span><span className="fcc-price free">Free</span></div><div className="fcc-students">900 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(56,29,109,.8),rgba(100,50,201,.4))" }}>📐</div><div className="fcc-body"><div className="fcc-tag">Mathematics</div><div className="fcc-title">Trigonometry & Analytic Geometry</div><div className="fcc-author">Ms. Dina Rashad</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.6</span><span className="fcc-price">119 EGP</span></div><div className="fcc-students">1,350 students enrolled</div></div></div>
            <div className="full-course-card"><div className="fcc-thumb" style={{ background: "linear-gradient(135deg,rgba(50,20,10,.8),rgba(200,100,40,.3))" }}>📚</div><div className="fcc-body"><div className="fcc-tag">Arabic</div><div className="fcc-title">Arabic Essay Writing — Thanaweya Amma</div><div className="fcc-author">Dr. Layla Ahmad</div><div className="fcc-bottom"><span className="fcc-rating">⭐ 4.8</span><span className="fcc-price">89 EGP</span></div><div className="fcc-students">2,600 students enrolled</div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}