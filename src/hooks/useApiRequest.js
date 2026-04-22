import { useAuth } from '../context/AuthContext';

export const useApiRequest = () => {
  const { ensureValidToken, refreshToken } = useAuth();

  const request = async (url, method = 'GET', body = null) => {
    const isValid = await ensureValidToken();
    if (!isValid) {
      throw new Error('Please login to continue.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access-token') || ''}`,
    };

    const options = { method, headers, credentials: 'include' };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 419) {
      const refreshed = await refreshToken();
      if (!refreshed) {
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
  };

  return { request };
};

export default useApiRequest;