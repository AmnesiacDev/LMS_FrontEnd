const dashboardRoots = new Set([
  'account',
  'announcements',
  'audit-logs',
  'challenges',
  'exams',
  'external',
  'leaderboard',
  'messages',
  'notifications',
  'profiles',
  'progress',
  'reviews',
  'schedule',
  'sessions',
  'submissions',
  'tasks',
  'users',
]);

const splitPath = (link) => {
  const match = link.match(/^([^?#]*)([?#].*)?$/);
  return {
    path: match?.[1] || link,
    suffix: match?.[2] || '',
  };
};

export const normalizeAppLink = (link) => {
  if (!link || typeof link !== 'string') return link;
  if (/^[a-z][a-z\d+\-.]*:/i.test(link) || link.startsWith('//') || link.startsWith('#')) {
    return link;
  }

  const { path, suffix } = splitPath(link.startsWith('/') ? link : `/${link}`);
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return `${path}${suffix}`;

  if (path === '/gamification' || path.startsWith('/gamification/')) {
    return `/dashboard/achievements${suffix}`;
  }

  const root = path.split('/').filter(Boolean)[0];
  if (dashboardRoots.has(root)) return `/dashboard${path}${suffix}`;

  return link;
};
