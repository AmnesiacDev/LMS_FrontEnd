import React from 'react';
import './Home.css';

const About = () => {
  return (
    <div className="home-container">
      {/* ─── Hero ─── */}
      <section className="hero-section">
        <div className="hero-badge">About Us</div>
        <h1 className="hero-title">
          Built to <span className="gradient-text">Empower Learners</span>
        </h1>
        <p className="hero-subtitle">
          EduNova LMS is a comprehensive learning management platform designed to bridge the gap 
          between students, parents, instructors, and administrators — providing a unified ecosystem 
          for education management.
        </p>
      </section>

      {/* ─── Mission & Vision ─── */}
      <section className="features-section">
        <h2 className="section-title">Our Mission & Vision</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>
              To democratize education by providing a powerful, accessible, and beautifully designed 
              platform that makes learning management effortless for institutions of all sizes.
            </p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🔭</div>
            <h3>Our Vision</h3>
            <p>
              A world where every learner has access to organized, trackable, and engaging educational 
              experiences — supported by technology that adapts to their unique needs.
            </p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">💡</div>
            <h3>Our Values</h3>
            <p>
              We believe in transparency, continuous improvement, and putting the learner first. 
              Every feature we build is driven by real educator and student feedback.
            </p>
          </div>
        </div>
      </section>

      {/* ─── What We Offer ─── */}
      <section className="features-section">
        <h2 className="section-title">What We Offer</h2>
        <div className="features-grid">
          {[
            {
              icon: '🎓',
              title: 'Student Dashboard',
              desc: 'Personalized session tracking, task management, submission history, and external course integration.',
            },
            {
              icon: '👪',
              title: 'Parent Portal',
              desc: 'Real-time visibility into your children\'s progress, assignments, and attendance across all courses.',
            },
            {
              icon: '📋',
              title: 'Instructor Tools',
              desc: 'Create sessions, assign tasks, review submissions, and manage student profiles with ease.',
            },
            {
              icon: '🛡️',
              title: 'Admin Control',
              desc: 'Full user management, role-based access control, student profiles, and platform-wide analytics.',
            },
            {
              icon: '📚',
              title: 'External Course Tracking',
              desc: 'Log and monitor progress on platforms like Coursera, Udemy, and LinkedIn Learning.',
            },
            {
              icon: '🌓',
              title: 'Modern Experience',
              desc: 'Dark/light themes, responsive design, glassmorphism UI, and smooth micro-animations.',
            },
          ].map((item) => (
            <div key={item.title} className="feature-card glass-panel">
              <div className="feature-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Tech Foundation ─── */}
      <section className="stack-section">
        <h2 className="section-title">Our Technology</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          EduNova is built on a modern, battle-tested stack chosen for performance, security, and developer experience.
        </p>
        <div className="stack-tags">
          {['React 19', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT Auth', 'REST API', 'CSS3', 'Docker'].map(tech => (
            <span key={tech} className="stack-tag">{tech}</span>
          ))}
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="features-section">
        <div className="cta-card glass-panel">
          <h2>EduNova by the Numbers</h2>
          <div className="hero-stats" style={{ marginTop: '2rem' }}>
            {[
              { value: '4', label: 'User Roles' },
              { value: '80+', label: 'API Endpoints' },
              { value: '9+', label: 'Data Models' },
              { value: '24/7', label: 'Availability' },
            ].map(stat => (
              <div key={stat.label} className="hero-stat">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
