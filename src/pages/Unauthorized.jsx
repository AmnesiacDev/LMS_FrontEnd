import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">🔑</div>
        <h1 className="unauthorized-title">401</h1>
        <h2 className="unauthorized-subtitle">Session Expired</h2>
        <p className="unauthorized-desc">
          Your session has expired. Please sign in again to continue accessing your dashboard.
        </p>
        <div className="unauthorized-actions">
          <Link to="/login" className="unauthorized-btn-primary">Sign In</Link>
          <Link to="/" className="unauthorized-btn-secondary">Go Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;