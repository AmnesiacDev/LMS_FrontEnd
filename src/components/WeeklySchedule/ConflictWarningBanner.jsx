import React from 'react';
import { formatLocalDateTime } from '../../utils/weekBoundary';

const MAX_SHOWN = 10;

const ConflictWarningBanner = ({ conflicts = [], onDismiss }) => {
  if (!conflicts.length) return null;

  const shown = conflicts.slice(0, MAX_SHOWN);
  const extra = conflicts.length - MAX_SHOWN;

  return (
    <div
      role="alert"
      style={{
        background: 'rgba(245,158,11,0.12)',
        border: '3px solid #F5C518',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-sm)',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>⚠️</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 800,
          fontSize: '0.82rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--text-primary)',
          margin: '0 0 0.35rem',
        }}>
          Schedule Conflicts Detected
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem' }}>
          The following entries overlap with your change:
        </p>
        <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {shown.map(c => (
            <li key={c._id} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {c.title} — {formatLocalDateTime(c.startAt)} – {formatLocalDateTime(c.endAt)}
            </li>
          ))}
          {extra > 0 && (
            <li style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              …and {extra} more conflict{extra > 1 ? 's' : ''}
            </li>
          )}
        </ul>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss conflicts banner"
        style={{
          background: 'none',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.2rem 0.5rem',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.75rem',
          color: 'var(--text-primary)',
          flexShrink: 0,
          boxShadow: '1px 1px 0px 0px var(--shadow-color)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
      >
        ✕ Dismiss
      </button>
    </div>
  );
};

export default ConflictWarningBanner;
