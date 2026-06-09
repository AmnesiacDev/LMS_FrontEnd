import React from 'react';
import './Skeleton.css';

/**
 * Reusable skeleton primitives.
 *
 * Examples:
 *   <Skeleton width="60%" height="1rem" />
 *   <Skeleton circle size={48} />
 *   <SkeletonText lines={3} />
 *   <SkeletonStatCard />
 *   <SkeletonRow cols={5} />
 *   <SkeletonCard />
 */

export const Skeleton = ({ width, height, circle, size, style, className = '' }) => {
  const finalStyle = {
    width: circle ? size : (width || '100%'),
    height: circle ? size : (height || '1rem'),
    borderRadius: circle ? '50%' : '6px',
    ...style,
  };
  return <span className={`sk-shimmer ${className}`} style={finalStyle} aria-hidden="true" />;
};

export const SkeletonText = ({ lines = 3, lastWidth = '70%' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="0.85rem"
        width={i === lines - 1 ? lastWidth : '100%'}
      />
    ))}
  </div>
);

/** Mimics the .stat-card layout used across overview pages */
export const SkeletonStatCard = () => (
  <div className="stat-card" aria-hidden="true">
    <Skeleton circle size={52} style={{ borderRadius: '6px', flexShrink: 0 }} />
    <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <Skeleton width="50%" height="1.5rem" />
      <Skeleton width="80%" height="0.7rem" />
    </div>
  </div>
);

/** Used in card-grid layouts (tasks, sessions, submissions) */
export const SkeletonCard = ({ height = 180 }) => (
  <div
    className="glass-panel"
    style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      minHeight: height,
    }}
    aria-hidden="true"
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Skeleton width="60%" height="1.1rem" />
      <Skeleton width="60px" height="1.5rem" />
    </div>
    <SkeletonText lines={2} />
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
      <Skeleton width="80px" height="1.8rem" />
      <Skeleton width="80px" height="1.8rem" />
    </div>
  </div>
);

/** A row in a table-like list (Recent Users, Submissions etc.) */
export const SkeletonRow = ({ cols = 4 }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      padding: '0.75rem 1rem',
      background: 'var(--bg-tertiary)',
      border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '2px 2px 0 var(--shadow-color)',
    }}
    aria-hidden="true"
  >
    <Skeleton circle size={38} style={{ borderRadius: '6px', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <Skeleton width="40%" height="0.9rem" />
      <Skeleton width="60%" height="0.7rem" />
    </div>
    {cols > 2 && <Skeleton width="60px" height="1.4rem" />}
    {cols > 3 && <Skeleton width="50px" height="1.4rem" />}
  </div>
);

/** Grid of skeleton stat cards — drop-in replacement for the stats-grid section */
export const SkeletonStatsGrid = ({ count = 4 }) => (
  <div className="stats-grid">
    {Array.from({ length: count }).map((_, i) => <SkeletonStatCard key={i} />)}
  </div>
);

/** Grid of skeleton cards */
export const SkeletonCardGrid = ({ count = 6, minWidth = 320, gap = '1rem' }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
    gap,
  }}>
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

/** Vertical stack of skeleton cards — for full-width list layouts (sessions, course panels) */
export const SkeletonCardList = ({ count = 4, height = 140, gap = '1rem' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} height={height} />)}
  </div>
);

/**
 * Skeleton rows for an HTML <table>. Render inside <tbody> while loading so the
 * table header and column widths stay put.
 */
export const SkeletonTableRows = ({ rows = 8, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} aria-hidden="true">
        {Array.from({ length: cols }).map((_, c) => (
          <td key={c} style={{ padding: '0.8rem 1rem' }}>
            <Skeleton height="0.9rem" width={c === 0 ? '70%' : `${50 + ((r + c) % 4) * 10}%`} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default Skeleton;
