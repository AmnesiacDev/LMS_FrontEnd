import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshPromise = useRef(null);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access-token');
    localStorage.removeItem('lms-user');
    localStorage.removeItem('token-expiry');
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing && refreshPromise.current) {
      return refreshPromise.current;
    }

    const currentToken = localStorage.getItem('access-token');
    if (!currentToken) {
      return false;
    }

    setIsRefreshing(true);
    refreshPromise.current = (async () => {
      try {
        const response = await fetch('/api/v1/auth/refresh', {
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
        clearAuth();
        return false;
      } finally {
        setIsRefreshing(false);
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [isRefreshing, clearAuth]);

  const ensureValidToken = useCallback(async () => {
    const currentToken = localStorage.getItem('access-token');
    
    if (!currentToken) {
      return false;
    }
    
    return true;
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('access-token', token);
    } else {
      localStorage.removeItem('access-token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lms-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lms-user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }
      
      const data = await response.json();
      
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
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Signup failed');
      }
      
      const data = await response.json();
      
      const newUser = data.data?.user;
      const accessToken = data.data?.token || data.token;

      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem('access-token', accessToken);
      }
      setUser(newUser);
      if (newUser) {
        localStorage.setItem('lms-user', JSON.stringify(newUser));
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (e) {}
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error, 
      login, 
      signup, 
      logout, 
      setError,
      refreshToken: refreshAccessToken,
      ensureValidToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};