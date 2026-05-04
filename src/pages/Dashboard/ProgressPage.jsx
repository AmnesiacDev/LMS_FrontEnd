import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import './DashboardOverview.css';

const ProgressPage = () => {
  const { user } = useAuth();
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [period, setPeriod] = useState('monthly');
  const isAdmin = user?.role === 'admin' || user?.role === 'instructor';

  // Determine which endpoint to call
  let endpoint = '';
  if (profileId) {
    endpoint = `/api/v1/progress/child/${profileId}?period=${period}`;
  } else if (user?.role === 'parent') {
    endpoint = `/api/v1/progress/compare-children`;
  } else if (user?.role === 'student') {
    endpoint = `/api/v1/progress/me?period=${period}`;
  }

  const { data, loading, error } = useFetchData(endpoint || null);

  // For admin/instructor: fetch student profiles to display a picker
  const { data: profilesData, loading: profilesLoading } = useFetchData(isAdmin && !profileId ? '/api/v1/StudentProfile/all' : null);
  const profiles = Array.isArray(profilesData) ? profilesData : (profilesData?.docs || profilesData?.profiles || []);

  // Helper to format trend
  const formatTrend = (trend, delta) => {
    if (trend === 'improving') return <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>↑ +{delta}</span>;
    if (trend === 'declining') return <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>↓ {delta}</span>;
    return <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>→ Stable</span>;
  };

  // Admin/Instructor without a profileId selected: show student picker
  if (isAdmin && !profileId) {
    return (
      <div className="overview-container" style={{ padding: '2rem 0' }}>
        <h2 className="page-title">Progress Reports</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Select a student to view their progress report.</p>
        
        {profilesLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading student profiles...</p>
        ) : profiles.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No student profiles found.</p>
          </div>
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
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px var(--shadow-color)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--shadow-color)'; }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--info))', color: '#fff',
                  }}>
                    {initials}
                  </div>
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

  // --- PARENT COMPARISON VIEW ---
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 600 }}>Review Avg</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>{c.latestStats?.reviewAvgOverall?.toFixed(1) || 'N/A'} ⭐</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 600 }}>Task Completion</span>
                    <span>{c.latestStats?.taskCompletionRate || 0}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 600 }}>Attendance Rate</span>
                    <span>{c.latestStats?.attendanceRate || 0}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 600 }}>Exam Avg</span>
                    <span>{c.latestStats?.examAvgPercentage || 0}%</span>
                  </div>
                </div>
                
                <button 
                  className="nb-btn nb-btn-secondary" 
                  style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                  onClick={() => navigate(`/dashboard/progress/${c.child?.profileId}`)}
                >
                  View Full Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- SINGLE STUDENT / "ME" VIEW ---
  const snapshot = data?.snapshot || data?.data?.snapshot;
  
  return (
    <div className="overview-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{profileId ? 'Student Progress' : 'My Progress'}</h1>
          <p className="page-subtitle">Performance snapshot and trends</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
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
          <h2 className="section-header" style={{ marginTop: '1.5rem', borderBottom: 'none' }}>
            Current Period: {snapshot.currentPeriod ? `${snapshot.currentPeriod.year}-${String(snapshot.currentPeriod.month || snapshot.currentPeriod.week).padStart(2, '0')}` : 'N/A'}
          </h2>
          
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            {/* Reviews Stat */}
            <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--accent-yellow)' }}>
              <div className="stat-info">
                <p>Average Review</p>
                <h3>{snapshot.reviews?.avgOverall?.toFixed(1) || '0.0'} ⭐</h3>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {formatTrend(snapshot.reviews?.trend, snapshot.reviews?.delta?.toFixed(1))}
                </div>
              </div>
            </div>

            {/* Tasks Stat */}
            <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--accent-orange)' }}>
              <div className="stat-info">
                <p>Task Completion</p>
                <h3>{snapshot.tasks?.completionRate || 0}%</h3>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {formatTrend(snapshot.tasks?.trend, snapshot.tasks?.delta)}
                </div>
              </div>
            </div>

            {/* Attendance Stat */}
            <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--info)' }}>
              <div className="stat-info">
                <p>Attendance Rate</p>
                <h3>{snapshot.attendance?.attendanceRate || 0}%</h3>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {formatTrend(snapshot.attendance?.trend, snapshot.attendance?.delta)}
                </div>
              </div>
            </div>

            {/* Exams Stat */}
            <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--success)' }}>
              <div className="stat-info">
                <p>Exam Average</p>
                <h3>{snapshot.exams?.avgPercentage || 0}%</h3>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {formatTrend(snapshot.exams?.trend, snapshot.exams?.delta)}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-heading)' }}>Submissions Performance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Score</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{snapshot.submissions?.avgScore?.toFixed(1) || '0.0'} / 10</div>
                <div style={{ fontSize: '0.8rem' }}>{formatTrend(snapshot.submissions?.trend, snapshot.submissions?.scoreDelta?.toFixed(1))}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>On-Time Rate</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{snapshot.submissions?.onTimeRate || 0}%</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressPage;
