import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CosmicScene from '../components/CosmicScene/CosmicScene';
import './Home.css';

const TRACKS = [
  { fa: 'fa-solid fa-code', title: 'Coding Basics', level: 'Start Here', color: '#60a5fa',
    desc: 'Learn what code is, how computers think, and write your very first program. No experience needed.' },
  { fa: 'fa-brands fa-python', title: 'Python', level: 'Beginner → Advanced', color: '#4B8BBE',
    desc: 'The friendliest language there is. Build real programs, automate boring tasks, and solve fun puzzles.' },
  { fa: 'fa-solid fa-brain', title: 'Logical Thinking', level: 'All Levels', color: '#a855f7',
    desc: 'Break big problems into small steps. This is the skill that makes everything else in coding click.' },
  { fa: 'fa-solid fa-globe', title: 'Web Development', level: 'Beginner → Intermediate', color: '#34d399',
    desc: 'Build your own websites from scratch. HTML, CSS, and a little JavaScript to make things move.' },
  { fa: 'fa-solid fa-gamepad', title: 'Game Development', level: 'Intermediate', color: '#fbbf24',
    desc: 'Create your own 2D games with Python. Design levels, add characters, and share them with friends.' },
  { fa: 'fa-solid fa-diagram-project', title: 'Algorithms', level: 'Intermediate', color: '#f472b6',
    desc: 'Discover clever ways to solve problems. Sorting, searching, and thinking like a computer scientist.' },
];

const PATHS = [
  { icon: 'fa-solid fa-seedling', title: 'Complete Beginner', color: '#34d399',
    steps: ['Coding Basics', 'Logical Thinking', 'Python Intro', 'First Mini Project'] },
  { icon: 'fa-solid fa-rocket', title: 'Aspiring Developer', color: '#60a5fa',
    steps: ['Python Fundamentals', 'Web Dev Basics', 'Algorithms', 'Build a Portfolio'] },
  { icon: 'fa-solid fa-gamepad', title: 'Game Creator', color: '#fbbf24',
    steps: ['Python Basics', 'Game Logic', 'Pygame Projects', 'Publish Your Game'] },
];

const WHY = [
  { fa: 'fa-solid fa-hands-holding-child', title: 'Made for Young Learners', desc: 'Every lesson is clear, fun, and encouraging. No confusing jargon, ever.' },
  { fa: 'fa-solid fa-person-chalkboard', title: 'Live Sessions', desc: 'Learn with a real instructor who guides you, answers questions, and keeps you moving.' },
  { fa: 'fa-solid fa-chart-line', title: 'Track Your Progress', desc: 'See how far you have come with session history, task completion, and progress charts.' },
  { fa: 'fa-solid fa-people-roof', title: 'Parents Stay Informed', desc: 'Parents can see sessions, tasks, and progress reports. Always in the loop.' },
  { fa: 'fa-solid fa-shield-halved', title: 'Safe and Secure', desc: 'Accounts and data are protected with modern security. Built to be safe for kids.' },
  { fa: 'fa-solid fa-infinity', title: 'Learn at Your Pace', desc: 'No pressure. Revisit sessions, catch up on tasks, grow at the speed that suits you.' },
];

const STACK = [
  { icon: 'fa-brands fa-python', label: 'Python' },
  { icon: 'fa-brands fa-js', label: 'JavaScript' },
  { icon: 'fa-brands fa-html5', label: 'HTML' },
  { icon: 'fa-brands fa-css3-alt', label: 'CSS' },
  { icon: 'fa-brands fa-git-alt', label: 'Git' },
  { icon: 'fa-solid fa-terminal', label: 'Command Line' },
  { icon: 'fa-solid fa-code', label: 'VS Code' },
  { icon: 'fa-solid fa-gamepad', label: 'Pygame' },
  { icon: 'fa-solid fa-database', label: 'SQL Basics' },
];

const Home = () => {
  const [activePath, setActivePath] = useState(0);

  return (
    <div className="cosmic-page">
      <CosmicScene variant="home" />

      <div className="cosmic-content">

        {/* ══════════ HERO ══════════ */}
        <section className="cx-hero">
          <div className="cx-hero-inner">
            <span className="cx-badge">
              <i className="fa-solid fa-satellite-dish" /> Learn to code the fun way
            </span>
            <h1 className="cx-hero-title">
              Your coding journey
              <span className="cx-hero-accent">starts on planet Earth.</span>
            </h1>
            <p className="cx-hero-sub">
              AlgoGambit is a warm, friendly place where kids and teens learn real programming, from
              their very first line of code all the way to building their own games and websites.
            </p>
            <div className="cx-hero-actions">
              <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
                <i className="fa-solid fa-play" /> Start learning free
              </Link>
              <Link to="/about" className="cx-btn-ghost">
                <i className="fa-solid fa-circle-info" /> See what we teach
              </Link>
            </div>
            <div className="cx-hero-stats">
              {[
                { value: '6', label: 'Coding tracks' },
                { value: '100%', label: 'Hands-on' },
                { value: '24/7', label: 'Platform access' },
              ].map((s) => (
                <div key={s.label} className="cx-stat">
                  <span className="cx-stat-value">{s.value}</span>
                  <span className="cx-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cx-drag-hint">
            <i className="fa-solid fa-arrows-up-down-left-right" /> Drag to spin the globe
          </div>
          <div className="cx-scroll-cue">
            <span>Scroll to launch</span>
            <i className="fa-solid fa-chevron-down" />
          </div>
        </section>

        {/* ══════════ TRACKS ══════════ */}
        <section className="cx-section reveal slide-up">
          <p className="cx-eyebrow"><i className="fa-solid fa-code-fork" /> Study tracks</p>
          <h2 className="cx-title">Six tracks, one launchpad</h2>
          <p className="cx-sub">Pick the track that lights you up and follow it all the way to a project you can show off.</p>
          <div className="cx-grid cx-grid-3">
            {TRACKS.map((t) => (
              <article key={t.title} className="cx-card reveal fade-in" style={{ '--accent': t.color }}>
                <span className="cx-card-icon" style={{ color: t.color, borderColor: `${t.color}55`, background: `${t.color}1a` }}>
                  <i className={t.fa} />
                </span>
                <span className="cx-card-level">{t.level}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════ PATHS ══════════ */}
        <section className="cx-section reveal slide-up">
          <p className="cx-eyebrow"><i className="fa-solid fa-map" /> Roadmaps</p>
          <h2 className="cx-title">Chart your course</h2>
          <p className="cx-sub">Not sure where to start? Choose a destination and follow the waypoints.</p>
          <div className="cx-tabs">
            {PATHS.map((p, i) => (
              <button
                key={p.title}
                className={`cx-tab ${activePath === i ? 'is-active' : ''}`}
                style={{ '--accent': p.color }}
                onClick={() => setActivePath(i)}
              >
                <i className={p.icon} /> {p.title}
              </button>
            ))}
          </div>
          <div className="cx-path" style={{ '--accent': PATHS[activePath].color }}>
            {PATHS[activePath].steps.map((step, i) => (
              <div key={step} className="cx-path-step">
                <span className="cx-path-num">{i + 1}</span>
                <span className="cx-path-label">{step}</span>
                {i < PATHS[activePath].steps.length - 1 && <i className="fa-solid fa-arrow-right cx-path-arrow" />}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ WHY ══════════ */}
        <section className="cx-section reveal slide-up">
          <p className="cx-eyebrow"><i className="fa-solid fa-heart" /> Why AlgoGambit</p>
          <h2 className="cx-title">A place where learning feels good</h2>
          <div className="cx-grid cx-grid-3">
            {WHY.map((w) => (
              <article key={w.title} className="cx-card cx-card-quiet reveal fade-in">
                <span className="cx-card-icon cx-card-icon-plain"><i className={w.fa} /></span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════ STACK ══════════ */}
        <section className="cx-section reveal slide-up">
          <p className="cx-eyebrow"><i className="fa-solid fa-toolbox" /> Tools and languages</p>
          <h2 className="cx-title">The tools you will actually use</h2>
          <p className="cx-sub">Nothing here is filler. Every one of these turns up in a lesson, a task or a project you build.</p>
          <div className="cx-tags">
            {STACK.map((t) => (
              <span key={t.label} className="cx-tag"><i className={t.icon} /> {t.label}</span>
            ))}
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section className="cx-section cx-section-last reveal slide-up">
          <div className="cx-cta">
            <span className="cx-card-icon cx-card-icon-plain cx-cta-icon"><i className="fa-solid fa-rocket" /></span>
            <h2>You have reached the edge of the map.</h2>
            <p>Now go build something that did not exist yesterday. Your first line of code is one click away.</p>
            <Link to="/login" className="nb-btn nb-btn-primary nb-btn-lg">
              <i className="fa-solid fa-arrow-right" /> Get started, it is free
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
