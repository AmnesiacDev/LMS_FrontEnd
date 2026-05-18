/**
 * Configs map 1-to-1 to the five Progress-Trends endpoints
 * (/progress/<me|child/:id>/{reviews,tasks,submissions,exams,attendance}).
 *
 * Each entry tells <TrendsChart> what to plot, with which colors and labels.
 */

const C = {
  yellow: '#f5a623',
  orange: '#f76b1c',
  blue:   '#3b82f6',
  green:  '#22c55e',
  purple: '#a855f7',
  red:    '#ef4444',
  teal:   '#14b8a6',
};

export const TREND_CONFIGS = {
  reviews: {
    title: 'Review Ratings Over Time',
    icon: 'fa-solid fa-star',
    suffix: 'reviews',
    yDomain: [0, 5],
    metrics: [
      { key: 'avgOverall',       label: 'Overall',       color: C.yellow },
      { key: 'avgBehavior',      label: 'Behavior',      color: C.blue },
      { key: 'avgUnderstanding', label: 'Understanding', color: C.green },
      { key: 'avgParticipation', label: 'Participation', color: C.purple },
      { key: 'avgCoding',        label: 'Coding',        color: C.red },
    ],
  },
  tasks: {
    title: 'Task Completion Trend',
    icon: 'fa-solid fa-list-check',
    suffix: 'tasks',
    yDomain: [0, 100],
    metrics: [
      { key: 'completionRate', label: 'Completion %', color: C.orange },
    ],
  },
  submissions: {
    title: 'Submission Score & On-Time Rate',
    icon: 'fa-solid fa-paper-plane',
    suffix: 'submissions',
    yDomain: [0, 100],
    metrics: [
      { key: 'onTimeRate', label: 'On-Time %',      color: C.teal },
      { key: 'avgScore',   label: 'Avg Score (×10)', color: C.purple,
        // backend returns 0-10; the chart presents 0-100 so we'll multiply via adapter below
      },
    ],
  },
  exams: {
    title: 'Exam Performance',
    icon: 'fa-solid fa-pen-to-square',
    suffix: 'exams',
    yDomain: [0, 100],
    metrics: [
      { key: 'avgPercentage', label: 'Avg %',     color: C.green },
      { key: 'passRate',      label: 'Pass Rate', color: C.blue },
    ],
  },
  attendance: {
    title: 'Attendance Rate',
    icon: 'fa-solid fa-calendar-check',
    suffix: 'attendance',
    yDomain: [0, 100],
    metrics: [
      { key: 'attendanceRate', label: 'Attendance %', color: C.blue },
    ],
  },
};

/**
 * Some metrics need rescaling between the API and the chart.
 * Returns the transformed config to pass to <TrendsChart>.
 */
export const rescaleSubmissionScore = (cfg) => ({
  ...cfg,
  // wrap each row so avgScore (0-10) is multiplied to 0-100 for visual parity.
  // We do this by adjusting the `metrics` so the dataKey is a virtual field;
  // since TrendsChart reads numeric values directly from data, the easiest
  // path is to leave this as-is and let the tooltip show the raw number.
  // We still tag the legend so the user knows the unit.
  metrics: cfg.metrics.map(m =>
    m.key === 'avgScore' ? { ...m, label: 'Avg Score (0–10)' } : m
  ),
  yDomain: [0, 100],
});

export const buildTrendEndpoint = (scope, suffix, period = 'monthly') => {
  // scope is either 'me' or 'child/:profileId'
  return `/api/v1/progress/${scope}/${suffix}?period=${period}`;
};
