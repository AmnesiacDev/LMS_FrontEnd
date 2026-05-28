/**
 * Week_Boundary_Calculator
 * Pure function — no side effects, no external reads/writes, no input mutation.
 * Uses local-timezone Date constructor so DST transitions don't shift calendar dates.
 */

/**
 * Returns the Saturday-to-Friday week bounds containing the given date,
 * computed entirely in the user's local timezone.
 *
 * @param {Date} date - Any valid Date instance
 * @returns {{ start: Date, end: Date }}
 * @throws {TypeError} if date is not a valid Date instance
 */
export function getWeekBounds(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('getWeekBounds: expected a valid Date instance');
  }

  // getDay(): 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const dayOfWeek = date.getDay();

  // Days since the most recent Saturday:
  // Sat=6 → 0, Sun=0 → 1, Mon=1 → 2, ..., Fri=5 → 6
  const daysSinceSat = dayOfWeek === 6 ? 0 : dayOfWeek + 1;

  // Build Saturday 00:00:00.000 local
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - daysSinceSat,
    0, 0, 0, 0
  );

  // Build Friday 23:59:59.999 local (start + 6 calendar days)
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 6,
    23, 59, 59, 999
  );

  return { start, end };
}

/**
 * Formats a Date as YYYY-MM-DD in the user's local timezone.
 * Used to build the startDate / endDate query parameters.
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats an ISO datetime string as a human-readable local time.
 * e.g. "9:00 AM"
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatLocalTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Formats an ISO datetime string as a human-readable local date + time.
 * e.g. "Sat, Jan 11 · 9:00 AM"
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatLocalDateTime(isoString) {
  const d = new Date(isoString);
  const datePart = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const timePart = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}

/**
 * Returns formatted duration string from two ISO strings.
 * e.g. "1h 30m", "45m", "2h"
 *
 * @param {string} startIso
 * @param {string} endIso
 * @returns {string}
 */
export function formatDuration(startIso, endIso) {
  const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000);
  if (mins <= 0) return '0m';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
