import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const SKILLS = [
  {
    fa: 'fa-solid fa-code',
    title: 'Coding Basics',
    color: '#6366f1',
    points: ['What is a program?', 'How computers think', 'Variables and values', 'Your first Python script', 'Reading error messages'],
  },
  {
    fa: 'fa-brands fa-python',
    title: 'Python',
    color: '#3b82f6',
    points: ['Variables and data types', 'Loops and conditions', 'Functions and modules', 'Lists and dictionaries', 'Simple projects and scripts'],
  },
  {
    fa: 'fa-solid fa-brain',
    title: 'Logical Thinking',
    color: '#a855f7',
    points: ['Breaking problems into steps', 'Spotting patterns', 'Writing pseudocode', 'Debugging strategies', 'Thinking before typing'],
  },
  {
    fa: 'fa-solid fa-globe',
    title: 'Web Development',
    color: '#10b981',
    points: ['HTML structure and tags', 'CSS styling and layouts', 'Making things interactive with JS', 'Building real web pages', 'Sharing your site online'],
  },
  {
    fa: 'fa-solid fa-gamepad',
    title: 'Game Development',
    color: '#f59e0b',
    points: ['Game loops and logic', 'Moving characters on screen', 'Collision detection', 'Scoring and levels', 'Building a complete game'],
  },
  {
    fa: 'fa-solid fa-diagram-project',
    title: 'Algorithms',
    color: '#ec4899',
    points: ['What is an algorithm?', 'Sorting and searching', 'Recursion basics', 'Thinking about efficiency', 'Solving coding puzzles'],
  },
];

const JOURNEY = [
  {
    fa: 'fa-solid fa-seedling',
    step: '01',
    title: 'Start with the Basics',
    desc: 'Logical thinking and Python fundamentals. No experience needed — we start from zero.',
    color: '#10b981',
  },
  {
    fa: 'fa-solid fa-hammer',
    step: '02',
    title: 'Build Your First Projects',
    desc: 'A simple calculator, a quiz game, a to-do list. Small wins that build real confidence.',
    color: '#3b82f6',
  },
  {
    fa: 'fa-solid fa-rocket',
    step: '03',
    title: 'Go Deeper',
    desc: 'Pick a track you love — web dev or game creation — and go all the way.',
    color: '#a855f7',
  },
  {
    fa: 'fa-solid fa-trophy',
    step: '04',
    title: 'Create Something Real',
    desc: 'Build a project you are proud of. A game, a website, a tool. Something you made.',
    color: '#f59e0b',
  },
];

const PLATFORM = [
  { fa: 'fa-solid fa-chalkboard-user', title: 'Live Sessions', desc: 'One-on-one and group sessions with your instructor. Recorded so you can rewatch anytime.' },
  { fa: 'fa-solid fa-list-check', title: 'Tasks & Assignments', desc: 'Get homework after each session, submit your work, and get scored feedback.' },
  { fa: 'fa-solid fa-chart-bar', title: 'Progress Dashboard', desc: 'See your session history, task completion, and how much you have grown over time.' },
  { fa: 'fa-solid fa-family', title: 'Parent Portal', desc: 'Parents can see sessions, tasks, and progress reports — always in the loop.' },
  { fa: 'fa-solid fa-shield-halved', title: 'Safe & Secure', desc: 'Your account is protected with modern security. Safe for kids and teens to use.' },
  { fa: 'fa-solid fa-moon', title: 'Dark & Light Mode', desc: 'Study comfortably at any time of day. Full theme support across every page.' },
];

const About = () => {
  return (
    <div className="home-container">

      {/* ══════════ HERO ══════════ */}
      <section className="hero-section">
        <div className="hero-badge">
          <i className="fa-solid fa-circle-info" /> About AlgoGambit
        </div>
        <h1 className="hero-title">
          We Help Kids Fall in Love<br />
          <span className="hero-accent">with Coding</span>
        </h1>
        <p className="hero-subtitle">
          AlgoGambit is a coding education platform built for young learners. We teach real skills —
          Python, web development, game creation, and logical thinking — in a warm, encouraging
          environment with live instructors and a platform that tracks every step of the journey.
        </p>
        <div className="hero-actions">
          <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
            <i className="fa-solid fa-play" /> Join Now
          </Link>
        </div>
      </section>

      {/* ══════════ WHAT WE TEACH ══════════ */}
      <section className="features-section">
        <div className="section-eyebrow">
          <i className="fa-solid fa-graduation-cap" /> Skill Tracks
        </div>
        <h2 className="section-title">Everything We Teach</h2>
        <p className="section-sub">Six complete skill tracks, each with structured lessons and real projects.</p>
        <div className="courses-grid">
          {SKILLS.map(s => (
            <div key={s.title} className="skill-card glass-panel" style={{ '--accent': s.color }}>
              <div className="skill-header">
                <div className="course-icon" style={{ background: s.color + '18', color: s.color, border: `2px solid ${s.color}44` }}>
                  <i className={s.fa} />
                </div>
                <h3>{s.title}</h3>
              </div>
              <ul className="skill-list">
                {s.points.map(p => (
                  <li key={p}>
                    <i className="fa-solid fa-check" style={{ color: s.color, fontSize: '0.7rem' }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ JOURNEY ══════════ */}
      <section className="features-section">
        <div className="section-eyebrow">
          <i className="fa-solid fa-map-location-dot" /> The Journey
        </div>
        <h2 className="section-title">From Zero to Builder</h2>
        <p className="section-sub">A clear path from your very first variable to your first real project.</p>
        <div className="journey-grid">
          {JOURNEY.map((j) => (
            <div key={j.step} className="journey-card glass-panel" style={{ '--accent': j.color }}>
              <div className="journey-step" style={{ color: j.color }}>{j.step}</div>
              <div className="journey-fa-icon" style={{ color: j.color }}>
                <i className={j.fa} />
              </div>
              <h3>{j.title}</h3>
              <p>{j.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ PLATFORM ══════════ */}
      <section className="features-section">
        <div className="section-eyebrow">
          <i className="fa-solid fa-laptop" /> The Platform
        </div>
        <h2 className="section-title">Built for Serious Learning</h2>
        <div className="features-grid">
          {PLATFORM.map(p => (
            <div key={p.title} className="feature-card glass-panel">
              <div className="feature-icon">
                <i className={p.fa} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ SECURITY ══════════ */}
      <section className="features-section">
        <div className="security-callout glass-panel">
          <div className="security-fa-icon">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div className="security-text">
            <h2>Safe for Kids, Trusted by Parents</h2>
            <p>
              AlgoGambit is built with security at its core. We use modern authentication,
              encrypted data storage, and rate limiting on all endpoints. Parents have full
              visibility into their child's activity, and no personal data is ever shared.
            </p>
            <div className="security-tags">
              {[
                { fa: 'fa-solid fa-lock', label: 'Encrypted Data' },
                { fa: 'fa-solid fa-user-shield', label: 'Secure Login' },
                { fa: 'fa-solid fa-eye', label: 'Parent Visibility' },
                { fa: 'fa-solid fa-ban', label: 'No Data Sharing' },
              ].map(t => (
                <span key={t.label} className="security-tag">
                  <i className={t.fa} /> {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ LANGUAGES ══════════ */}
      <section className="stack-section">
        <div className="section-eyebrow">
          <i className="fa-solid fa-toolbox" /> Tools & Languages
        </div>
        <h2 className="section-title">What Students Work With</h2>
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
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="features-section">
        <div className="cta-card glass-panel">
          <div className="cta-fa-icon">
            <i className="fa-solid fa-chart-simple" />
          </div>
          <h2>AlgoGambit by the Numbers</h2>
          <div className="hero-stats" style={{ marginTop: '2rem' }}>
            {[
              { value: '6', label: 'Coding Tracks', icon: 'fa-solid fa-layer-group' },
              { value: '4', label: 'User Roles', icon: 'fa-solid fa-users' },
              { value: '50+', label: 'Real Projects', icon: 'fa-solid fa-folder-open' },
              { value: '24/7', label: 'Platform Access', icon: 'fa-solid fa-clock' },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <i className={s.icon} style={{ color: 'var(--brand-primary)', fontSize: '1.1rem' }} />
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="cta-section">
        <div className="cta-card glass-panel">
          <div className="cta-fa-icon">
            <i className="fa-solid fa-laptop-code" />
          </div>
          <h2>Ready to Start Your Coding Journey?</h2>
          <p>Join AlgoGambit today. Your first session is just a click away.</p>
          <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
            <i className="fa-solid fa-arrow-right" /> Start Learning
          </Link>
        </div>
      </section>

    </div>
  );
};

export default About;
