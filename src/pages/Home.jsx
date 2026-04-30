import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  {
    icon: '📊',
    title: 'Real-Time Dashboard',
    desc: 'Monitor sessions, tasks, submissions, and reviews with intuitive data visualizations.',
  },
  {
    icon: '👨‍🏫',
    title: 'Role-Based Access',
    desc: 'Tailored experiences for students, parents, instructors, and administrators.',
  },
  {
    icon: '📚',
    title: 'External Courses',
    desc: 'Track progress across Coursera, Udemy, and other external learning platforms.',
  },
  {
    icon: '⚡',
    title: 'Lightning Performance',
    desc: 'Built on a modern stack optimized for speed, reliability, and seamless user experience.',
  },
  {
    icon: '🎨',
    title: 'Beautiful Interface',
    desc: 'Glassmorphism design with smooth animations and dark/light theme support.',
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    desc: 'JWT authentication, refresh token rotation, rate limiting, and CORS protection.',
  },
];

const Home = () => {
  return (
    <div className="home-container">
      {/* ─── Hero ─── */}
      <section className="hero-section">
        <div className="hero-badge">
          🚀 Trusted Learning Platform
        </div>
        <h1 className="hero-title">
          Empower Education with<br />
          <span className="gradient-text">EduNova LMS</span>
        </h1>
        <p className="hero-subtitle">
          A comprehensive learning management system designed to connect students, 
          parents, instructors, and administrators — all in one seamless platform. 
          Track progress, manage sessions, and elevate learning outcomes.
        </p>
        
        <div className="hero-actions">
          <Link to="/login" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">
            Learn More
          </Link>
        </div>

        <div className="hero-stats">
          {[
            { value: '4', label: 'User Roles' },
            { value: '50+', label: 'Platform Features' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(stat => (
            <div key={stat.label} className="hero-stat">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="features-section">
        <h2 className="section-title">Why Choose EduNova?</h2>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card glass-panel">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          {[
            { icon: '1️⃣', title: 'Create Your Account', desc: 'Sign up as a student, parent, instructor, or administrator in under a minute.' },
            { icon: '2️⃣', title: 'Access Your Dashboard', desc: 'Get a personalized dashboard with relevant sessions, tasks, and analytics.' },
            { icon: '3️⃣', title: 'Track & Grow', desc: 'Submit assignments, track external courses, and monitor progress in real-time.' },
          ].map(step => (
            <div key={step.title} className="feature-card glass-panel">
              <div className="feature-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section className="stack-section">
        <h2 className="section-title">Powered By</h2>
        <div className="stack-tags">
          {['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Mongoose', 'REST API', 'CSS3'].map(tech => (
            <span key={tech} className="stack-tag">{tech}</span>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-card glass-panel">
          <h2>Ready to Transform Learning?</h2>
          <p>Join EduNova and experience the future of education management.</p>
          <Link to="/login" className="btn btn-primary">
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;