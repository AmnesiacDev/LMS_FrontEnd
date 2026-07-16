import React, { useRef } from 'react';
import EntryCard from './EntryCard';

// ── Grid constants ───────────────────────────────────────────────────
const GRID_START_HOUR = 8;
const GRID_END_HOUR   = 22;
const TOTAL_SLOTS     = (GRID_END_HOUR - GRID_START_HOUR) * 2; // 28 half-hour slots
const ROW_HEIGHT_PX   = 52;
const GUTTER_WIDTH    = 72;

const DAY_ORDER  = [6, 0, 1, 2, 3, 4, 5]; // Sat → Fri
const DAY_LABELS = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];

// ── Helpers ──────────────────────────────────────────────────────────
function minutesSinceMidnight(isoString) {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

function slotIndex(isoString) {
  const mins = minutesSinceMidnight(isoString);
  return Math.floor((mins - GRID_START_HOUR * 60) / 30);
}

function gridRowStart(isoString) {
  // Row 1 = header, Row 2 = first slot (08:00)
  return Math.max(0, slotIndex(isoString)) + 2;
}

function gridRowSpan(startIso, endIso) {
  const startSlot = slotIndex(startIso);
  const endMins   = minutesSinceMidnight(endIso);
  const endSlot   = Math.ceil((endMins - GRID_START_HOUR * 60) / 30);
  return Math.max(1, endSlot - startSlot);
}

function isToday(date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

function buildWeekDays(weekStart) {
  return DAY_ORDER.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

// Returns flat list of { entry, colIdx, rowStart, rowSpan, widthPct, leftPct }
function layoutEntries(entries, weekDays) {
  // Group entries by column (day)
  const columns = DAY_ORDER.map((_, colIdx) => {
    const dayDate = weekDays[colIdx];
    if (!dayDate) return [];
    return entries.filter(e => {
      if (!e?.startAt) return false;
      const d = new Date(e.startAt);
      return d.getFullYear() === dayDate.getFullYear() &&
        d.getMonth() === dayDate.getMonth() &&
        d.getDate() === dayDate.getDate();
    });
  });

  const result = [];

  columns.forEach((colEntries, colIdx) => {
    if (!colEntries.length) return;

    // Sort by startAt
    const sorted = [...colEntries].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    // Simple overlap detection: build groups of overlapping entries
    const groups = [];
    for (const entry of sorted) {
      const start = new Date(entry.startAt).getTime();
      let placed = false;
      for (const group of groups) {
        const lastEnd = Math.max(...group.map(e => new Date(e.endAt).getTime()));
        if (start < lastEnd) {
          group.push(entry);
          placed = true;
          break;
        }
      }
      if (!placed) groups.push([entry]);
    }

    // Flatten groups into positioned items
    for (const group of groups) {
      const n = group.length;
      group.forEach((entry, entryIdx) => {
        result.push({
          entry,
          colIdx,
          rowStart: gridRowStart(entry.startAt),
          rowSpan:  gridRowSpan(entry.startAt, entry.endAt),
          widthPct: 100 / n,
          leftPct:  (100 / n) * entryIdx,
        });
      });
    }
  });

  return result;
}

// ── Skeleton card ─────────────────────────────────────────────────────
const SkeletonCard = ({ style }) => (
  <div style={{
    ...style,
    background: 'var(--bg-tertiary)',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    animation: 'skeletonPulse 1.4s ease-in-out infinite',
  }} />
);

// ── CalendarGrid ──────────────────────────────────────────────────────
const CalendarGrid = ({
  entries = [],
  weekStart,
  loading = false,
  isManager = false,
  onEntryClick,
}) => {
  const gridRef = useRef(null);
  const weekDays = weekStart ? buildWeekDays(weekStart) : [];

  // Time labels — only show on-the-hour
  const timeLabels = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const totalMins = GRID_START_HOUR * 60 + i * 30;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (m !== 0) return null;
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12} ${ampm}`;
  });

  // Pre-compute all entry positions
  const positionedEntries = loading ? [] : layoutEntries(entries, weekDays);

  return (
    <>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      {/* Outer wrapper — needed so the grid can be position:relative for card overlays */}
      <div
        ref={gridRef}
        role="grid"
        aria-label="Weekly schedule"
        style={{
          display: 'grid',
          gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
          gridTemplateRows: `auto repeat(${TOTAL_SLOTS}, ${ROW_HEIGHT_PX}px)`,
          border: '3px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0px 0px var(--shadow-color)',
          background: 'var(--card-bg)',
          position: 'relative',   // ← cards are positioned relative to this
        }}
      >

        {/* ── Row 1: Day Header Band ── */}
        {/* TIME cell */}
        <div style={{
          gridColumn: 1, gridRow: 1,
          background: '#F5C518',
          borderRight: '3px solid var(--border-color)',
          borderBottom: '3px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '0.72rem',
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1C1917',
          padding: '0.65rem 0.5rem',
        }}>
          TIME
        </div>

        {/* Day header cells */}
        {DAY_LABELS.map((label, i) => {
          const dayDate = weekDays[i];
          const today   = dayDate ? isToday(dayDate) : false;
          return (
            <div key={label} style={{
              gridColumn: i + 2, gridRow: 1,
              background: '#F5C518',
              borderRight: i < 6 ? '2px solid rgba(28,25,23,0.2)' : 'none',
              borderBottom: '3px solid var(--border-color)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0.5rem 0.25rem', gap: '0.1rem',
            }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontWeight: 800,
                fontSize: '0.72rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#1C1917',
              }}>
                {label}
              </span>
              {dayDate && (
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: today ? 800 : 600,
                  fontSize: '0.7rem',
                  color: today ? '#F5C518' : 'rgba(28,25,23,0.65)',
                  background: today ? '#1C1917' : 'transparent',
                  borderRadius: today ? '50%' : '0',
                  width: today ? '20px' : 'auto',
                  height: today ? '20px' : 'auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {dayDate.getDate()}
                </span>
              )}
            </div>
          );
        })}

        {/* ── Rows 2…N+1: Time slot background cells ── */}
        {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
          const isHour = slotIdx % 2 === 0;
          const row    = slotIdx + 2; // row 2 = first slot
          const label  = timeLabels[slotIdx];

          return (
            <React.Fragment key={slotIdx}>
              {/* Gutter cell */}
              <div style={{
                gridColumn: 1, gridRow: row,
                borderRight: '3px solid var(--border-color)',
                borderBottom: isHour ? '1px solid var(--border-color)' : '1px dashed rgba(100,116,139,0.2)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                paddingTop: '0.2rem',
                background: 'var(--bg-secondary)',
              }}>
                {label && (
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                    fontWeight: 700, color: 'var(--text-muted)',
                    letterSpacing: '0.04em', whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                )}
              </div>

              {/* 7 day cells */}
              {DAY_ORDER.map((_, colIdx) => (
                <div key={colIdx} style={{
                  gridColumn: colIdx + 2, gridRow: row,
                  borderRight: colIdx < 6 ? '1px solid rgba(100,116,139,0.15)' : 'none',
                  borderBottom: isHour ? '1px solid var(--border-color)' : '1px dashed rgba(100,116,139,0.2)',
                  background: 'transparent',
                }} />
              ))}
            </React.Fragment>
          );
        })}

        {/* ── Entry Cards — placed directly in the CSS grid ── */}
        {positionedEntries.map(({ entry, colIdx, rowStart, rowSpan, widthPct, leftPct }, i) => (
          <div
            key={`${entry._id}-${i}`}
            style={{
              gridColumn: colIdx + 2,  // +1 for 1-based, +1 for gutter
              gridRow: `${rowStart} / span ${rowSpan}`,
              padding: '2px 3px',
              zIndex: 3,
              // For overlapping entries, shrink width and offset left
              width: widthPct < 100 ? `${widthPct}%` : '100%',
              marginLeft: leftPct > 0 ? `${leftPct}%` : '0',
              // Ensure the card fills the grid cell height
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <EntryCard
              entry={entry}
              isManager={isManager}
              onClick={onEntryClick}
            />
          </div>
        ))}

        {/* ── Loading Skeleton ── */}
        {loading && [
          { col: 2, row: 3, span: 3 },
          { col: 4, row: 5, span: 2 },
          { col: 6, row: 4, span: 4 },
          { col: 3, row: 9, span: 2 },
          { col: 7, row: 7, span: 3 },
        ].map((s, i) => (
          <div key={i} style={{
            gridColumn: s.col, gridRow: `${s.row} / span ${s.span}`,
            padding: '3px', zIndex: 2,
          }}>
            <SkeletonCard style={{ width: '100%', height: '100%' }} />
          </div>
        ))}

      </div>
    </>
  );
};

export default CalendarGrid;
