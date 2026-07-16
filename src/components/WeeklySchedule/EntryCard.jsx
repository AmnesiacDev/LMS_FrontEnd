import React from 'react';
import { formatDuration, formatLocalTime } from '../../utils/weekBoundary';

// ── Color themes per entry type ──────────────────────────────────────
// Shared immutable display metadata is safe to export alongside the component.
// eslint-disable-next-line react-refresh/only-export-components
export const ENTRY_TYPE_COLORS = {
  session: {
    accent: '#3b82f6',
    bg: '#DBEAFE',
    bgDark: 'rgba(59,130,246,0.18)',
    label: 'Session',
    icon: 'fa-solid fa-calendar-days',
  },
  task_due: {
    accent: '#f59e0b',
    bg: '#FEF3C7',
    bgDark: 'rgba(245,158,11,0.18)',
    label: 'Task Due',
    icon: 'fa-solid fa-list-check',
  },
  custom: {
    accent: '#10b981',
    bg: '#D1FAE5',
    bgDark: 'rgba(16,185,129,0.18)',
    label: 'Custom',
    icon: 'fa-solid fa-pen-to-square',
  },
};

const FALLBACK = {
  accent: '#6366f1',
  bg: '#E0E7FF',
  bgDark: 'rgba(99,102,241,0.18)',
  label: 'Entry',
  icon: 'fa-solid fa-calendar',
};

// ── Validate a CSS color string ──────────────────────────────────────
function isValidColor(color) {
  if (!color || typeof color !== 'string' || !color.trim()) return false;
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) return true;
  try { return CSS.supports('color', color); } catch { return false; }
}

function resolveAccentColor(entry) {
  const typeColor = (ENTRY_TYPE_COLORS[entry.entryType] || FALLBACK).accent;
  if (!entry.color) return typeColor;
  return isValidColor(entry.color) ? entry.color : typeColor;
}

// ── Detect dark theme ────────────────────────────────────────────────
function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

// ── Avatar ───────────────────────────────────────────────────────────
function Avatar({ instructor, accentColor }) {
  const style = {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: `2px solid ${accentColor}`,
    objectFit: 'cover',
    flexShrink: 0,
    background: accentColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.55rem',
    fontWeight: 800,
    color: '#fff',
    overflow: 'hidden',
  };

  if (instructor?.avatarUrl || instructor?.avatar) {
    return <img src={instructor.avatarUrl || instructor.avatar} alt={instructor.FullName || ''} style={style} />;
  }

  const name = instructor?.FullName || instructor?.UserName || '?';
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <div style={style}>{initials}</div>;
}

// ── EntryCard ────────────────────────────────────────────────────────
const EntryCard = ({
  entry,
  isManager = false,
  isDragging = false,
  compact = false,
  onPointerDown,
  onClick,
}) => {
  const typeColors = ENTRY_TYPE_COLORS[entry.entryType] || FALLBACK;
  const accentColor = resolveAccentColor(entry);
  const instructor = typeof entry.instructorId === 'object' ? entry.instructorId : null;
  const subject = entry.subject || entry.title || 'Untitled';
  const badgeText = entry.status || formatDuration(entry.startAt, entry.endAt);
  const dark = isDarkTheme();
  const cardBg = dark ? typeColors.bgDark : typeColors.bg;

  const cardStyle = {
    background: cardBg,
    border: `2.5px solid var(--border-color)`,
    borderRadius: '10px',
    boxShadow: isDragging
      ? `3px 3px 0px 0px ${accentColor}`
      : '2px 2px 0px 0px var(--shadow-color)',
    padding: compact ? '0.6rem 0.7rem' : '0.45rem 0.55rem',
    cursor: isManager ? 'grab' : 'pointer',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '0.25rem',
    opacity: isDragging ? 0.5 : 1,
    transition: 'box-shadow 0.12s ease, transform 0.12s ease',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: compact ? 'auto' : '100%',
    flex: 1,
  };

  return (
    <div
      style={cardStyle}
      onClick={() => onClick?.(entry)}
      onPointerDown={isManager ? (e) => onPointerDown?.(e, entry) : undefined}
      tabIndex={0}
      role="button"
      aria-label={`${subject} — ${formatLocalTime(entry.startAt)} to ${formatLocalTime(entry.endAt)}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(entry); } }}
      onMouseEnter={e => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translate(-1px,-1px)';
          e.currentTarget.style.boxShadow = `3px 3px 0px 0px var(--shadow-color)`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = isDragging
          ? `3px 3px 0px 0px ${accentColor}`
          : '2px 2px 0px 0px var(--shadow-color)';
      }}
    >
      {/* ── Header: subject ── */}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 800,
        fontSize: compact ? '0.85rem' : '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        color: 'var(--text-primary)',
        lineHeight: 1.25,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {subject}
      </div>

      {/* ── Type indicator (small colored label) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.6rem',
        fontWeight: 700,
        color: accentColor,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        <i className={typeColors.icon} style={{ fontSize: '0.55rem' }} />
        {typeColors.label}
      </div>

      {/* ── Footer: avatar + name + badge ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        marginTop: 'auto',
        paddingTop: '0.15rem',
      }}>
        <Avatar instructor={instructor} accentColor={accentColor} />
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {instructor?.FullName || instructor?.UserName || '—'}
        </span>
        <span style={{
          fontSize: '0.55rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          padding: '0.12rem 0.4rem',
          border: `1.5px solid var(--border-color)`,
          borderRadius: '4px',
          background: 'var(--card-bg)',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};

export default EntryCard;
