/**
 * Lightweight error tracker.
 *
 * Captures:
 *   - Unhandled errors      (window.onerror)
 *   - Unhandled promise rejections (window.onunhandledrejection)
 *   - Manually reported errors via window.__APP_TRACK_ERROR__()
 *
 * In dev: logs to console with full details
 * In prod: silent on console, batched + sent to a backend endpoint
 *          (or dropped if no endpoint is configured)
 *
 * The user never sees the raw error — friendly fallback UI is handled
 * by ErrorBoundary.
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
const ENDPOINT = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_ERROR_ENDPOINT
  : null;

const queue = [];
const MAX_QUEUE = 20;
let flushTimer = null;

const buildEntry = (level, message, extra = {}) => ({
  level,
  message: typeof message === 'string' ? message : String(message?.message || message),
  stack: extra.stack || message?.stack || null,
  url: typeof window !== 'undefined' ? window.location.href : '',
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  timestamp: new Date().toISOString(),
  ...extra,
});

const flush = () => {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);

  // Only send to backend in production
  if (!isDev && ENDPOINT) {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    }).catch(() => {
      /* silently drop — never let error tracking cause more errors */
    });
  }
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 2000);
};

const track = (level, args) => {
  const entry = buildEntry(
    level,
    args[0],
    args.length > 1 ? { context: args.slice(1) } : {}
  );

  if (queue.length < MAX_QUEUE) {
    queue.push(entry);
    scheduleFlush();
  }
};

export const initErrorTracker = () => {
  if (typeof window === 'undefined') return;

  // Expose hook used by logger
  window.__APP_TRACK_ERROR__ = track;

  window.addEventListener('error', (event) => {
    track('error', [event.message, { stack: event.error?.stack, source: event.filename, line: event.lineno, col: event.colno }]);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    track('error', [
      reason?.message || 'Unhandled promise rejection',
      { stack: reason?.stack, type: 'unhandledrejection' },
    ]);
  });

  // Final flush on page hide
  window.addEventListener('beforeunload', flush);
};

/* Manual report — call from anywhere */
export const reportError = (error, context = {}) => {
  track('error', [error?.message || error, { stack: error?.stack, ...context }]);
};

export default { initErrorTracker, reportError };
