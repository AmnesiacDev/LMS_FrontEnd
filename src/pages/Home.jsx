import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container" style={{ padding: '4rem 2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Hero Section */}
      <div style={{ maxWidth: '900px', margin: '4rem auto 3rem' }}>
         <div style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)', padding: '0.5rem 1rem', borderRadius: '2rem', display: 'inline-block', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Built by a Full-Stack Instructor
         </div>
         <h1 style={{ fontSize: '4.5rem', margin: '0 auto 1.5rem', lineHeight: '1.1', fontWeight: '800' }}>
            Master Development with a <span className="gradient-text">Modern LMS</span>
         </h1>
         <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
            Engineered by Youssef Emad using cutting-edge tech (React, Express, ASP.NET). Whether you want to master the MEAN stack or build your first Personal Portfolio, you're in the right place.
         </p>
         
         <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" style={{ background: 'var(--brand-primary)', color: 'white', padding: '1.1rem 2.5rem', borderRadius: 'var(--radius-lg)', fontWeight: '600', fontSize: '1.1rem', boxShadow: 'var(--shadow-md)', transition: 'var(--transition)' }}>
               Access Dashboard
            </Link>
            <Link to="/about" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '1.1rem 2.5rem', borderRadius: 'var(--radius-lg)', fontWeight: '600', fontSize: '1.1rem', transition: 'var(--transition)', border: '1px solid var(--border-color)' }}>
               Read The CV
            </Link>
         </div>
      </div>

      {/* Featured Projects Highlight */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '4rem auto', textAlign: 'left' }}>
         <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>System Inspirations & Projects</h2>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
               <h3 style={{ color: 'var(--brand-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Riven Roams Tours</h3>
               <p style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>July 2024</p>
               <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>A secure and dynamic web platform designed to streamline tour booking experiences for both users and administrators.</p>
            </div>
            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
               <h3 style={{ color: 'var(--info)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Exodia-OS Website</h3>
               <p style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>May 2024</p>
               <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>A highly focused layout design featuring user-friendly navigation built using modern front-end practices and animations.</p>
            </div>
            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
               <h3 style={{ color: 'var(--success)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>JavaScript Chess Engine</h3>
               <p style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>Project</p>
               <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>A fully playable interactive chess game built intelligently with vanilla JavaScript, implementing heavy logic and move validation.</p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Home;
