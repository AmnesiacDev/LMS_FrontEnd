import React from 'react';

/**
 * Pagination — always visible when there are items.
 * Shows: total count · page-size picker · prev/next + page buttons
 */

const PAGE_SIZES = [10, 20, 50, 100];

/* ── tiny helpers ── */
const iconBtn = (disabled) => ({
  width: 34,
  height: 34,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: disabled ? 'var(--bg-tertiary)' : 'var(--card-bg)',
  border: '2px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.45 : 1,
  boxShadow: disabled ? 'none' : '2px 2px 0 var(--shadow-color)',
  transition: 'all 0.12s ease',
  fontFamily: 'var(--font-body)',
  fontSize: '0.82rem',
  fontWeight: 700,
  flexShrink: 0,
});

const pageBtn = (active) => ({
  ...iconBtn(false),
  background: active ? 'var(--brand-primary)' : 'var(--card-bg)',
  color: active ? '#fff' : 'var(--text-primary)',
  boxShadow: active ? '2px 2px 0 var(--shadow-color)' : '2px 2px 0 var(--shadow-color)',
  transform: active ? 'translate(-1px,-1px)' : 'none',
  minWidth: 34,
});

const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  limit = 20,
  onLimitChange,
  total,
}) => {
  /* Always render when there are items */
  if (!total && totalPages <= 1 && !onLimitChange) return null;

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange?.(p);
  };

  /* Build visible page numbers with ellipsis gaps */
  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(n => n >= 1 && n <= totalPages));
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) result.push('…');
      result.push(n);
    });
    return result;
  };

  const pages = buildPages();
  const from = total ? (page - 1) * limit + 1 : null;
  const to   = total ? Math.min(page * limit, total) : null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      marginTop: '1.5rem',
      padding: '0.85rem 1.25rem',
      background: 'var(--card-bg)',
      border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '3px 3px 0 var(--shadow-color)',
    }}>

      {/* ── Left: count + page-size ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {typeof total === 'number' && (
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {from && to
              ? <><strong style={{ color: 'var(--text-primary)' }}>{from}–{to}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{total}</strong></>
              : <><strong style={{ color: 'var(--text-primary)' }}>{total}</strong> {total === 1 ? 'item' : 'items'}</>
            }
          </span>
        )}

        {onLimitChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Show
            </span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Items per page"
              style={{
                padding: '0.3rem 0.6rem',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '2px 2px 0 var(--shadow-color)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / page</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── Right: page navigation ── */}
      {totalPages > 1 && (
        <nav
          role="navigation"
          aria-label="Pagination"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}
        >
          {/* First */}
          <button
            onClick={() => goTo(1)}
            disabled={page <= 1}
            aria-label="First page"
            style={iconBtn(page <= 1)}
            onMouseEnter={e => { if (page > 1) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = page > 1 ? '2px 2px 0 var(--shadow-color)' : 'none'; }}
          >
            <i className="fa-solid fa-angles-left" style={{ fontSize: '0.7rem' }} />
          </button>

          {/* Prev */}
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            style={iconBtn(page <= 1)}
            onMouseEnter={e => { if (page > 1) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = page > 1 ? '2px 2px 0 var(--shadow-color)' : 'none'; }}
          >
            <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.7rem' }} />
          </button>

          {/* Page numbers */}
          {pages.map((n, i) =>
            n === '…' ? (
              <span
                key={`gap-${i}`}
                style={{ width: 34, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', userSelect: 'none' }}
              >
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => goTo(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? 'page' : undefined}
                style={pageBtn(n === page)}
                onMouseEnter={e => { if (n !== page) { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}}
                onMouseLeave={e => { if (n !== page) { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.transform = 'none'; }}}
              >
                {n}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            style={iconBtn(page >= totalPages)}
            onMouseEnter={e => { if (page < totalPages) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = page < totalPages ? '2px 2px 0 var(--shadow-color)' : 'none'; }}
          >
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }} />
          </button>

          {/* Last */}
          <button
            onClick={() => goTo(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
            style={iconBtn(page >= totalPages)}
            onMouseEnter={e => { if (page < totalPages) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = page < totalPages ? '2px 2px 0 var(--shadow-color)' : 'none'; }}
          >
            <i className="fa-solid fa-angles-right" style={{ fontSize: '0.7rem' }} />
          </button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;
