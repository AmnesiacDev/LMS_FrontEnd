import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">?</div>
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Page Not Found</h2>
        <p className="notfound-desc">
          The page you're looking for doesn't exist or has been moved. Check the URL or navigate back.
        </p>
        <div className="notfound-actions">
          <Link to="/dashboard" className="notfound-btn-primary">Go to Dashboard</Link>
          <Link to="/" className="notfound-btn-secondary">Go Home</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;