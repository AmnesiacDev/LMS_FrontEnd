import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';
import { buildApiUrl } from '../utils/apiUrl';

const AuthContext = createContext();

// Consumers need the context hook from the same module as its provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Decode JWT payload without external library
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Check if a JWT token is expired (or will expire within bufferMs)
const isTokenExpired = (token, bufferMs = 60000) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - bufferMs;
};

export const AuthProvider = ({ children }) => {
  const storedUser = (() => {
    try {
      const stored = localStorage.getItem('lms-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const storedToken = localStorage.getItem('access-token');

  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(storedToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // True while we're verifying/refreshing the stored token on first load.
  // ProtectedRoute waits for this to be false before making auth decisions,
  // which prevents a flash-redirect to /login on page refresh.
  const [initializing, setInitializing] = useState(true);
  const refreshPromise = useRef(null);
  const refreshIntervalRef = useRef(null);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access-token');
    localStorage.removeItem('lms-user');
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    // If already refreshing, return the existing promise to avoid duplicate calls
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    refreshPromise.current = (async () => {
      try {
        const response = await fetch(buildApiUrl('/api/v1/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          clearAuth();
          return false;
        }

        const data = await response.json();

        if (data.status === 'success' && data.data?.token) {
          const newToken = data.data.token;
          setToken(newToken);
          localStorage.setItem('access-token', newToken);
          return true;
        }

        clearAuth();
        return false;
      } catch (err) {
        logger.error('Token refresh failed:', err);
        clearAuth();
        return false;
      } finally {
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [clearAuth]);

  // Setup automatic refresh timer when we have a valid token
  const setupRefreshTimer = useCallback((currentToken) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (!currentToken) return;

    const payload = decodeJwtPayload(currentToken);
    if (!payload?.exp || !payload?.iat) return;

    // Refresh at 80% of the token's lifetime
    const tokenLifetimeMs = (payload.exp - payload.iat) * 1000;
    const refreshAfterMs = tokenLifetimeMs * 0.8;
    const timeSinceIssued = Date.now() - payload.iat * 1000;
    const timeUntilRefresh = Math.max(refreshAfterMs - timeSinceIssued, 10000); // at least 10s

    logger.debug(`[Auth] Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000)}s`);

    refreshIntervalRef.current = setTimeout(async () => {
      logger.debug('[Auth] Proactive token refresh triggered');
      const success = await refreshAccessToken();
      if (!success) {
        logger.warn('[Auth] Proactive refresh failed, user session expired');
      }
    }, timeUntilRefresh);
  }, [refreshAccessToken]);

  // Ensure we have a valid token, refreshing if needed
  const ensureValidToken = useCallback(async () => {
    const currentToken = localStorage.getItem('access-token');

    if (!currentToken) {
      return false;
    }

    if (isTokenExpired(currentToken, 60000)) {
      logger.debug('[Auth] Token expired or expiring soon, refreshing...');
      return await refreshAccessToken();
    }

    return true;
  }, [refreshAccessToken]);

  // On mount: verify the stored token is still valid.
  // If it's expired, attempt a silent refresh via the httpOnly cookie.
  // This prevents a flash-redirect to /login when the user refreshes the page.
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const currentToken = localStorage.getItem('access-token');

      if (!currentToken) {
        // No token at all — clear any stale user data and finish
        setUser(null);
        setInitializing(false);
        return;
      }

      if (isTokenExpired(currentToken, 60000)) {
        logger.debug('[Auth] Stored token expired on mount, attempting silent refresh...');
        const refreshed = await refreshAccessToken();
        if (!cancelled) {
          if (!refreshed) {
            // Refresh failed — clear stale user so ProtectedRoute redirects correctly
            setUser(null);
          }
          setInitializing(false);
        }
      } else {
        // Token is still valid — nothing to do
        if (!cancelled) setInitializing(false);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // Sync token to localStorage and setup refresh timer
  useEffect(() => {
    if (token) {
      localStorage.setItem('access-token', token);
      setupRefreshTimer(token);
    } else {
      localStorage.removeItem('access-token');
    }
  }, [token, setupRefreshTimer]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lms-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lms-user');
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();

      // Backend returns: { status: "success", data: { user, token } }
      const loggedInUser = data.data?.user;
      const accessToken = data.data?.token || data.token;

      if (!accessToken) {
        throw new Error('No token received from server');
      }

      setToken(accessToken);
      localStorage.setItem('access-token', accessToken);
      setUser(loggedInUser);
      localStorage.setItem('lms-user', JSON.stringify(loggedInUser));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl('/api/v1/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Signup failed');
      }

      const data = await response.json();
      const accessToken = data.data?.token || data.token;
      const newUser = data.data?.user;

      if (!accessToken) {
        throw new Error('No token received from server');
      }

      setToken(accessToken);
      localStorage.setItem('access-token', accessToken);
      setUser(newUser);
      if (newUser) localStorage.setItem('lms-user', JSON.stringify(newUser));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('access-token');
      await fetch(buildApiUrl('/api/v1/auth/logout'), {
        method: 'GET',
        credentials: 'include',
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
      });
    } catch {
      // ignore — we always clear local state regardless
    }
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      initializing,
      login,
      signup,
      logout,
      setError,
      refreshToken: refreshAccessToken,
      ensureValidToken,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
