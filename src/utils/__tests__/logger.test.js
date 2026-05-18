import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  let trackerSpy;

  beforeEach(() => {
    trackerSpy = vi.fn();
    window.__APP_TRACK_ERROR__ = trackerSpy;
  });

  afterEach(() => {
    delete window.__APP_TRACK_ERROR__;
    vi.restoreAllMocks();
  });

  it('exposes log/info/debug/warn/error methods', () => {
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('forwards warn calls to the global tracker', () => {
    logger.warn('test warning', { extra: 1 });
    expect(trackerSpy).toHaveBeenCalledWith('warn', expect.any(Array));
  });

  it('forwards error calls to the global tracker', () => {
    const err = new Error('boom');
    logger.error('failed:', err);
    expect(trackerSpy).toHaveBeenCalledWith('error', ['failed:', err]);
  });

  it('does not crash when tracker throws', () => {
    window.__APP_TRACK_ERROR__ = () => { throw new Error('tracker exploded'); };
    expect(() => logger.error('safe')).not.toThrow();
  });
});
