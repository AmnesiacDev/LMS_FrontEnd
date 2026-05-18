/**
 * Centralised logger.
 *
 * Behaviour:
 * - In dev (import.meta.env.DEV === true): forwards everything to the console
 * - In production: stays silent for log/info/debug, only forwards warn/error
 *   so we still get critical signals in browser devtools without flooding logs.
 *
 * Errors are also forwarded to the global error tracker if available.
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

const noop = () => {};

const forwardToTracker = (level, args) => {
  if (typeof window !== 'undefined' && window.__APP_TRACK_ERROR__) {
    try {
      window.__APP_TRACK_ERROR__(level, args);
    } catch {
      /* never let tracker crash logger */
    }
  }
};

export const logger = {
  log:   isDev ? console.log.bind(console)   : noop,
  info:  isDev ? console.info.bind(console)  : noop,
  debug: isDev ? console.debug.bind(console) : noop,
  warn:  (...args) => {
    if (isDev) console.warn(...args);
    forwardToTracker('warn', args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
    forwardToTracker('error', args);
  },
};

export default logger;
