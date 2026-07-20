import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import useScheduleApi from '../../hooks/useScheduleApi';
import { getWeekBounds } from '../../utils/weekBoundary';

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

const getEntryRoom = (entry) => {
  if (entry.entryType === 'session') {
    return 'ONLINE';
  }
  return '—';
};

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

  // Directory generators (for the sidebar)
  const uniqueSubjects = [];
  const seenSubjects = new Set();
  const subjectToCodeMap = {};
  let codeCounter = 301; // Starting subject number

  const getSubjectCode = (subjName) => {
    const name = subjName || 'Untitled Session';
    if (subjectToCodeMap[name]) return subjectToCodeMap[name];

    // Build subject prefix
    const words = name.trim().toUpperCase().split(/\s+/);
    let prefix = '';
    if (words.length >= 2) {
      prefix = words.map(w => w[0]).join('').replace(/[^A-Z]/g, '').slice(0, 3);
    } else {
      prefix = words[0].replace(/[^A-Z]/g, '').slice(0, 3);
    }
    if (prefix.length < 2) prefix = (prefix + 'AIT').slice(0, 3);

    const code = `${prefix} ${codeCounter}`;
    codeCounter += 4; // Increment codes
    subjectToCodeMap[name] = code;
    return code;
  };

  // Catalog all entries for the week
  entries.forEach(entry => {
    const subjectName = entry.subject || entry.title || 'Untitled Session';
    if (!seenSubjects.has(subjectName)) {
      seenSubjects.add(subjectName);
      const code = getSubjectCode(subjectName);
      const instructor = typeof entry.instructorId === 'object' ? entry.instructorId : null;
      let profName = instructor?.FullName || instructor?.UserName || 'Staff';
      
      // format prof prefix for high-fidelity representation
      if (profName !== 'Staff' && !profName.startsWith('Mr.') && !profName.startsWith('Ms.') && !profName.startsWith('Dr.')) {
        profName = `Prof. ${profName}`;
      }

      uniqueSubjects.push({
        code,
        subjectName,
        profName
      });
    }
  });

  // Sort catalog by code
  uniqueSubjects.sort((a, b) => a.code.localeCompare(b.code));

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
                  <div style={styles.gridHeader}>
                    <div>Time</div>
                    <div>Link</div>
                    <div>Code</div>
                  </div>
                  {dayEntries.length > 0 ? (
                    dayEntries.map((entry, eIdx) => {
                      const subjectName = entry.subject || entry.title || 'Untitled Session';
                      const code = getSubjectCode(subjectName);
                      const timeRange = formatTimeRange(entry.startAt, entry.endAt);
                      const roomVal = getEntryRoom(entry);
                      const meetingLink = entry.meetingLink || (typeof entry.sessionId === 'object' ? entry.sessionId?.meetingLink : null);
                      const isOnline = roomVal === 'ONLINE';

                      return (
                        <div key={eIdx} style={styles.gridRow}>
                          <div style={styles.timeValue}>{timeRange}</div>
                          <div>
                            {isOnline ? (
                              meetingLink ? (
                                <a href={meetingLink} target="_blank" rel="noopener noreferrer" style={styles.onlineLink} title="Join Online Meeting">
                                  ONLINE <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.65rem', marginLeft: '0.15rem' }} />
                                </a>
                              ) : (
                                <span style={{ textTransform: 'uppercase', opacity: 0.7 }}>ONLINE</span>
                              )
                            ) : (
                              <span style={{ textTransform: 'uppercase', opacity: 0.5 }}>{roomVal}</span>
                            )}
                          </div>
                          <div style={styles.codeValue} title={subjectName}>
                            {code}
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

        {/* Right Column: Code directories */}
        <div style={styles.sidebarSectionContainer}>
          {/* CODE | SUBJECT Block */}
          <div style={styles.sidebarBlock}>
            <div style={styles.sidebarHeader}>CODE | SUBJECT</div>
            {uniqueSubjects.length > 0 ? (
              uniqueSubjects.map((sub, sIdx) => (
                <div key={sIdx} style={styles.sidebarRow}>
                  <div style={styles.sidebarCode}>{sub.code}</div>
                  <div style={styles.sidebarValue}>{sub.subjectName}</div>
                </div>
              ))
            ) : (
              <div style={styles.sidebarEmptyRow}>No scheduled subjects</div>
            )}
          </div>

          {/* CODE | PROFESSORS Block */}
          <div style={styles.sidebarBlock}>
            <div style={styles.sidebarHeader}>CODE | PROFESSORS</div>
            {uniqueSubjects.length > 0 ? (
              uniqueSubjects.map((sub, pIdx) => (
                <div key={pIdx} style={styles.sidebarRow}>
                  <div style={styles.sidebarCode}>{sub.code}</div>
                  <div style={styles.sidebarValue}>{sub.profName}</div>
                </div>
              ))
            ) : (
              <div style={styles.sidebarEmptyRow}>No assigned professors</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedulePage;
