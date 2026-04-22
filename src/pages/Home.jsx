import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  {
    icon: '📊',
    title: 'Real-Time Dashboard',
    desc: 'Track sessions, tasks, submissions, and reviews with beautiful data visualizations.',
  },
  {
    icon: '👨‍🏫',
    title: 'Role-Based Access',
    desc: 'Separate experiences for students, parents, instructors, and admins with appropriate permissions.',
  },
  {
    icon: '📚',
    title: 'External Courses',
    desc: 'Track progress on Coursera, Udemy, and other external learning platforms.',
  },
  {
    icon: '⚡',
    title: 'Modern Stack',
    desc: 'Built with React, Vite, Express, and MongoDB for lightning-fast performance.',
  },
  {
    icon: '🎨',
    title: 'Beautiful UI',
    desc: 'Glassmorphism design with smooth animations and dark/light theme support.',
  },
  {
    icon: '🔒',
    title: 'Secure & Scalable',
    desc: 'JWT authentication, rate limiting, and CORS protection built-in.',
  },
];

const Home = () => {
  return (
    <div className="home-container">
      {/* ─── Hero ─── */}
      <section className="hero-section">
        <div className="hero-badge">
          Built by a Full-Stack Instructor
        </div>
        <h1 className="hero-title">
          Master Development with a<br />
          <span className="gradient-text">Modern LMS</span>
        </h1>
        <p className="hero-subtitle">
          Engineered by Youssef Emad using cutting-edge tech (React, Express, ASP.NET). 
          Whether you want to master the MEAN stack or build your first Personal Portfolio, 
          you're in the right place.
        </p>
        
        <div className="hero-actions">
          <Link to="/login" className="btn btn-primary btn-lg">
            Access Dashboard
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">
            Read The CV
          </Link>
        </div>

        <div className="hero-stats">
          {[
            { value: '4', label: 'User Roles' },
            { value: '9+', label: 'Backend Models' },
            { value: '80+', label: 'API Endpoints' },
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
        <h2 className="section-title">Platform Features</h2>
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

      {/* ─── Tech Stack ─── */}
      <section className="stack-section">
        <h2 className="section-title">Tech Stack</h2>
        <div className="stack-tags">
          {['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Mongoose', 'REST API', 'CSS3'].map(tech => (
            <span key={tech} className="stack-tag">{tech}</span>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-card glass-panel">
          <h2>Ready to get started?</h2>
          <p>Sign in to access your personalized learning dashboard.</p>
          <Link to="/login" className="btn btn-primary">
            Access Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;