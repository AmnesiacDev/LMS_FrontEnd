import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './LandingLayout.css';

const LandingLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="landing-wrapper">
      <nav className="landing-navbar glass-panel">
        <div className="nav-brand">
          <Link to="/">
            <span className="brand-logo">Edu<span className="gradient-text">Nova</span></span>
          </Link>
        </div>
        
        <ul className="nav-links">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/about" className={isActive('/about')}>About</Link></li>
          <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
        </ul>

        <div className="nav-actions">
          <button className="theme-icon-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/login" className="btn-signup">Get Started</Link>
        </div>
      </nav>

      <main className="landing-main">
        <Outlet />
      </main>

      <footer className="landing-footer glass-panel">
        <p>&copy; {new Date().getFullYear()} EduNova LMS. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/about">Privacy Policy</Link>
          <Link to="/contact">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
