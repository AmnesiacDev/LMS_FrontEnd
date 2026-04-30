import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const NotFound = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="error-page-wrapper">
      <div className="error-bg-orb error-bg-orb-1"></div>
      <div className="error-bg-orb error-bg-orb-2"></div>
      <div className="error-bg-orb error-bg-orb-3"></div>

      <div className={`error-page-card glass-panel ${animate ? 'error-page-animate-in' : ''}`}>
        <div className="error-page-icon-ring error-page-icon--danger">
          <div className="error-page-icon-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        </div>

        <h1 className="error-page-code error-page-code--danger">404</h1>
        <h2 className="error-page-title">Page Not Found</h2>
        <p className="error-page-desc">
          The page you're looking for doesn't exist or has been moved. Double-check the URL or navigate back to safety.
        </p>

        <div className="error-page-divider"></div>

        <div className="error-page-actions">
          <Link to="/dashboard" className="error-page-btn error-page-btn--primary error-page-btn--danger-fill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Go to Dashboard
          </Link>
          <Link to="/" className="error-page-btn error-page-btn--ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;