import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth();

  // Not authenticated — redirect to login page (not unauthorized)
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Authenticated but wrong role — show forbidden
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/forbidden" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;