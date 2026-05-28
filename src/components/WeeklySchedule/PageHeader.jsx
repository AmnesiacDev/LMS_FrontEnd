import React from 'react';

const PageHeader = () => (
  <div style={{
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        margin: 0,
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
      }}>
        WEEKLY
      </h1>
      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        background: 'var(--brand-primary)',
        color: '#FFFFFF',
        padding: '0.05em 0.4em',
        border: '3px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '3px 3px 0px 0px var(--shadow-color)',
        lineHeight: 1.15,
      }}>
        SCHEDULE
      </span>
    </div>
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      margin: 0,
    }}>
      Full Academic Timetable View
    </p>
  </div>
);

export default PageHeader;
