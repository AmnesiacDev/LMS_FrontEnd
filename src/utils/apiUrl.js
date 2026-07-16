const normalizeBaseUrl = (value) => (
  typeof value === 'string' ? value.trim().replace(/\/+$/, '') : ''
);

export const getApiBaseUrl = (env = import.meta.env) => (
  normalizeBaseUrl(env.VITE_API_BASE || env.VITE_API_BASE_URL)
);

export const buildApiUrl = (path, env = import.meta.env) => {
  if (!path || typeof path !== 'string') return path;
  if (/^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//')) return path;

  const baseUrl = getApiBaseUrl(env);
  if (!baseUrl) return path;

  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

export const getSocketUrl = (env = import.meta.env) => {
  const configuredUrl = normalizeBaseUrl(
    env.VITE_SOCKET_URL || env.VITE_API_BASE || env.VITE_API_BASE_URL
  );

  if (configuredUrl) return configuredUrl;

  return env.DEV || env.MODE === 'development' ? 'http://localhost:3000' : '';
};
