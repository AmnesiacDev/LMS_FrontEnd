import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/apiUrl';
import { sanitizeErrorMessage } from '../utils/errorSanitizer';

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

    const requestUrl = buildApiUrl(url);
    const response = await fetch(requestUrl, options);

    // If we get a 401/419, try to refresh the token and retry once
    if (response.status === 401 || response.status === 419) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        logout();
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }

      const newToken = localStorage.getItem('access-token') || '';
      const retryResponse = await fetch(requestUrl, {
        ...options,
        headers: { ...headers, 'Authorization': `Bearer ${newToken}` },
        credentials: 'include',
      });
      
      const retryData = await retryResponse.json().catch(() => ({}));
      if (!retryResponse.ok) {
        throw new Error(sanitizeErrorMessage(retryData.message || 'Request failed'));
      }
      
      return retryData;
    }

    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      throw new Error(sanitizeErrorMessage(data.message || `Request failed (${response.status})`));
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

    const requestUrl = buildApiUrl(url);
    let response = await fetch(requestUrl, buildOptions());

    if (response.status === 401 || response.status === 419) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        logout();
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }
      response = await fetch(requestUrl, buildOptions());
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(sanitizeErrorMessage(data.message || `Request failed (${response.status})`));
    }
    return data;
  }, [ensureValidToken, refreshToken, logout, navigate]);

  return { request, requestFormData };
};

export default useApiRequest;
