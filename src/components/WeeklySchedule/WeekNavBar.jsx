import React from 'react';

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 1rem',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  border: '2px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  boxShadow: '2px 2px 0px 0px var(--shadow-color)',
  cursor: 'pointer',
  transition: 'all 0.1s ease',
  background: 'var(--card-bg)',
  color: 'var(--text-primary)',
};

const disabledStyle = {
  opacity: 0.45,
  cursor: 'not-allowed',
  pointerEvents: 'none',
};

const WeekNavBar = ({ weekStart, weekEnd, loading, onPrev, onNext, onToday }) => {
  const formatRange = () => {
    if (!weekStart || !weekEnd) return '';
    const opts = { month: 'short', day: 'numeric' };
    const s = weekStart.toLocaleDateString([], opts);
    const e = weekEnd.toLocaleDateString([], { ...opts, year: 'numeric' });
    return `${s} – ${e}`;
  };

  const navBtn = (handler, icon, label) => (
    <button
      onClick={handler}
      disabled={loading}
      aria-label={label}
      style={{ ...btnBase, ...(loading ? disabledStyle : {}) }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px 0px var(--shadow-color)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--shadow-color)'; }}
    >
      <i className={icon} />
      <span style={{ display: 'none' }}>{label}</span>
    </button>
  );

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
    }}>
      {navBtn(onPrev, 'fa-solid fa-chevron-left', 'Previous week')}
      {navBtn(onNext, 'fa-solid fa-chevron-right', 'Next week')}

      <button
        onClick={onToday}
        disabled={loading}
        style={{
          ...btnBase,
          background: 'var(--brand-primary)',
          color: '#fff',
          border: '2px solid var(--border-color)',
          ...(loading ? disabledStyle : {}),
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px 0px var(--shadow-color)'; } }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--shadow-color)'; }}
      >
        Today
      </button>

      <span style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'var(--text-primary)',
        marginLeft: '0.25rem',
      }}>
        {formatRange()}
      </span>

      {loading && (
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}>
          <i className="fa-solid fa-circle-notch fa-spin" />
          Loading…
        </span>
      )}
    </div>
  );
};

export default WeekNavBar;
