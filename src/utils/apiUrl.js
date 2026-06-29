const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

export const getApiBaseUrl = () => (
  trimTrailingSlash(import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || '')
);

export const buildApiUrl = (path) => {
  if (!path || typeof path !== 'string') return path;
  if (/^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//')) return path;

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return path;

  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

export const getSocketUrl = () => (
  trimTrailingSlash(
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000'
  )
);
