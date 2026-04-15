import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Restore user from localStorage on mount
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('lms-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('access-token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync to localStorage whenever user/token changes
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
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      // Backend returns: { status, data: { user, token } }
      const loggedInUser = data.data?.user;
      const accessToken = data.data?.token || data.token;

      setToken(accessToken);
      setUser(loggedInUser);
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
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      
      // Signup returns: { status, data: { user } }
      const newUser = data.data?.user;
      // Signup might not return a token directly — user may need to login
      // But if it does:
      const accessToken = data.data?.token || data.token;

      if (accessToken) {
        setToken(accessToken);
      }
      setUser(newUser);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Optionally call backend logout
    if (token) {
      fetch('/api/v1/auth/logout', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      }).catch(() => {}); // fire and forget
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, signup, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
