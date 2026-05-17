import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import useFetchData from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import './DashboardOverview.css';

/* ─── colour tokens (match CSS vars as hex for Recharts) ─── */
const C = {
  yellow:  '#f5a623',
  orange:  '#f76b1c',
  blue:    '#3b82f6',
  green:   '#22c55e',
  purple:  '#a855f7',
  red:     '#ef4444',
  muted:   '#6b7280',
  bg:      'var(--bg-tertiary)',
  border:  'var(--border-color)',
};

/* ─── Custom Tooltip for bar chart ─── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)', border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem',
      boxShadow: '4px 4px 0 var(--shadow-color)', fontSize: '0.85rem',
    }}>
      <p style={{ margin: '0 0 0.4rem', fontWeight: 700 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '0.15rem 0', color: p.fill }}>
          {p.name}: <strong>{p.value}{p.name !== 'Avg Review' ? '%' : ' ⭐'}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─── Custom Tooltip for radar chart ─── */
const CustomRadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)', border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.9rem',
      boxShadow: '4px 4px 0 var(--shadow-color)', fontSize: '0.85rem',
    }}>
      <p style={{ margin: 0, fontWeight: 700 }}>{payload[0]?.payload?.metric}</p>
      <p style={{ margin: '0.2rem 0 0', color: C.purple }}>Score: <strong>{payload[0]?.value?.toFixed(1)}</strong></p>
    </div>
  );
};

/* ─── Trend badge ─── */
const Trend = ({ trend, delta }) => {
  if (trend === 'improving') return <span style={{ color: C.green, fontWeight: 700, fontSize: '0.8rem' }}>↑ +{delta}</span>;
  if (trend === 'declining') return <span style={{ color: C.red, fontWeight: 700, fontSize: '0.8rem' }}>↓ {delta}</span>;
  return <span style={{ color: C.muted, fontWeight: 700, fontSize: '0.8rem' }}>→ Stable</span>;
};

/* ─── Single metric card with a tiny bar ─── */
const MetricCard = ({ label, value, unit = '', max = 100, color, trend, delta, icon }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', borderTop: `4px solid ${color}` }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon} {label}
      </p>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
        {value}{unit}
      </h3>
      {/* mini progress bar */}
      <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '99px', marginBottom: '0.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
      </div>
      <Trend trend={trend} delta={delta} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const ProgressPage = () => {
  const { user } = useAuth();
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('monthly');

  const isAdmin = user?.role === 'admin' || user?.role === 'instructor';

  let endpoint = '';
  if (profileId) {
    endpoint = `/api/v1/progress/child/${profileId}?period=${period}`;
  } else if (user?.role === 'parent') {
    endpoint = `/api/v1/progress/compare-children`;
  } else if (user?.role === 'student') {
    endpoint = `/api/v1/progress/me?period=${period}`;
  }

  const { data, loading, error } = useFetchData(endpoint || null);

  const { data: profilesData, loading: profilesLoading } = useFetchData(
    // Instructors only see their linked students; admins see all
    isAdmin && !profileId
      ? (user?.role === 'instructor' ? '/api/v1/session/me/students' : '/api/v1/StudentProfile/all')
      : null
  );
  const profiles = Array.isArray(profilesData)
    ? profilesData
    : (profilesData?.students || profilesData?.docs || profilesData?.profiles || []);

  /* ── Admin picker ── */
  if (isAdmin && !profileId) {
    return (
      <div className="overview-container" style={{ padding: '2rem 0' }}>
        <h2 className="page-title">Progress Reports</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Select a student to view their progress report.</p>
        {profilesLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading student profiles...</p>
        ) : profiles.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}><p>No student profiles found.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {profiles.map(p => {
              const name = p.user?.FullName || 'Student';
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/dashboard/progress/${p._id}`)}
                  style={{
                    padding: '1.25rem', background: 'var(--card-bg)', border: '3px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)', boxShadow: '4px 4px 0px 0px var(--shadow-color)',
                    cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '1rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px var(--shadow-color)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--shadow-color)'; }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--info))', color: '#fff',
                  }}>{initials}</div>
                  <div>
                    <h3 style={{ margin: '0 0 0.2rem', fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>{name}</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Grade: {p.grade || 'N/A'}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>📈</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="overview-container" style={{ padding: '2rem' }}>
        <h2 className="page-title">Progress Reports</h2>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Please select a student profile from the Profiles page to view their progress.</p>
          <button className="nb-btn nb-btn-primary" onClick={() => navigate('/dashboard/profiles')} style={{ marginTop: '1rem' }}>
            Go to Student Profiles
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading progress data...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--error)' }}>Error: {error}</div>;

  /* ── Parent comparison view ── */
  if (user?.role === 'parent' && !profileId) {
    const children = Array.isArray(data) ? data : (data?.data || []);
    return (
      <div className="overview-container">
        <h1 className="page-title">Children Progress Comparison</h1>
        <p className="page-subtitle">Compare performance metrics across your children</p>
        {children.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem' }}><p>No children linked to your account.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {children.map((c, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>{c.child?.fullName}</h3>
                <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.child?.grade}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Review Avg', val: `${c.latestStats?.reviewAvgOverall?.toFixed(1) || 'N/A'} ⭐` },
                    { label: 'Task Completion', val: `${c.latestStats?.taskCompletionRate || 0}%` },
                    { label: 'Attendance Rate', val: `${c.latestStats?.attendanceRate || 0}%` },
                    { label: 'Exam Avg', val: `${c.latestStats?.examAvgPercentage || 0}%` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontWeight: 600 }}>{row.label}</span>
                      <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>{row.val}</span>
                    </div>
                  ))}
                </div>
                <button className="nb-btn nb-btn-secondary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                  onClick={() => navigate(`/dashboard/progress/${c.child?.profileId}`)}>
                  View Full Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     SINGLE STUDENT VIEW — charts
  ══════════════════════════════════════════════════════════════ */
  const snapshot = data?.snapshot || data?.data?.snapshot;

  /* Build chart datasets */
  const reviewScore  = snapshot?.reviews?.avgOverall ?? 0;
  const taskRate     = snapshot?.tasks?.completionRate ?? 0;
  const attendRate   = snapshot?.attendance?.attendanceRate ?? 0;
  const examAvg      = snapshot?.exams?.avgPercentage ?? 0;
  const subScore     = snapshot?.submissions?.avgScore ?? 0;
  const subOnTime    = snapshot?.submissions?.onTimeRate ?? 0;

  /* Grouped bar chart — all metrics side by side */
  const barData = [
    { name: 'Reviews',    value: parseFloat((reviewScore * 20).toFixed(1)), color: C.yellow },
    { name: 'Tasks',      value: taskRate,   color: C.orange },
    { name: 'Attendance', value: attendRate, color: C.blue   },
    { name: 'Exams',      value: examAvg,    color: C.green  },
    { name: 'Sub Score',  value: parseFloat((subScore * 10).toFixed(1)), color: C.purple },
    { name: 'On-Time',    value: subOnTime,  color: C.red    },
  ];

  /* Radar chart — normalise everything to 0-100 */
  const radarData = [
    { metric: 'Reviews',    score: parseFloat((reviewScore * 20).toFixed(1)) },
    { metric: 'Tasks',      score: taskRate   },
    { metric: 'Attendance', score: attendRate },
    { metric: 'Exams',      score: examAvg    },
    { metric: 'Sub Score',  score: parseFloat((subScore * 10).toFixed(1)) },
    { metric: 'On-Time',    score: subOnTime  },
  ];

  const periodLabel = snapshot?.currentPeriod
    ? `${snapshot.currentPeriod.year}-${String(snapshot.currentPeriod.month || snapshot.currentPeriod.week).padStart(2, '0')}`
    : 'N/A';

  return (
    <div className="overview-container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{profileId ? 'Student Progress' : 'My Progress'}</h1>
          <p className="page-subtitle">Performance snapshot and trends</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {!snapshot || (!snapshot.reviews && !snapshot.tasks && !snapshot.attendance && !snapshot.exams) ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
          <p>No progress data available yet.</p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 1.5rem', fontWeight: 600 }}>
            📅 Current Period: {periodLabel}
          </p>

          {/* ── Metric cards ── */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <MetricCard label="Average Review" value={reviewScore.toFixed(1)} unit=" ⭐" max={5} color={C.yellow}
              trend={snapshot.reviews?.trend} delta={snapshot.reviews?.delta?.toFixed(1)} icon="⭐" />
            <MetricCard label="Task Completion" value={taskRate} unit="%" color={C.orange}
              trend={snapshot.tasks?.trend} delta={snapshot.tasks?.delta} icon="✅" />
            <MetricCard label="Attendance Rate" value={attendRate} unit="%" color={C.blue}
              trend={snapshot.attendance?.trend} delta={snapshot.attendance?.delta} icon="📅" />
            <MetricCard label="Exam Average" value={examAvg} unit="%" color={C.green}
              trend={snapshot.exams?.trend} delta={snapshot.exams?.delta} icon="📝" />
          </div>

          {/* ── Charts row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

            {/* Bar chart */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                📊 Metrics Overview
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                * Reviews &amp; Sub Score normalised to 0–100
              </p>
            </div>

            {/* Radar chart */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                🕸️ Performance Radar
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                  <Radar name="Score" dataKey="score" stroke={C.purple} fill={C.purple} fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: C.purple }} />
                  <Tooltip content={<CustomRadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Submissions panel ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>📋 Submissions Performance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Score</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>
                  {subScore.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 10</span>
                </div>
                {/* mini bar */}
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                  <div style={{ height: '100%', width: `${subScore * 10}%`, background: C.purple, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <Trend trend={snapshot.submissions?.trend} delta={snapshot.submissions?.scoreDelta?.toFixed(1)} />
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>On-Time Rate</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>{subOnTime}%</div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                  <div style={{ height: '100%', width: `${subOnTime}%`, background: C.red, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressPage;
