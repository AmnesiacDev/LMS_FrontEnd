import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';
import './DashboardOverview.css';

const ParentOverview = () => {
  const { user } = useAuth();
  const parentName = user?.FullName?.split(' ')[0] || 'Parent';

  // Fetch children profiles
  const { data: profiles, loading, error } = useFetchData('/api/v1/StudentProfile/me');
  // Stats (aggregated for all children)
  const { data: taskStats } = useFetchData('/api/v1/task/me/stats');
  const { data: subStats } = useFetchData('/api/v1/submission/me/stats');
  const { data: reviewStats } = useFetchData('/api/v1/sessionReview/me/stats');
  // Recent tasks
  const { data: tasksRaw } = useFetchData('/api/v1/task/me');

  if (loading) return <div className="overview-container"><h2>Loading children profiles...</h2></div>;
  if (error) return <div className="overview-container"><h2 style={{color: 'var(--error)'}}>{error}</h2></div>;

  const childrenList = Array.isArray(profiles) ? profiles : (profiles?.docs || profiles?.profiles || []);

  // Normalize stats
  const ts = taskStats?.data?.stats || taskStats?.data || taskStats || {};
  const ss = subStats?.data?.stats || subStats?.data || subStats || {};
  const rs = reviewStats?.data?.stats || reviewStats?.data || reviewStats || {};

  // Recent pending tasks
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.docs || tasksRaw?.tasks || []);
  const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 5);

  // Rating bar helper
  const ratingBar = (label, value, max = 5) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '85px' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: 'linear-gradient(90deg, var(--brand-primary), var(--info))', borderRadius: '3px' }}></div>
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: '600', minWidth: '28px' }}>{typeof value === 'number' ? value.toFixed(1) : '—'}</span>
    </div>
  );

  return (
    <div className="overview-container">
      <h1 className="page-title">Welcome, {parentName}! 👨‍👧‍👦</h1>
      <p className="page-subtitle">Track your children's educational progress below.</p>

      {/* Aggregated Stats */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>👶</div>
          <div className="stat-info">
            <h3>{childrenList.length}</h3>
            <p>Children</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}>📋</div>
          <div className="stat-info">
            <h3>{ts.totalTasks ?? '—'}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>✅</div>
          <div className="stat-info">
            <h3>{ts.completionRate !== undefined ? `${Math.round(ts.completionRate)}%` : '—'}</h3>
            <p>Completion Rate</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>⭐</div>
          <div className="stat-info">
            <h3>{rs.avgOverall !== undefined ? rs.avgOverall.toFixed(1) : '—'}</h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Submission Stats */}
      <div className="stats-grid" style={{ marginTop: '1rem' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>📄</div>
          <div className="stat-info">
            <h3>{ss.totalSubmissions ?? '—'}</h3>
            <p>Submissions</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>📥</div>
          <div className="stat-info">
            <h3>{ss.reviewed ?? '—'}</h3>
            <p>Reviewed</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>⏳</div>
          <div className="stat-info">
            <h3>{ts.pendingTasks ?? '—'}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>⏰</div>
          <div className="stat-info">
            <h3>{ss.late ?? '—'}</h3>
            <p>Late Submissions</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main-row">
        {/* Children Cards */}
        <div className="courses-section glass-panel">
          <div className="section-header">
            <h2>Your Children</h2>
          </div>
          <div className="course-list">
            {childrenList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No children profiles linked yet.</p>
            ) : (
              childrenList.map(child => {
                const childDetails = child.user || {};
                const initials = (childDetails.FullName || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div key={child._id} className="course-item" style={{ alignItems: 'center' }}>
                    <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>{initials}</div>
                    <div className="course-details" style={{ flex: 1 }}>
                      <h4>{childDetails.FullName || 'Student'}</h4>
                      <p>Grade: {child.grade || 'N/A'}</p>
                    </div>
                    <Link to={`/dashboard/child/${child._id}`}
                      style={{ padding: '0.4rem 0.75rem', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      View →
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Performance + Pending Tasks */}
        <div className="tasks-section glass-panel">
          <div className="section-header">
            <h2>Performance & Tasks</h2>
          </div>
          
          {/* Performance Ratings */}
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Ratings</h4>
          {ratingBar('Behavior', rs.avgBehavior || 0)}
          {ratingBar('Understanding', rs.avgUnderstanding || 0)}
          {ratingBar('Participation', rs.avgParticipation || 0)}
          {ratingBar('Coding', rs.avgCoding || 0)}

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '1.25rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Tasks</h4>
              <ul className="task-list">
                {pendingTasks.map(t => {
                  const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
                  return (
                    <li key={t._id} className={`task-item ${isOverdue ? 'overdue' : 'pending'}`}>
                      <div className="task-meta">
                        <h4>{t.title}</h4>
                        <p>{t.sessionId?.title || 'Task'}</p>
                      </div>
                      <div className="task-status">{isOverdue ? 'Overdue' : new Date(t.dueDate).toLocaleDateString()}</div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentOverview;
