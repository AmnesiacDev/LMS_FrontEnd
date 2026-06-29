import { describe, it, expect } from 'vitest';
import { getApiBaseUrl, getSocketUrl } from '../utils/apiUrl';

describe('Gamification Integration Suite', () => {
  it('should verify API base url config is loaded correctly', () => {
    expect(typeof getApiBaseUrl()).toBe('string');
    expect(getSocketUrl()).toBeDefined();
  });
});
