import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();

  const localStorageToken = localStorage.getItem('access-token');
  
  let localStorageUser = null;
  try {
    const stored = localStorage.getItem('lms-user');
    if (stored) {
      localStorageUser = JSON.parse(stored);
    }
  } catch (e) {
    localStorageUser = null;
  }

  if (!localStorageToken || !localStorageUser) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  if (allowedRoles && localStorageUser?.role && !allowedRoles.includes(localStorageUser.role)) {
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