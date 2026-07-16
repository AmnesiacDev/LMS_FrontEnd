import { describe, expect, it } from 'vitest';
import { validateBuildEnvironment } from '../../../vite.config.js';
import { buildApiUrl, getApiBaseUrl, getSocketUrl } from '../apiUrl';

describe('API and Socket.IO URL configuration', () => {
  it('normalizes configured origins and builds relative API URLs', () => {
    const env = { VITE_API_BASE: ' https://api.example.com/// ' };

    expect(getApiBaseUrl(env)).toBe('https://api.example.com');
    expect(buildApiUrl('/api/v1/auth/login', env)).toBe(
      'https://api.example.com/api/v1/auth/login'
    );
  });

  it('does not rewrite absolute or protocol-relative URLs', () => {
    const env = { VITE_API_BASE: 'https://api.example.com' };

    expect(buildApiUrl('https://files.example.com/report.pdf', env)).toBe(
      'https://files.example.com/report.pdf'
    );
    expect(buildApiUrl('//files.example.com/report.pdf', env)).toBe(
      '//files.example.com/report.pdf'
    );
  });

  it('uses localhost only in development when no socket origin is configured', () => {
    expect(getSocketUrl({ DEV: true, MODE: 'development' })).toBe(
      'http://localhost:3000'
    );
    expect(getSocketUrl({ DEV: false, MODE: 'production' })).toBe('');
  });

  it('prefers the explicit socket origin and supports the legacy API alias locally', () => {
    expect(getSocketUrl({
      DEV: false,
      MODE: 'production',
      VITE_API_BASE: 'https://api.example.com',
      VITE_SOCKET_URL: 'https://socket.example.com/',
    })).toBe('https://socket.example.com');
    expect(getApiBaseUrl({ VITE_API_BASE_URL: 'http://localhost:3000/' })).toBe(
      'http://localhost:3000'
    );
  });
});

describe('production build environment validation', () => {
  it('requires both public origins', () => {
    expect(() => validateBuildEnvironment({})).toThrow(
      'VITE_API_BASE is required for production builds.'
    );
    expect(() => validateBuildEnvironment({
      VITE_API_BASE: 'https://api.example.com',
    })).toThrow('VITE_SOCKET_URL is required for production builds.');
  });

  it('rejects insecure, local, and path-based origins', () => {
    expect(() => validateBuildEnvironment({
      VITE_API_BASE: 'http://api.example.com',
      VITE_SOCKET_URL: 'https://socket.example.com',
    })).toThrow('VITE_API_BASE must use HTTPS for production builds.');
    expect(() => validateBuildEnvironment({
      VITE_API_BASE: 'https://127.0.0.2',
      VITE_SOCKET_URL: 'https://socket.example.com',
    })).toThrow('VITE_API_BASE must not point to a local host in production.');
    expect(() => validateBuildEnvironment({
      VITE_API_BASE: 'https://api.example.com/v1',
      VITE_SOCKET_URL: 'https://socket.example.com',
    })).toThrow('VITE_API_BASE must be an origin only');
  });

  it('returns normalized CSP origins and validates an optional error endpoint', () => {
    expect(validateBuildEnvironment({
      VITE_API_BASE: 'https://api.example.com/',
      VITE_SOCKET_URL: 'https://socket.example.com/',
      VITE_ERROR_ENDPOINT: 'https://errors.example.com/v1/events',
    })).toEqual({
      apiOrigin: 'https://api.example.com',
      socketOrigin: 'https://socket.example.com',
      errorOrigin: 'https://errors.example.com',
    });

    expect(() => validateBuildEnvironment({
      VITE_API_BASE: 'https://api.example.com',
      VITE_SOCKET_URL: 'https://socket.example.com',
      VITE_ERROR_ENDPOINT: 'http://errors.example.com/v1/events',
    })).toThrow('VITE_ERROR_ENDPOINT must use a non-local HTTPS URL in production.');
  });
});
