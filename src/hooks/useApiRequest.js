import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useApiRequest = () => {
  const { ensureValidToken, refreshToken, logout } = useAuth();
  const navigate = useNavigate();

  const request = useCallback(async (url, method = 'GET', body = null) => {
    // Ensure we have a valid (non-expired) token before making the request
    const isValid = await ensureValidToken();
    if (!isValid) {
      logout();
      navigate('/login');
      throw new Error('Please login to continue.');
    }

    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('access-token') || ''}`,
    };

    // Only set Content-Type for requests that actually send a body
    if (body !== null) {
      headers['Content-Type'] = 'application/json';
    }

    const options = { method, headers, credentials: 'include' };
    if (body !== null) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    // If we get a 401/419, try to refresh the token and retry once
    if (response.status === 401 || response.status === 419) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        logout();
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }

      const newToken = localStorage.getItem('access-token') || '';
      const retryResponse = await fetch(url, {
        ...options,
        headers: { ...headers, 'Authorization': `Bearer ${newToken}` },
        credentials: 'include',
      });
      
      if (!retryResponse.ok) {
        const data = await retryResponse.json().catch(() => ({}));
        throw new Error(data.message || 'Request failed');
      }
      
      return await retryResponse.json();
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    
    return data;
  }, [ensureValidToken, refreshToken, logout, navigate]);

  const requestFormData = useCallback(async (url, method = 'POST', formData = null) => {
    const isValid = await ensureValidToken();
    if (!isValid) {
      logout();
      navigate('/login');
      throw new Error('Please login to continue.');
    }

    const buildOptions = () => ({
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access-token') || ''}`,
      },
      credentials: 'include',
      body: formData,
    });

    let response = await fetch(url, buildOptions());

    if (response.status === 401 || response.status === 419) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        logout();
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }
      response = await fetch(url, buildOptions());
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  }, [ensureValidToken, refreshToken, logout, navigate]);

  return { request, requestFormData };
};

export default useApiRequest;
