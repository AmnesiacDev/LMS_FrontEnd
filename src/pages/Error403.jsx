import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const Error403 = () => {
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
        <div className="error-page-icon-ring error-page-icon--brand">
          <div className="error-page-icon-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>

        <h1 className="error-page-code error-page-code--brand">403</h1>
        <h2 className="error-page-title">Access Denied</h2>
        <p className="error-page-desc">
          You don't have the required permissions to access this page. If you believe this is an error, please contact your administrator.
        </p>

        <div className="error-page-divider"></div>

        <div className="error-page-actions">
          <Link to="/login" className="error-page-btn error-page-btn--primary error-page-btn--brand-fill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Sign In
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

export default Error403;