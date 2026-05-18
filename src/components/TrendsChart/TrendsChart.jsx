import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import useFetchData from '../../hooks/useFetchData';

const formatPeriodLabel = (period = {}) => {
  if (period.week != null) return `${period.year}-W${String(period.week).padStart(2, '0')}`;
  if (period.month != null) return `${period.year}-${String(period.month).padStart(2, '0')}`;
  return '—';
};

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.55rem 0.85rem',
      boxShadow: '4px 4px 0 var(--shadow-color)',
      fontSize: '0.82rem',
      minWidth: 140,
    }}>
      <p style={{ margin: '0 0 0.35rem', fontWeight: 800 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '0.15rem 0', color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/**
 * Reusable line-chart panel that fetches a Progress-Trends endpoint
 * and plots one or more numeric metrics over time.
 *
 * Props:
 *   endpoint     — full URL (e.g. `/api/v1/progress/me/reviews?period=monthly`)
 *   title        — panel heading
 *   icon         — Font Awesome class (optional)
 *   metrics      — [{ key, label, color, unit?, domain? }]
 *   yDomain      — [min, max] for the Y axis (defaults to auto)
 *   emptyMessage — text shown when API returns no periods
 *   height       — chart height in px (default 240)
 */
const TrendsChart = ({
  endpoint,
  title,
  icon,
  metrics,
  yDomain,
  emptyMessage = 'Not enough data yet to chart trends.',
  height = 240,
}) => {
  const { data, loading, error } = useFetchData(endpoint || null);

  const rawRows = Array.isArray(data) ? data : (data?.data || data?.docs || []);

  const rows = rawRows.map(row => {
    const out = { label: formatPeriodLabel(row.period) };
    metrics.forEach(m => {
      const v = row[m.key];
      out[m.key] = typeof v === 'number' ? v : (v == null ? null : Number(v));
    });
    return out;
  });

  const hasData = rows.length > 0 && metrics.some(m => rows.some(r => r[m.key] != null));

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700 }}>
          {icon && <i className={icon} style={{ marginRight: '0.5rem', color: 'var(--brand-primary)' }} />}
          {title}
        </h3>
        {loading && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Loading…
          </span>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', margin: 0 }}>
          Could not load trends: {error}
        </p>
      )}

      {!error && !loading && !hasData && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{emptyMessage}</p>
      )}

      {hasData && (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={rows} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={yDomain || ['auto', 'auto']}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<TooltipBox />} />
            {metrics.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: '0.78rem', fontWeight: 600 }}
                iconType="circle"
              />
            )}
            {metrics.map(m => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: m.color }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendsChart;
