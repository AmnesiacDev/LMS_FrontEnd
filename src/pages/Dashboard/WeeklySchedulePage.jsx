import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import useScheduleApi from '../../hooks/useScheduleApi';
import { getWeekBounds } from '../../utils/weekBoundary';
import { safeUrl } from '../../utils/safeUrl';

// ── Helpers ──────────────────────────────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatTimeSingle(isoString) {
  const d = new Date(isoString);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'P.M' : 'A.M';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  const hrStr = hours < 10 ? '0' + hours : hours;
  return `${hrStr}:${minStr} ${ampm}`;
}

function formatTimeRange(startIso, endIso) {
  return `${formatTimeSingle(startIso)} - ${formatTimeSingle(endIso)}`;
}



// ── Styles Generator ──────────────────────────────────────────────────
const getStyles = (isMobile) => ({
  pageContainer: {
    background: 'var(--bg-primary)',
    minHeight: '100vh',
    padding: isMobile ? '1.5rem 1rem' : '2.5rem 2rem',
    fontFamily: "var(--font-heading), var(--font-body), sans-serif",
    color: 'var(--text-primary)',
    border: 'var(--border-width) solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  },
  navigationBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: 'var(--border-width) solid var(--border-color)',
    paddingBottom: '1rem',
  },
  navButtonsGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  controlBtn: {
    background: 'var(--card-bg)',
    border: '2px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '0.5rem 0.85rem',
    fontWeight: 700,
    fontSize: '0.85rem',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  todayControlBtn: {
    background: 'var(--brand-primary)',
    border: '2px solid var(--border-color)',
    color: '#FFF',
    padding: '0.5rem 1.2rem',
    fontWeight: 800,
    fontSize: '0.85rem',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  weekRangeLabel: {
    fontSize: isMobile ? '0.95rem' : '1.15rem',
    fontWeight: 900,
    color: 'var(--brand-primary)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  loadingIndicator: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--brand-primary)',
    letterSpacing: '0.05em',
  },
  titleBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  titleSection: {
    flex: 1,
    minWidth: '280px',
  },
  title: {
    fontFamily: "var(--font-heading), sans-serif",
    fontSize: isMobile ? '2.2rem' : '3.8rem',
    fontWeight: 900,
    color: 'var(--card-bg)',
    WebkitTextStroke: '2px var(--border-color)',
    textShadow: '4px 4px 0px var(--shadow-color)',
    letterSpacing: '0.06em',
    margin: 0,
    lineHeight: 1.1,
  },
  metaSection: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--card-bg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  pillLabel: {
    padding: '0.5rem 1rem',
    fontSize: '0.78rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderRight: '2px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  pillValue: {
    padding: '0.5rem 1.2rem',
    fontSize: '1rem',
    fontWeight: 900,
    color: 'var(--text-primary)',
    letterSpacing: '0.05em',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
    gap: '2.5rem',
    alignItems: 'start',
  },
  timetableSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  dayBlock: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
  },
  dayLabelContainer: {
    width: isMobile ? '100%' : '75px',
    height: isMobile ? '40px' : 'auto',
    background: 'var(--border-color)',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRight: isMobile ? 'none' : '2px solid var(--border-color)',
    borderBottom: isMobile ? '2px solid var(--border-color)' : 'none',
  },
  dayLabel: {
    writingMode: isMobile ? 'horizontal-tb' : 'vertical-rl',
    transform: isMobile ? 'none' : 'rotate(180deg)',
    fontWeight: 900,
    fontSize: isMobile ? '1rem' : '1.2rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  dayContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  gridHeader: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr',
    borderBottom: '2px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    fontWeight: 800,
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-primary)',
    textAlign: 'center',
    padding: '0.6rem 0.75rem',
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr',
    borderBottom: '1.5px dashed var(--border-color)',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textAlign: 'center',
    padding: '0.75rem 0.75rem',
    alignItems: 'center',
  },
  timeValue: {
    fontFamily: 'monospace',
    fontSize: '0.88rem',
    letterSpacing: '0.02em',
  },
  codeValue: {
    fontFamily: "var(--font-heading), sans-serif",
    fontWeight: 900,
    letterSpacing: '0.05em',
  },
  onlineLink: {
    color: 'var(--brand-primary)',
    textDecoration: 'underline',
    fontWeight: 800,
    fontSize: '0.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.2rem',
  },
  noClassesRow: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    padding: '2rem 1rem',
    background: 'var(--bg-secondary)',
  },
  sidebarSectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sidebarBlock: {
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--card-bg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  sidebarHeader: {
    background: 'var(--border-color)',
    color: '#FFF',
    padding: '0.65rem 1rem',
    fontWeight: 900,
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderBottom: '2px solid var(--border-color)',
    textAlign: 'center',
  },
  sidebarRow: {
    display: 'flex',
    padding: '0.7rem 1rem',
    borderBottom: '1.5px dashed var(--border-color)',
    fontSize: '0.82rem',
    alignItems: 'center',
    lineHeight: 1.3,
  },
  sidebarCode: {
    fontWeight: 900,
    width: '100px',
    color: 'var(--brand-primary)',
    flexShrink: 0,
    fontFamily: "var(--font-heading), sans-serif",
    letterSpacing: '0.05em',
  },
  sidebarValue: {
    fontWeight: 700,
    color: 'var(--text-secondary)',
    flex: 1,
  },
  sidebarEmptyRow: {
    padding: '1.5rem 1rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontWeight: 700,
    fontSize: '0.8rem',
    background: 'var(--bg-secondary)',
  },
  emptyState: {
    padding: '4rem 2rem',
    textAlign: 'center',
    background: 'var(--card-bg)',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-sm)',
    color: 'var(--text-primary)',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
    color: 'var(--error)',
    fontWeight: 700,
    boxShadow: 'var(--shadow-sm)',
  },
});

// ── WeeklySchedulePage ───────────────────────────────────────────────
const WeeklySchedulePage = () => {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();

  const [currentWeek, setCurrentWeek] = useState(() => getWeekBounds(new Date()));
  const { entries, loading, error, fetchWeek } = useScheduleApi();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!role) return;
    fetchWeek(currentWeek.start, currentWeek.end);
  }, [currentWeek, fetchWeek, role]);

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

  // Determine weekdays and extra days to display
  const hasSunday = entries.some(e => e.startAt && new Date(e.startAt).getDay() === 0);
  const hasSaturday = entries.some(e => e.startAt && new Date(e.startAt).getDay() === 6);

  const daysToRender = [];
  if (hasSunday) daysToRender.push('Sunday');
  daysToRender.push(...WEEKDAYS);
  if (hasSaturday) daysToRender.push('Saturday');

  const getEntriesForDay = (dayName) => {
    return entries.filter(e => {
      if (!e.startAt) return false;
      const d = new Date(e.startAt);
      return DAY_NAMES[d.getDay()] === dayName;
    }).sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  };

  // Catalog all real entries for the week
  const uniqueSubjects = [];
  const seenSubjects = new Set();

  entries.forEach(entry => {
    const title = entry.subject || entry.title || 'Untitled Session';
    if (!seenSubjects.has(title)) {
      seenSubjects.add(title);
      const participant = role === 'student'
        ? (entry.instructorName || 'Instructor')
        : (entry.studentName || 'Student');

      uniqueSubjects.push({
        title,
        participant,
        type: entry.entryType === 'session' ? 'Session' : 'Task Due',
      });
    }
  });

  const styles = getStyles(isMobile);

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
    <div style={styles.pageContainer}>
      {/* ── Navigation Bar ── */}
      <div style={styles.navigationBar}>
        <div style={styles.navButtonsGroup}>
          <button onClick={handlePrev} disabled={loading} style={styles.controlBtn}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button onClick={handleToday} disabled={loading} style={styles.todayControlBtn}>
            Today
          </button>
          <button onClick={handleNext} disabled={loading} style={styles.controlBtn}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
        <div style={styles.weekRangeLabel}>
          Week of {formatRange()}
        </div>
        {loading && (
          <div style={styles.loadingIndicator}>
            <i className="fa-solid fa-circle-notch fa-spin" /> Loading…
          </div>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={styles.errorBanner}>
          <i className="fa-solid fa-triangle-exclamation" />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => fetchWeek(currentWeek.start, currentWeek.end)} style={styles.controlBtn}>Retry</button>
        </div>
      )}

      {/* ── Title Banner ── */}
      <div style={styles.titleBanner}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>CLASS SCHEDULE</h1>
        </div>
        <div style={styles.metaSection}>
          <div style={styles.pillLabel}>LMS | User Role</div>
          <div style={styles.pillValue}>{role.toUpperCase()}</div>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div style={styles.layoutGrid}>
        {/* Left Column: Timetable */}
        <div style={styles.timetableSection}>
          {daysToRender.map((dayName, idx) => {
            const dayEntries = getEntriesForDay(dayName);
            return (
              <div key={idx} style={styles.dayBlock}>
                {/* Vertical/Horizontal Day Stripe */}
                <div style={styles.dayLabelContainer}>
                  <h3 style={styles.dayLabel}>{dayName}</h3>
                </div>
                {/* Day Timetable Rows */}
                <div style={styles.dayContent}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1.3fr 2fr 1.4fr 1.2fr 0.9fr',
                    borderBottom: '2px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    padding: '0.6rem 0.75rem',
                  }}>
                    <div>Time</div>
                    <div>Subject / Title</div>
                    <div>Participant</div>
                    <div>Link / Type</div>
                    <div>Status</div>
                  </div>
                  {dayEntries.length > 0 ? (
                    dayEntries.map((entry, eIdx) => {
                      const subjectName = entry.subject || entry.title || 'Untitled Session';
                      const timeRange = formatTimeRange(entry.startAt, entry.endAt);
                      // Instructor-supplied and rendered as a link, so it goes
                      // through the same scheme allowlist as every other stored URL.
                      const meetingLink = safeUrl(entry.meetingLink);
                      const participantName = role === 'student' ? entry.instructorName : entry.studentName;
                      const isSession = entry.entryType === 'session';

                      return (
                        <div key={eIdx} style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1.3fr 2fr 1.4fr 1.2fr 0.9fr',
                          borderBottom: '1.5px dashed var(--border-color)',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          padding: '0.75rem 0.75rem',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          <div style={styles.timeValue}>{timeRange}</div>
                          <div style={{ textAlign: 'left', fontWeight: 800, color: 'var(--brand-primary)' }}>
                            {subjectName}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {participantName || 'N/A'}
                          </div>
                          <div>
                            {meetingLink ? (
                              <a
                                href={meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.onlineLink}
                                title="Join Online Meeting"
                              >
                                JOIN MEETING <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.65rem', marginLeft: '0.15rem' }} />
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', opacity: 0.7 }}>
                                {isSession ? 'Online Session' : 'Task Deadline'}
                              </span>
                            )}
                          </div>
                          <div>
                            <span
                              style={{
                                padding: '0.2rem 0.65rem',
                                borderRadius: '100px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                background: entry.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : entry.status === 'canceled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: entry.status === 'completed' ? 'var(--success)' : entry.status === 'canceled' ? 'var(--error)' : 'var(--warning)',
                                border: '1px solid currentColor',
                              }}
                            >
                              {entry.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={styles.noClassesRow}>
                      NO CLASSES SCHEDULED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Real DB Summary */}
        <div style={styles.sidebarSectionContainer}>
          {/* SCHEDULE SUMMARY Block */}
          <div style={styles.sidebarBlock}>
            <div style={styles.sidebarHeader}>SCHEDULE SUMMARY</div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Entries</span>
                <span style={{ fontWeight: 900, color: 'var(--brand-primary)' }}>{entries.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Sessions</span>
                <span style={{ fontWeight: 900, color: 'var(--success)' }}>
                  {entries.filter(e => e.entryType === 'session').length}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Tasks Due</span>
                <span style={{ fontWeight: 900, color: 'var(--warning)' }}>
                  {entries.filter(e => e.entryType === 'task_due').length}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIVE SUBJECTS & PARTICIPANTS Block */}
          <div style={styles.sidebarBlock}>
            <div style={styles.sidebarHeader}>ACTIVE SUBJECTS ({uniqueSubjects.length})</div>
            {uniqueSubjects.length > 0 ? (
              uniqueSubjects.map((sub, sIdx) => (
                <div key={sIdx} style={styles.sidebarRow}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{sub.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {role === 'student' ? `Instructor: ${sub.participant}` : `Student: ${sub.participant}`}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                    {sub.type}
                  </span>
                </div>
              ))
            ) : (
              <div style={styles.sidebarEmptyRow}>No active subjects for this period</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedulePage;
