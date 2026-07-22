import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Prism from '../components/Prism/Prism';
import PixelBlast from '../components/PixelBlast/PixelBlast';
import './Home.css';

const TRACKS = [
  {
    fa: 'fa-solid fa-code',
    title: 'Coding Basics',
    level: 'Start Here',
    color: '#6366f1',
    desc: 'Learn what code is, how computers think, and write your very first program. No experience needed at all.',
  },
  {
    fa: 'fa-brands fa-python',
    title: 'Python',
    level: 'Beginner → Advanced',
    color: '#3b82f6',
    desc: 'The friendliest programming language. Build real programs, automate tasks, and solve fun challenges.',
  },
  {
    fa: 'fa-solid fa-brain',
    title: 'Logical Thinking',
    level: 'All Levels',
    color: '#a855f7',
    desc: 'Learn to break big problems into small steps. This skill makes everything else in coding click.',
  },
  {
    fa: 'fa-solid fa-globe',
    title: 'Web Development',
    level: 'Beginner → Intermediate',
    color: '#10b981',
    desc: 'Build your own websites from scratch. HTML, CSS, and a little JavaScript to make things move.',
  },
  {
    fa: 'fa-solid fa-gamepad',
    title: 'Game Development',
    level: 'Intermediate',
    color: '#f59e0b',
    desc: 'Create your own 2D games with Python. Design levels, add characters, and share with friends.',
  },
  {
    fa: 'fa-solid fa-diagram-project',
    title: 'Algorithms',
    level: 'Intermediate',
    color: '#ec4899',
    desc: 'Discover clever ways to solve problems. Sorting, searching, and thinking like a computer scientist.',
  },
];

const PATHS = [
  {
    icon: 'fa-solid fa-seedling',
    title: 'Complete Beginner',
    steps: ['Coding Basics', 'Logical Thinking', 'Python Intro', 'First Mini Project'],
    color: '#10b981',
  },
  {
    icon: 'fa-solid fa-rocket',
    title: 'Aspiring Developer',
    steps: ['Python Fundamentals', 'Web Dev Basics', 'Algorithms', 'Build a Portfolio'],
    color: '#3b82f6',
  },
  {
    icon: 'fa-solid fa-gamepad',
    title: 'Game Creator',
    steps: ['Python Basics', 'Game Logic', 'Pygame Projects', 'Publish Your Game'],
    color: '#f59e0b',
  },
];

const WHY = [
  { fa: 'fa-solid fa-hands-holding-child', title: 'Made for Young Learners', desc: 'Every lesson is designed to be clear, fun, and encouraging — no confusing jargon.' },
  { fa: 'fa-solid fa-person-chalkboard', title: 'Live Sessions', desc: 'Learn with a real instructor who guides you, answers questions, and keeps you on track.' },
  { fa: 'fa-solid fa-chart-line', title: 'Track Your Progress', desc: 'See how far you have come with session history, task completion, and progress charts.' },
  { fa: 'fa-solid fa-family', title: 'Parents Stay Informed', desc: 'Parents can see sessions, tasks, and progress reports — always in the loop.' },
  { fa: 'fa-solid fa-shield-halved', title: 'Safe & Secure', desc: 'Your account and data are protected with modern security. Safe for kids to use.' },
  { fa: 'fa-solid fa-infinity', title: 'Learn at Your Pace', desc: 'No pressure. Revisit sessions, catch up on tasks, and grow at the speed that works for you.' },
];

const Home = () => {
  const [activePath, setActivePath] = useState(0);
  const themeApi = useTheme();
  const isDark = themeApi?.theme === 'dark';

  return (
    <div className="home-container is-home-page">

      {/* ══════════ HERO ══════════ */}
      <section className="hero-section-wrapper">
        <div className="hero-pixel-bg">
          <PixelBlast
            variant="square"
            pixelSize={3.5}
            color={isDark ? '#3B82F6' : '#2563EB'}
            patternScale={2.2}
            patternDensity={1.05}
            transparent={true}
            edgeFade={0.5}
            enableRipples={true}
            speed={0.4}
          />
        </div>
        
        <div className="hero-section">
          <div className="hero-badge">
            <i className="fa-solid fa-star" /> Learn to Code the Fun Way
          </div>
          <h1 className="hero-title">
            Your Coding Journey<br />
            <span className="hero-accent">Starts Right Here</span>
          </h1>
          <p className="hero-subtitle">
            AlgoGambit is a warm, friendly place where kids and teens learn real programming skills —
            from their very first line of code all the way to building their own games and websites.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
              <i className="fa-solid fa-play" /> Start Learning Free
            </Link>
            <Link to="/about" className="nb-btn nb-btn-secondary nb-btn-lg">
              <i className="fa-solid fa-circle-info" /> See What We Teach
            </Link>
          </div>
          <div className="hero-stats">
            {[
              { value: '6+', label: 'Coding Tracks', icon: 'fa-solid fa-layer-group' },
              { value: '100%', label: 'Hands-On', icon: 'fa-solid fa-hand' },
              { value: '24/7', label: 'Platform Access', icon: 'fa-solid fa-clock' },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <i className={s.icon} style={{ color: '#60a5fa', fontSize: '1.1rem' }} />
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRACKS ══════════ */}
      <section className="tracks-section reveal slide-up">
        <div className="section-eyebrow">
          <i className="fa-solid fa-code-fork" /> Study Tracks
        </div>
        <h2 className="section-title">Six Tracks, Endless Possibilities</h2>
        <p className="section-sub">Pick a track that excites you and follow it all the way to a real project.</p>
        <div className="courses-grid">
          {TRACKS.map(t => (
            <div key={t.title} className="course-card glass-panel reveal fade-in" style={{ '--accent': t.color }}>
              <div className="course-icon" style={{ background: t.color + '18', color: t.color, border: `2px solid ${t.color}44` }}>
                <i className={t.fa} />
              </div>
              <div className="course-level">{t.level}</div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ LEARNING PATHS ══════════ */}
      <section className="features-section reveal slide-up">
        <div className="section-eyebrow">
          <i className="fa-solid fa-map" /> Roadmaps
        </div>
        <h2 className="section-title">Pick Your Path</h2>
        <p className="section-sub">Not sure where to start? Choose a goal and follow the steps.</p>

        <div className="paths-tabs">
          {PATHS.map((p, i) => (
            <button
              key={p.title}
              className={`path-tab ${activePath === i ? 'active' : ''}`}
              style={{ '--tab-color': p.color }}
              onClick={() => setActivePath(i)}
            >
              <i className={p.icon} /> {p.title}
            </button>
          ))}
        </div>

        <div className="path-steps glass-panel">
          {PATHS[activePath].steps.map((step, i) => (
            <div key={step} className="path-step">
              <div className="path-step-num" style={{ background: PATHS[activePath].color }}>{i + 1}</div>
              <div className="path-step-label">{step}</div>
              {i < PATHS[activePath].steps.length - 1 && (
                <i className="fa-solid fa-arrow-right path-step-arrow" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ WHY ══════════ */}
      <section className="features-section reveal slide-up">
        <div className="section-eyebrow">
          <i className="fa-solid fa-heart" /> Why AlgoGambit
        </div>
        <h2 className="section-title">A Place Where Learning Feels Good</h2>
        <div className="features-grid">
          {WHY.map(w => (
            <div key={w.title} className="feature-card glass-panel reveal fade-in">
              <div className="feature-icon">
                <i className={w.fa} />
              </div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ LANGUAGES ══════════ */}
      <section className="stack-section-wrapper reveal slide-up">
        <div className="stack-prism-bg">
          <Prism
            height={3.0}
            baseWidth={5.0}
            animationType="3drotate"
            glow={1.2}
            noise={0.15}
            transparent={true}
            scale={3.2}
            bloom={1.5}
            timeScale={0.3}
          />
        </div>
        <div className="stack-section">
          <div className="section-eyebrow">
            <i className="fa-solid fa-toolbox" /> Tools & Languages
          </div>
          <h2 className="section-title">What You Will Work With</h2>
          <div className="stack-tags">
            {[
              { icon: 'fa-brands fa-python', label: 'Python' },
              { icon: 'fa-brands fa-js', label: 'JavaScript' },
              { icon: 'fa-brands fa-html5', label: 'HTML' },
              { icon: 'fa-brands fa-css3-alt', label: 'CSS' },
              { icon: 'fa-brands fa-git-alt', label: 'Git' },
              { icon: 'fa-solid fa-terminal', label: 'Command Line' },
              { icon: 'fa-solid fa-code', label: 'VS Code' },
              { icon: 'fa-solid fa-gamepad', label: 'Pygame' },
              { icon: 'fa-solid fa-database', label: 'SQL Basics' },
            ].map(t => (
              <span key={t.label} className="stack-tag">
                <i className={t.icon} /> {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="cta-section reveal slide-up">
        <div className="cta-card glass-panel">
          <div className="cta-fa-icon">
            <i className="fa-solid fa-laptop-code" />
          </div>
          <h2>Ready to Write Your First Line of Code?</h2>
          <p>Join AlgoGambit and start building real things from day one. No experience needed.</p>
          <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
            <i className="fa-solid fa-arrow-right" /> Get Started — It is Free
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
