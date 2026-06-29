import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../Logo/Logo';
import useScrollReveal from '../../hooks/useScrollReveal';
import './LandingLayout.css';

const LandingLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Initialize scroll reveal animations for all landing pages
  useScrollReveal();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="landing-wrapper">
      <nav className="landing-navbar glass-panel">
        <div className="nav-brand">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo size="md" variant="full" />
          </Link>
        </div>
        
        <ul className="nav-links">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/about" className={isActive('/about')}>About</Link></li>
          <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
        </ul>

        <div className="nav-actions">
          <button className="theme-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} />
          </button>
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/login" className="btn-signup">Get Started</Link>
        </div>
      </nav>

      <main className="landing-main">
        <div key={location.pathname} className="page-animate">
          <Outlet />
        </div>
      </main>

      <footer className="landing-footer glass-panel">
        <Logo size="sm" variant="full" />
        <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} AlgoGambit. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/about">Privacy Policy</Link>
          <Link to="/contact">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
