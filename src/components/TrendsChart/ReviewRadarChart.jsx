import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import useFetchData from '../../hooks/useFetchData';

const RADAR_COLOR = '#a855f7';

const TooltipBox = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload || {};
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.5rem 0.9rem',
      boxShadow: '4px 4px 0 var(--shadow-color)',
      fontSize: '0.85rem',
    }}>
      <p style={{ margin: 0, fontWeight: 800 }}>{point.metric}</p>
      <p style={{ margin: '0.2rem 0 0', color: RADAR_COLOR }}>
        Avg: <strong>{Number(payload[0]?.value ?? 0).toFixed(1)}</strong>
        <span style={{ color: 'var(--text-muted)' }}> / {point.max ?? 5}</span>
      </p>
    </div>
  );
};

/**
 * Fetches the Session-Review radar endpoint and plots one average per metric
 * (Behavior, Understanding, Participation, Coding) on a single 0-max spider.
 *
 * Backend: GET /api/v1/progress/<me|child/:profileId>/reviews/radar
 *   → { reviewCount, avgOverall, axes: [{ metric, value, max }] }
 *
 * Props:
 *   endpoint     — full radar URL
 *   title        — panel heading
 *   icon         — Font Awesome class (optional)
 *   emptyMessage — shown when the student has no reviews
 *   height       — chart height in px (default 260)
 */
const ReviewRadarChart = ({
  endpoint,
  title = 'Review Breakdown',
  icon = 'fa-solid fa-star',
  emptyMessage = 'No session reviews yet to chart.',
  height = 260,
}) => {
  const { data, loading, error } = useFetchData(endpoint || null);

  const axes = Array.isArray(data?.axes) ? data.axes : [];
  const reviewCount = data?.reviewCount ?? 0;
  const avgOverall = data?.avgOverall ?? 0;
  // All axes share the same bound (schema max); fall back to 5.
  const max = axes[0]?.max ?? 5;
  const hasData = axes.length > 0 && reviewCount > 0;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
          {icon && <i className={icon} style={{ marginRight: '0.5rem', color: 'var(--brand-primary)' }} />}
          {title}
        </h3>
        {loading ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Loading…
          </span>
        ) : hasData && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {avgOverall.toFixed(1)} ⭐ avg · {reviewCount} review{reviewCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', margin: 0 }}>
          Could not load review radar: {error}
        </p>
      )}

      {!error && !loading && !hasData && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{emptyMessage}</p>
      )}

      {hasData && (
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={axes} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, max]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
            <Radar
              name="Avg"
              dataKey="value"
              stroke={RADAR_COLOR}
              fill={RADAR_COLOR}
              fillOpacity={0.25}
              strokeWidth={2}
              dot={{ r: 4, fill: RADAR_COLOR }}
            />
            <Tooltip content={<TooltipBox />} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ReviewRadarChart;
