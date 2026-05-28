import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import useScheduleApi from '../../hooks/useScheduleApi';
import { getWeekBounds, formatLocalDate } from '../../utils/weekBoundary';

// ── Helpers ──────────────────────────────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function groupByDay(entries) {
  const groups = {};
  for (const entry of entries) {
    if (!entry?.startAt) continue;
    const d = new Date(entry.startAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!groups[key]) groups[key] = { date: d, dayName: DAY_NAMES[d.getDay()], entries: [] };
    groups[key].entries.push(entry);
  }
  // Sort groups by date, entries within each group by startAt
  return Object.values(groups)
    .sort((a, b) => a.date - b.date)
    .map(g => ({ ...g, entries: g.entries.sort((a, b) => new Date(a.startAt) - new Date(b.startAt)) }));
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDateRange(startIso, endIso) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const dateStr = s.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  return `${dateStr} ${formatTime(startIso)}-${formatTime(endIso)}`;
}

function getCountdown(startIso) {
  const diff = new Date(startIso) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return { days, hrs, mins };
  if (hrs > 0) return { days: 0, hrs, mins };
  return { days: 0, hrs: 0, mins };
}

function isUpcoming(startIso) {
  const diff = new Date(startIso) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = {
  page: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  title: { fontFamily: 'var(--font-heading)', fontSize: '2rem', margin: 0, fontWeight: 400 },
  subtitle: { color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem', fontWeight: 600 },
  navRow: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap',
  },
  navBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.5rem 1rem', fontFamily: 'var(--font-body)', fontWeight: 700,
    fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em',
    border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    boxShadow: '2px 2px 0px 0px var(--shadow-color)', cursor: 'pointer',
    transition: 'all 0.1s ease', background: 'var(--card-bg)', color: 'var(--text-primary)',
  },
  todayBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.5rem 1rem', fontFamily: 'var(--font-body)', fontWeight: 700,
    fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em',
    border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    boxShadow: '2px 2px 0px 0px var(--shadow-color)', cursor: 'pointer',
    transition: 'all 0.1s ease', background: 'var(--brand-primary)', color: '#fff',
  },
  weekLabel: {
    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem',
    color: 'var(--text-primary)', marginLeft: '0.25rem',
  },
  dayHeader: {
    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.78rem',
    textTransform: 'capitalize', color: 'var(--text-muted)',
    margin: '1.25rem 0 0.5rem', letterSpacing: '0.02em',
  },
  entryRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0.85rem 1.25rem',
    background: 'var(--card-bg)',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '2px 2px 0px 0px var(--shadow-color)',
    marginBottom: '0.6rem',
    transition: 'all 0.12s ease',
    cursor: 'pointer',
  },
  expandIcon: {
    width: '28px', height: '28px', borderRadius: '50%',
    border: '2px solid var(--border-color)', background: 'var(--bg-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0,
  },
  entryInfo: { flex: 1, minWidth: 0 },
  entryTitle: {
    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.92rem',
    color: 'var(--text-primary)', margin: 0, lineHeight: 1.3,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  entryMeta: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
    fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.15rem',
  },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: '0.2rem' },
  dateCol: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600,
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  countdown: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
    flexShrink: 0,
  },
  countdownNum: { color: 'var(--brand-primary)', fontSize: '1rem', fontWeight: 800 },
  countdownLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  joinBtn: {
    padding: '0.45rem 1.1rem', background: 'var(--brand-light)',
    color: 'var(--brand-primary)', border: '2px solid var(--brand-primary)',
    borderRadius: '100px', fontWeight: 700, fontSize: '0.78rem',
    cursor: 'pointer', transition: 'all 0.12s ease', flexShrink: 0,
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  moreBtn: {
    width: '28px', height: '28px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'none', border: 'none',
    fontSize: '1.1rem', color: 'var(--text-muted)', cursor: 'pointer',
    borderRadius: 'var(--radius-sm)', flexShrink: 0,
  },
  typeBadge: (type) => {
    const colors = {
      session: { bg: '#DBEAFE', color: '#2563EB', border: '#93C5FD' },
      task_due: { bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' },
      custom: { bg: '#D1FAE5', color: '#059669', border: '#6EE7B7' },
    };
    const c = colors[type] || colors.session;
    return {
      padding: '0.15rem 0.5rem', borderRadius: '4px',
      background: c.bg, color: c.color, border: `1.5px solid ${c.border}`,
      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    };
  },
  emptyState: {
    padding: '3rem', textAlign: 'center',
    background: 'var(--card-bg)', border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-md)', boxShadow: '2px 2px 0px 0px var(--shadow-color)',
  },
};

// ── WeeklySchedulePage ───────────────────────────────────────────────
const WeeklySchedulePage = () => {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();

  const [currentWeek, setCurrentWeek] = useState(() => getWeekBounds(new Date()));
  const { entries, loading, error, fetchWeek } = useScheduleApi();

  useEffect(() => {
    if (!role) return;
    fetchWeek(currentWeek.start, currentWeek.end);
  }, [currentWeek, role]);

  const handlePrev = useCallback(() => {
    setCurrentWeek(prev => { const d = new Date(prev.start); d.setDate(d.getDate() - 7); return getWeekBounds(d); });
  }, []);
  const handleNext = useCallback(() => {
    setCurrentWeek(prev => { const d = new Date(prev.start); d.setDate(d.getDate() + 7); return getWeekBounds(d); });
  }, []);
  const handleToday = useCallback(() => setCurrentWeek(getWeekBounds(new Date())), []);

  const formatRange = () => {
    const opts = { month: 'short', day: 'numeric' };
    const s = currentWeek.start.toLocaleDateString([], opts);
    const e = currentWeek.end.toLocaleDateString([], { ...opts, year: 'numeric' });
    return `${s} – ${e}`;
  };

  const dayGroups = groupByDay(entries);

  if (!role) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--error)', fontWeight: 700 }}>
          <i className="fa-solid fa-triangle-exclamation" /> Could not determine your role.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Schedule</h1>
          <p style={styles.subtitle}>{entries.length} entries this week</p>
        </div>
      </div>

      {/* ── Week Navigation ── */}
      <div style={styles.navRow}>
        <button onClick={handlePrev} disabled={loading} style={styles.navBtn}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          <i className="fa-solid fa-chevron-left" />
        </button>
        <button onClick={handleNext} disabled={loading} style={styles.navBtn}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
        <button onClick={handleToday} disabled={loading} style={styles.todayBtn}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          Today
        </button>
        <span style={styles.weekLabel}>{formatRange()}</span>
        {loading && (
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <i className="fa-solid fa-circle-notch fa-spin" /> Loading…
          </span>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem', background: 'rgba(251,113,133,0.1)',
          border: '2px solid var(--error)', borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
        }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--error)' }} />
          <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600 }}>{error}</span>
          <button onClick={() => fetchWeek(currentWeek.start, currentWeek.end)} style={styles.navBtn}>Retry</button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && entries.length === 0 && (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}><i className="fa-solid fa-calendar-days" /></p>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}>No entries this week</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nothing scheduled for this week.</p>
        </div>
      )}

      {/* ── Day-grouped list ── */}
      {dayGroups.map((group, gi) => (
        <div key={gi}>
          <p style={styles.dayHeader}>{group.dayName}</p>

          {group.entries.map(entry => {
            const instructor = typeof entry.instructorId === 'object' ? entry.instructorId : null;
            const student = typeof entry.studentProfileId === 'object' ? entry.studentProfileId : null;
            const studentName = student?.user?.FullName || student?.user?.UserName || '';
            const instructorName = instructor?.FullName || instructor?.UserName || '';
            const subject = entry.subject || entry.title || 'Untitled';
            const countdown = isUpcoming(entry.startAt) ? getCountdown(entry.startAt) : null;
            const entryType = entry.entryType || 'session';

            return (
              <div
                key={entry._id}
                style={styles.entryRow}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--shadow-color)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--shadow-color)'; }}
              >
                {/* Expand icon */}
                <div style={styles.expandIcon}>
                  <i className="fa-solid fa-chevron-right" />
                </div>

                {/* Info */}
                <div style={styles.entryInfo}>
                  <p style={styles.entryTitle}>{subject}</p>
                  <div style={styles.entryMeta}>
                    {studentName && (
                      <span style={styles.metaItem}>
                        <i className="fa-solid fa-user" style={{ color: 'var(--brand-primary)' }} />
                        {studentName}
                      </span>
                    )}
                    {instructorName && (
                      <span style={styles.metaItem}>
                        <i className="fa-solid fa-chalkboard-user" style={{ color: '#f59e0b' }} />
                        {instructorName}
                      </span>
                    )}
                    <span style={styles.typeBadge(entryType)}>
                      {entryType === 'task_due' ? 'Task' : entryType === 'session' ? 'Session' : 'Custom'}
                    </span>
                  </div>
                </div>

                {/* Countdown (if upcoming) */}
                {countdown && (
                  <div style={styles.countdown}>
                    {countdown.days > 0 && (
                      <span style={{ textAlign: 'center' }}>
                        <span style={styles.countdownNum}>{countdown.days}</span>
                        <span style={styles.countdownLabel}> Days</span>
                      </span>
                    )}
                    <span style={{ textAlign: 'center' }}>
                      <span style={styles.countdownNum}>{countdown.hrs}</span>
                      <span style={styles.countdownLabel}> Hrs</span>
                    </span>
                    <span style={{ textAlign: 'center' }}>
                      <span style={styles.countdownNum}>{countdown.mins}</span>
                      <span style={styles.countdownLabel}> Mins</span>
                    </span>
                  </div>
                )}

                {/* Date/time */}
                <div style={styles.dateCol}>
                  <i className="fa-regular fa-clock" style={{ color: 'var(--brand-primary)' }} />
                  {formatDateRange(entry.startAt, entry.endAt)}
                </div>

                {/* Join button (for upcoming sessions) */}
                {entryType === 'session' && countdown && (
                  <button style={styles.joinBtn}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
                  >
                    Join
                  </button>
                )}

                {/* More menu */}
                <button style={styles.moreBtn} title="More options">
                  <i className="fa-solid fa-ellipsis-vertical" />
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WeeklySchedulePage;
