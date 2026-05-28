import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route and enforces authentication + optional role checks.
 *
 * While the AuthContext is still verifying the stored token on first load
 * (initializing === true) we render nothing — this prevents a flash-redirect
 * to /login that would happen if we checked isAuthenticated before the silent
 * refresh has had a chance to complete.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated, initializing } = useAuth();

  // Still checking stored token — render nothing to avoid a flash
  if (initializing) {
    return null;
  }

  // Not authenticated — redirect to login, preserving the intended destination
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
