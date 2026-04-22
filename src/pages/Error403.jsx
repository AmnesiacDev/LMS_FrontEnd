import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const Error403 = () => {
  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">🔒</div>
        <h1 className="error-title">403</h1>
        <h2 className="error-subtitle">Access Denied</h2>
        <p className="error-desc">
          You don't have permission to access this page. Please sign in or contact an administrator if you believe this is an error.
        </p>
        <div className="error-actions">
          <Link to="/login" className="error-btn-primary">Sign In</Link>
          <Link to="/" className="error-btn-secondary">Go Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Error403;