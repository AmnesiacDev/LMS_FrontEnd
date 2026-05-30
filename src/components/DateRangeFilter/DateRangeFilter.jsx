import React, { useState, useEffect, useRef } from 'react';

/**
 * DateRangeFilter
 *
 * Props:
 *   from          — ISO date string or ''
 *   to            — ISO date string or ''
 *   onChange      — fn({ from, to })
 *   onClear       — fn()
 *
 * Renders a compact "From → To" date picker pair that matches the
 * neo-brutalist theme (border, shadow, font-body).
 *
 * Also exposes quick-select presets: Today, This Week, This Month, Last Month.
 */

const PRESETS = [
  { label: 'Today',      key: 'today' },
  { label: 'This Week',  key: 'week' },
  { label: 'This Month', key: 'month' },
  { label: 'Last Month', key: 'lastMonth' },
];

const toDateInput = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPreset = (key) => {
  const now = new Date();
  switch (key) {
    case 'today': {
      const s = toDateInput(now);
      return { from: s, to: s };
    }
    case 'week': {
      const day = now.getDay(); // 0=Sun
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((day + 6) % 7));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return { from: toDateInput(mon), to: toDateInput(sun) };
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: toDateInput(first), to: toDateInput(last) };
    }
    case 'lastMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toDateInput(first), to: toDateInput(last) };
    }
    default: return { from: '', to: '' };
  }
};

const inputStyle = {
  padding: '0.42rem 0.7rem',
  border: '2px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--card-bg)',
  color: 'var(--text-primary)',
  fontSize: '0.82rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxShadow: '2px 2px 0 var(--shadow-color)',
  cursor: 'pointer',
  minWidth: 0,
};

const DateRangeFilter = ({ from = '', to = '', onChange, onClear }) => {
  const [activePreset, setActivePreset] = useState(null);
  // Track whether the last change came from inside this component (preset/input)
  // so we don't clear activePreset on our own onChange echo-back.
  const internalChange = useRef(false);

  // If the parent resets from/to to '' externally (e.g. a "clear all filters" button),
  // clear the active preset highlight so the UI stays in sync.
  useEffect(() => {
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    if (!from && !to) {
      setActivePreset(null);
    }
  }, [from, to]);

  const handlePreset = (key) => {
    const range = getPreset(key);
    internalChange.current = true;
    setActivePreset(key);
    onChange(range);
  };

  const handleFrom = (e) => {
    internalChange.current = true;
    setActivePreset(null);
    onChange({ from: e.target.value, to });
  };

  const handleTo = (e) => {
    internalChange.current = true;
    setActivePreset(null);
    onChange({ from, to: e.target.value });
  };

  const handleClear = () => {
    internalChange.current = true;
    setActivePreset(null);
    onClear?.();
    onChange({ from: '', to: '' });
  };

  const hasFilter = from || to;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
    }}>
      {/* ── Preset pills ── */}
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => handlePreset(p.key)}
          style={{
            padding: '0.38rem 0.75rem',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: activePreset === p.key ? 'var(--brand-primary)' : 'var(--card-bg)',
            color: activePreset === p.key ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            boxShadow: activePreset === p.key
              ? '2px 2px 0 var(--shadow-color)'
              : '2px 2px 0 var(--shadow-color)',
            transform: activePreset === p.key ? 'translate(-1px,-1px)' : 'none',
            transition: 'all 0.12s ease',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (activePreset !== p.key) {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.transform = 'translate(-1px,-1px)';
              e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)';
            }
          }}
          onMouseLeave={e => {
            if (activePreset !== p.key) {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '2px 2px 0 var(--shadow-color)';
            }
          }}
        >
          {p.label}
        </button>
      ))}

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 28, background: 'var(--border-color)', flexShrink: 0 }} />

      {/* ── From date ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          From
        </span>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={handleFrom}
          style={inputStyle}
          aria-label="Filter from date"
        />
      </div>

      {/* ── Arrow ── */}
      <i className="fa-solid fa-arrow-right" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0 }} />

      {/* ── To date ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          To
        </span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={handleTo}
          style={inputStyle}
          aria-label="Filter to date"
        />
      </div>

      {/* ── Clear ── */}
      {hasFilter && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear date filter"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.38rem 0.65rem',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            color: 'var(--error)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            boxShadow: '2px 2px 0 var(--shadow-color)',
            transition: 'all 0.12s ease',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--shadow-color)'; }}
        >
          <i className="fa-solid fa-xmark" />
          Clear
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
