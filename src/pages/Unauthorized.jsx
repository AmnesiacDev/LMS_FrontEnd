import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const Unauthorized = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="error-page-wrapper">
      {/* Animated background orbs */}
      <div className="error-bg-orb error-bg-orb-1"></div>
      <div className="error-bg-orb error-bg-orb-2"></div>
      <div className="error-bg-orb error-bg-orb-3"></div>

      <div className={`error-page-card glass-panel ${animate ? 'error-page-animate-in' : ''}`}>
        {/* Glowing icon */}
        <div className="error-page-icon-ring error-page-icon--warning">
          <div className="error-page-icon-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>
        </div>

        {/* Error code */}
        <h1 className="error-page-code error-page-code--warning">401</h1>

        {/* Title & description */}
        <h2 className="error-page-title">Session Expired</h2>
        <p className="error-page-desc">
          Your authentication session has ended. Please sign in again to continue accessing your dashboard and learning resources.
        </p>

        {/* Divider */}
        <div className="error-page-divider"></div>

        {/* Actions */}
        <div className="error-page-actions">
          <Link to="/login" className="error-page-btn error-page-btn--primary error-page-btn--warning">
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

export default Unauthorized;