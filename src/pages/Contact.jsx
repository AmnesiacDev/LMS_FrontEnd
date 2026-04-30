import React, { useState } from 'react';
import './Home.css';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="home-container">
      {/* ─── Hero ─── */}
      <section className="hero-section">
        <div className="hero-badge">Get In Touch</div>
        <h1 className="hero-title">
          We'd Love to <span className="gradient-text">Hear From You</span>
        </h1>
        <p className="hero-subtitle">
          Have a question about EduNova LMS? Want to request a demo, report an issue, 
          or explore a partnership? Our team is here to help.
        </p>
      </section>

      {/* ─── Contact Grid ─── */}
      <section className="features-section" style={{ maxWidth: '1000px', margin: '0 auto 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.8fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* ─── Info Side ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Company Info Card */}
            <div className="feature-card glass-panel">
              <div className="feature-icon">🏢</div>
              <h3>EduNova LMS</h3>
              <p>A modern learning management platform built for educational institutions worldwide.</p>
            </div>

            {/* Contact Details */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 700 }}>Contact Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>Email</div>
                  <a href="mailto:support@edunova.io" style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--info)' }}>support@edunova.io</a>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>Phone</div>
                  <p style={{ fontWeight: 600, fontSize: '1rem' }}>+20 2 1234 5678</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>Location</div>
                  <p style={{ fontWeight: 600, fontSize: '1rem' }}>Cairo, Egypt</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontWeight: 700 }}>Quick Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="mailto:support@edunova.io" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.2s ease' }}>
                  📧 Email Support
                </a>
                <a href="#faq" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.2s ease' }}>
                  ❓ FAQ
                </a>
                <a href="#docs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.2s ease' }}>
                  📖 Documentation
                </a>
              </div>
            </div>
          </div>

          {/* ─── Contact Form Side ─── */}
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 700 }}>Send Us a Message</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Fill out the form below and we'll get back to you within 24 hours.
            </p>

            {submitted && (
              <div style={{ 
                padding: '1rem 1.25rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                color: 'var(--success)', 
                fontWeight: 600, 
                marginBottom: '1.5rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                ✅ Thank you! Your message has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>First Name</label>
                  <input type="text" required style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s ease' }} placeholder="John" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Last Name</label>
                  <input type="text" required style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s ease' }} placeholder="Doe" />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
                <input type="email" required style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s ease' }} placeholder="john@example.com" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subject</label>
                <select style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}>
                  <option>General Inquiry</option>
                  <option>Request a Demo</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                  <option>Bug Report</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Message</label>
                <textarea required rows="5" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s ease' }} placeholder="Tell us how we can help..." />
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="features-section" id="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="features-grid">
          {[
            { icon: '🆓', title: 'Is EduNova free to use?', desc: 'Yes! EduNova offers a free tier for individual learners and small teams. Premium plans are available for larger institutions.' },
            { icon: '🔐', title: 'How secure is my data?', desc: 'We use JWT-based authentication with refresh token rotation, encrypted data storage, and follow industry-standard security practices.' },
            { icon: '🔗', title: 'Can I integrate external courses?', desc: 'Absolutely. Track your progress on Coursera, Udemy, LinkedIn Learning, and more directly from your dashboard.' },
          ].map(faq => (
            <div key={faq.title} className="feature-card glass-panel">
              <div className="feature-icon">{faq.icon}</div>
              <h3>{faq.title}</h3>
              <p>{faq.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;
