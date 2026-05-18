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
  sm: { mark: 28, font: '1.1rem', gap: '0.45rem', iconSize: '0.75rem' },
  md: { mark: 36, font: '1.35rem', gap: '0.55rem', iconSize: '0.85rem' },
  lg: { mark: 48, font: '1.8rem',  gap: '0.7rem',  iconSize: '1.1rem'  },
};

const Logo = ({ size = 'md', variant = 'full', onClick, style = {} }) => {
  const s = SIZES[size] || SIZES.md;

  const mark = (
    <div style={{
      width:  s.mark,
      height: s.mark,
      flexShrink: 0,
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      border: '2px solid var(--border-color)',
      boxShadow: '3px 3px 0 var(--shadow-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Code brackets icon */}
      <i
        className="fa-solid fa-code"
        style={{
          color: '#fff',
          fontSize: s.iconSize,
          position: 'relative',
          zIndex: 1,
        }}
      />
      {/* subtle shine */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '50%', height: '50%',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '0 0 100% 0',
      }} />
    </div>
  );

  const wordmark = (
    <span style={{
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 800,
      fontSize: s.font,
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}>
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
