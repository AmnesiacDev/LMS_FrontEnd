import React from 'react';

/**
 * AlgoGambit Logo
 *
 * Props:
 *   size     — 'sm' | 'md' | 'lg'  (default 'md')
 *   variant  — 'full' | 'mark'     (default 'full')
 *              'full'  = icon + wordmark
 *              'mark'  = icon only (for collapsed sidebar)
 *   onClick  — optional click handler
 *   style    — extra inline styles on the wrapper
 */
const SIZES = {
  sm: { mark: 28, font: '1.1rem', gap: '0.45rem' },
  md: { mark: 36, font: '1.35rem', gap: '0.55rem' },
  lg: { mark: 48, font: '1.8rem',  gap: '0.7rem' },
};

const Logo = ({ size = 'md', variant = 'full', onClick, style = {} }) => {
  const s = SIZES[size] || SIZES.md;

  const mark = (
    <div
      className="ag-logo-mark"
      style={{
        width: s.mark,
        height: s.mark,
        flexShrink: 0,
        borderRadius: '10px',
        background: '#ffffff',
        border: '1.5px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '3px',
      }}
    >
      <img
        src="/AG_Logo.png"
        alt="AlgoGambit Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );

  const wordmark = (
    <span
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        fontSize: s.font,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      Algo<span style={{ color: '#6366f1' }}>Gambit</span>
    </span>
  );

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {mark}
      {variant === 'full' && wordmark}
    </div>
  );
};

export default Logo;
