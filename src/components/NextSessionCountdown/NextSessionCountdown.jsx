import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   Parses the time remaining until `targetDate` into parts.
   Returns null when the date is in the past.
───────────────────────────────────────────────────────────── */
const getTimeLeft = (targetDate) => {
  const diff = new Date(targetDate) - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
};

/* ─────────────────────────────────────────────────────────────
   Single digit block
───────────────────────────────────────────────────────────── */
const Block = ({ value, label, accent }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    minWidth: '52px',
  }}>
    <div style={{
      background: accent,
      color: '#fff',
      border: '3px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '3px 3px 0 var(--shadow-color)',
      width: '52px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-heading)',
      fontWeight: 900,
      fontSize: '1.4rem',
      letterSpacing: '-0.02em',
      transition: 'transform 0.1s ease',
    }}>
      {String(value).padStart(2, '0')}
    </div>
    <span style={{
      fontSize: '0.6rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--text-muted)',
    }}>
      {label}
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   Props:
     session  — the next session object { title, date, description, studentProfileId }
     role     — 'student' | 'instructor' | 'admin'
───────────────────────────────────────────────────────────── */
const NextSessionCountdown = ({ session, role = 'student' }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(session?.date));
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!session?.date) return;
    setTimeLeft(getTimeLeft(session.date));

    intervalRef.current = setInterval(() => {
      const t = getTimeLeft(session.date);
      setTimeLeft(t);
      if (!t) clearInterval(intervalRef.current);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [session?.date]);

  if (!session) return null;

  const sessionDate = new Date(session.date);
  const isToday = sessionDate.toDateString() === new Date().toDateString();
  const isTomorrow = sessionDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
  const isStartingSoon = timeLeft && timeLeft.totalSeconds < 3600; // < 1 hour

  /* accent colour shifts as session approaches */
  const accent = !timeLeft
    ? '#10b981'                          // happening now / just started
    : isStartingSoon
    ? '#ef4444'                          // < 1 hour — red urgency
    : isToday
    ? '#f59e0b'                          // today — amber
    : 'var(--brand-primary)';            // future — brand blue

  const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
    : sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const studentName = session.studentProfileId?.user?.FullName
    || session.studentProfileId?.user?.UserName;

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: `3px solid var(--border-color)`,
      borderTop: `5px solid ${accent}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: '5px 5px 0 var(--shadow-color)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            background: accent,
            color: '#fff',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
            boxShadow: '2px 2px 0 var(--shadow-color)',
          }}>
            <i className="fa-solid fa-clock" />
            {!timeLeft ? 'Starting Now' : isStartingSoon ? 'Starting Soon' : 'Next Session'}
          </div>

          <h3 style={{
            margin: '0 0 0.2rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {session.title}
          </h3>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>
              <i className="fa-solid fa-calendar-day" style={{ marginRight: '0.3rem' }} />
              {dayLabel}
            </span>
            <span>
              <i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }} />
              {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {role !== 'student' && studentName && (
              <span style={{ color: 'var(--brand-primary)' }}>
                <i className="fa-solid fa-graduation-cap" style={{ marginRight: '0.3rem' }} />
                {studentName}
              </span>
            )}
          </div>
        </div>

        {/* Pulsing dot when starting soon */}
        {isStartingSoon && (
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 0 4px rgba(239,68,68,0.2)',
            animation: 'pulse 1.5s ease-in-out infinite',
            flexShrink: 0,
            marginTop: '4px',
          }} />
        )}
      </div>

      {/* ── Countdown blocks ── */}
      {timeLeft ? (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {timeLeft.days > 0 && <Block value={timeLeft.days}    label="days"    accent={accent} />}
          <Block value={timeLeft.hours}   label="hours"   accent={accent} />
          <Block value={timeLeft.minutes} label="min"     accent={accent} />
          <Block value={timeLeft.seconds} label="sec"     accent={accent} />

          <span style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            alignSelf: 'flex-end',
            paddingBottom: '18px',
          }}>
            until session
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(16,185,129,0.1)',
          border: '2px solid #10b981',
          borderRadius: 'var(--radius-sm)',
        }}>
          <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '1.2rem' }} />
          <span style={{ fontWeight: 700, color: '#10b981' }}>Session is starting now — join in!</span>
        </div>
      )}

      {/* ── Progress bar (fills as session approaches) ── */}
      {timeLeft && (
        <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: accent,
            borderRadius: '99px',
            /* show how close we are: full bar = 0s left, empty = 7+ days away */
            width: `${Math.max(2, 100 - Math.min(100, (timeLeft.totalSeconds / (7 * 86400)) * 100))}%`,
            transition: 'width 1s linear',
          }} />
        </div>
      )}
    </div>
  );
};

export default NextSessionCountdown;
