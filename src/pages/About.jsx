import React from 'react';
import { Link } from 'react-router-dom';
import CosmicScene from '../components/CosmicScene/CosmicScene';
import './Home.css';

const SKILLS = [
  { fa: 'fa-solid fa-code', title: 'Coding Basics', color: '#60a5fa',
    points: ['What is a program?', 'How computers think', 'Variables and values', 'Your first Python script', 'Reading error messages'] },
  { fa: 'fa-brands fa-python', title: 'Python', color: '#4B8BBE',
    points: ['Variables and data types', 'Loops and conditions', 'Functions and modules', 'Lists and dictionaries', 'Simple projects and scripts'] },
  { fa: 'fa-solid fa-brain', title: 'Logical Thinking', color: '#a855f7',
    points: ['Breaking problems into steps', 'Spotting patterns', 'Writing pseudocode', 'Debugging strategies', 'Thinking before typing'] },
  { fa: 'fa-solid fa-globe', title: 'Web Development', color: '#34d399',
    points: ['HTML structure and tags', 'CSS styling and layouts', 'Interactivity with JS', 'Building real web pages', 'Sharing your site online'] },
  { fa: 'fa-solid fa-gamepad', title: 'Game Development', color: '#fbbf24',
    points: ['Game loops and logic', 'Moving characters on screen', 'Collision detection', 'Scoring and levels', 'Building a complete game'] },
  { fa: 'fa-solid fa-diagram-project', title: 'Algorithms', color: '#f472b6',
    points: ['What is an algorithm?', 'Sorting and searching', 'Recursion basics', 'Thinking about efficiency', 'Solving coding puzzles'] },
];

const JOURNEY = [
  { fa: 'fa-solid fa-seedling', step: '01', title: 'Start with the Basics', color: '#34d399',
    desc: 'Logical thinking and Python fundamentals. No experience needed. We start from zero.' },
  { fa: 'fa-solid fa-hammer', step: '02', title: 'Build Your First Projects', color: '#60a5fa',
    desc: 'A calculator, a quiz game, a to-do list. Small wins that build real confidence.' },
  { fa: 'fa-solid fa-rocket', step: '03', title: 'Go Deeper', color: '#a855f7',
    desc: 'Pick a track you love, web dev or game creation, and take it all the way.' },
  { fa: 'fa-solid fa-trophy', step: '04', title: 'Create Something Real', color: '#fbbf24',
    desc: 'Build a project you are proud of. A game, a website, a tool. Something you made.' },
];

const PLATFORM = [
  { fa: 'fa-solid fa-chalkboard-user', title: 'Live Sessions', desc: 'One-on-one and group sessions with your instructor, recorded so you can rewatch anytime.' },
  { fa: 'fa-solid fa-list-check', title: 'Tasks and Assignments', desc: 'Homework after each session. Submit your work and get scored feedback.' },
  { fa: 'fa-solid fa-chart-bar', title: 'Progress Dashboard', desc: 'See your session history, task completion, and how much you have grown over time.' },
  { fa: 'fa-solid fa-people-roof', title: 'Parent Portal', desc: 'Parents can see sessions, tasks, and progress reports. Always in the loop.' },
  { fa: 'fa-solid fa-shield-halved', title: 'Safe and Secure', desc: 'Accounts are protected with modern security. Built to be safe for kids and teens.' },
  { fa: 'fa-solid fa-moon', title: 'Dark and Light Mode', desc: 'Study comfortably at any hour, with full theme support across the app.' },
];

const About = () => {
  return (
    <div className="cosmic-page">
      <CosmicScene variant="about" />

      <div className="cosmic-content">

        {/* ══════════ HERO ══════════ */}
        <section className="cx-hero cx-hero-about">
          <div className="cx-hero-inner">
            <span className="cx-badge"><i className="fa-solid fa-circle-info" /> About AlgoGambit</span>
            <h1 className="cx-hero-title">
              We help kids fall in love
              <span className="cx-hero-accent">with building things.</span>
            </h1>
            <p className="cx-hero-sub">
              AlgoGambit is a coding school for young learners. We teach real skills, Python, web
              development, game creation, and logical thinking, in a warm environment with live
              instructors and a platform that tracks every step of the journey.
            </p>
            <div className="cx-hero-actions">
              <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
                <i className="fa-solid fa-play" /> Join now
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════ WHAT WE TEACH ══════════ */}
        <section className="cx-section reveal slide-up">
          <p className="cx-eyebrow"><i className="fa-solid fa-book-open" /> Curriculum</p>
          <h2 className="cx-title">Everything we teach</h2>
          <p className="cx-sub">Six complete skill tracks, each with structured lessons and real projects.</p>
          <div className="cx-grid cx-grid-3">
            {SKILLS.map((s) => (
              <article key={s.title} className="cx-card reveal fade-in" style={{ '--accent': s.color }}>
                <div className="cx-skill-head">
                  <span className="cx-card-icon" style={{ color: s.color, borderColor: `${s.color}55`, background: `${s.color}1a` }}>
                    <i className={s.fa} />
                  </span>
                  <h3>{s.title}</h3>
                </div>
                <ul className="cx-skill-list">
                  {s.points.map((p) => (
                    <li key={p}><i className="fa-solid fa-check" style={{ color: s.color }} /> {p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════ JOURNEY ══════════ */}
        <section className="cx-section reveal slide-up">
          <p className="cx-eyebrow"><i className="fa-solid fa-map-location-dot" /> The journey</p>
          <h2 className="cx-title">From zero to builder</h2>
          <p className="cx-sub">A clear path from your very first variable to your first real project.</p>
          <div className="cx-grid cx-grid-4">
            {JOURNEY.map((j) => (
              <article key={j.step} className="cx-card cx-card-center reveal fade-in" style={{ '--accent': j.color }}>
                <span className="cx-journey-step" style={{ color: j.color }}>{j.step}</span>
                <span className="cx-journey-icon" style={{ color: j.color }}><i className={j.fa} /></span>
                <h3>{j.title}</h3>
                <p>{j.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════ PLATFORM ══════════ */}
        <section className="cx-section reveal slide-up">
          <p className="cx-eyebrow"><i className="fa-solid fa-laptop" /> The platform</p>
          <h2 className="cx-title">Built for serious learning</h2>
          <div className="cx-grid cx-grid-3">
            {PLATFORM.map((p) => (
              <article key={p.title} className="cx-card cx-card-quiet reveal fade-in">
                <span className="cx-card-icon cx-card-icon-plain"><i className={p.fa} /></span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════ SECURITY ══════════ */}
        <section className="cx-section reveal slide-up">
          <div className="cx-security">
            <span className="cx-security-icon"><i className="fa-solid fa-shield-halved" /></span>
            <div>
              <h2 className="cx-title cx-title-left">Safe for kids, trusted by parents</h2>
              <p className="cx-security-text">
                AlgoGambit is built with security at its core: modern authentication, encrypted data
                storage, and rate limiting on every endpoint. Parents have full visibility into their
                child's activity, and no personal data is ever shared.
              </p>
              <div className="cx-tags cx-tags-left">
                {[
                  { fa: 'fa-solid fa-lock', label: 'Encrypted Data' },
                  { fa: 'fa-solid fa-user-shield', label: 'Secure Login' },
                  { fa: 'fa-solid fa-eye', label: 'Parent Visibility' },
                  { fa: 'fa-solid fa-ban', label: 'No Data Sharing' },
                ].map((t) => (
                  <span key={t.label} className="cx-tag"><i className={t.fa} /> {t.label}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ STATS ══════════ */}
        <section className="cx-section reveal slide-up">
          <div className="cx-numbers">
            {[
              { value: '6', label: 'Coding tracks' },
              { value: '4', label: 'User roles' },
              { value: '50+', label: 'Real projects' },
              { value: '24/7', label: 'Platform access' },
            ].map((s) => (
              <div key={s.label} className="cx-stat">
                <span className="cx-stat-value">{s.value}</span>
                <span className="cx-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section className="cx-section cx-section-last reveal slide-up">
          <div className="cx-cta">
            <span className="cx-card-icon cx-card-icon-plain cx-cta-icon"><i className="fa-solid fa-laptop-code" /></span>
            <h2>Ready to start your coding journey?</h2>
            <p>Join AlgoGambit today. Your first session is just a click away.</p>
            <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
              <i className="fa-solid fa-arrow-right" /> Start learning
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
