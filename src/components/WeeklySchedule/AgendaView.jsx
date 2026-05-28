import React from 'react';
import EntryCard from './EntryCard';
import { formatLocalTime } from '../../utils/weekBoundary';

const DAY_ORDER  = [6, 0, 1, 2, 3, 4, 5];
const DAY_LABELS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function buildWeekDays(weekStart) {
  return DAY_ORDER.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function sameDay(date, isoString) {
  const d = new Date(isoString);
  return date.getFullYear() === d.getFullYear() &&
    date.getMonth() === d.getMonth() &&
    date.getDate() === d.getDate();
}

const AgendaView = ({ entries = [], weekStart, onEntryClick }) => {
  if (!weekStart) return null;

  const weekDays = buildWeekDays(weekStart);
  const hasAny = entries.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!hasAny && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>
            <i className="fa-solid fa-calendar-days" />
          </p>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}>No entries this week</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nothing scheduled for this week.</p>
        </div>
      )}

      {weekDays.map((dayDate, i) => {
        const dayEntries = entries
          .filter(e => sameDay(dayDate, e.startAt))
          .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

        if (dayEntries.length === 0) return null;

        const label = dayDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

        return (
          <div key={i}>
            {/* Date group header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 800,
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}>
                {label}
              </span>
              <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }} />
            </div>

            {/* Entry rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dayEntries.map(entry => (
                <div
                  key={entry._id}
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '0.75rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => onEntryClick?.(entry)}
                >
                  {/* Time column */}
                  <div style={{
                    width: '60px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '0.1rem',
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatLocalTime(entry.startAt)}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {formatLocalTime(entry.endAt)}
                    </span>
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <EntryCard
                      entry={entry}
                      compact
                      isManager={false}
                      onClick={onEntryClick}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgendaView;
