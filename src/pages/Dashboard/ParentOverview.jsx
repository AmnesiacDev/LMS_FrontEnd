import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';
import { SkeletonStatsGrid, SkeletonCardGrid } from '../../components/Skeleton/Skeleton';
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

  if (loading) return (
    <div className="overview-container">
      <h1 className="page-title">Welcome, {parentName}! <i className="fa-solid fa-people-roof" style={{ color: 'var(--brand-primary)' }} /></h1>
      <p className="page-subtitle">Loading your children's progress…</p>
      <SkeletonStatsGrid count={4} />
      <div style={{ marginTop: '1.5rem' }}>
        <SkeletonCardGrid count={3} minWidth={300} gap="1.5rem" />
      </div>
    </div>
  );
  if (error) return <div className="overview-container"><h2 style={{color: 'var(--error)', fontFamily: 'var(--font-heading)' }}>{error}</h2></div>;

  const childrenList = Array.isArray(profiles) ? profiles : (profiles?.docs || profiles?.profiles || []);

  // Normalize stats — useFetchData already strips outer { status, data } wrapper,
  // so we receive { stats: {...} } and need to grab .stats.
  const ts = taskStats?.stats || taskStats || {};
  const ss = subStats?.stats || subStats || {};
  const rs = reviewStats?.stats || reviewStats || {};

  // Recent pending tasks
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.tasks || tasksRaw?.docs || []);
  const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 5);

  // Rating bar helper — Neo-Brutalist style
  const ratingBar = (label, value, max = 5) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <span style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)', 
        minWidth: '85px', 
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>{label}</span>
      <div style={{ 
        flex: 1, 
        height: '10px', 
        background: 'var(--bg-tertiary)', 
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          height: '100%', 
          width: `${(value / max) * 100}%`, 
          background: 'var(--brand-primary)',
          borderRadius: 'var(--radius-sm)' 
        }}></div>
      </div>
      <span style={{ 
        fontSize: '0.8rem', 
        fontWeight: '700', 
        minWidth: '28px',
        fontFamily: 'var(--font-heading)'
      }}>{typeof value === 'number' ? value.toFixed(1) : '—'}</span>
    </div>
  );

  return (
    <div className="overview-container">
      <div>
        <h1 className="page-title">Welcome, {parentName}! <i className="fa-solid fa-people-roof" style={{ color: 'var(--brand-primary)' }} /></h1>
        <p className="page-subtitle">Track your children's educational progress below.</p>
      </div>

      {/* Aggregated Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-yellow)' }}><i className="fa-solid fa-children" /></div>
          <div className="stat-info">
            <h3>{childrenList.length}</h3>
            <p>Children</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-peach)' }}><i className="fa-solid fa-list-check" /></div>
          <div className="stat-info">
            <h3>{ts.totalTasks ?? '—'}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-orange)' }}><i className="fa-solid fa-chart-line" /></div>
          <div className="stat-info">
            <h3>{ts.completionRate !== undefined ? `${Math.round(ts.completionRate)}%` : '—'}</h3>
            <p>Completion Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--brand-primary)', color: '#FFFFFF' }}><i className="fa-solid fa-star" /></div>
          <div className="stat-info">
            <h3>{rs.avgOverall !== undefined ? rs.avgOverall.toFixed(1) : '—'}</h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Submission Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-rose)' }}><i className="fa-solid fa-file-lines" /></div>
          <div className="stat-info">
            <h3>{ss.totalSubmissions ?? '—'}</h3>
            <p>Submissions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-yellow)' }}><i className="fa-solid fa-inbox" /></div>
          <div className="stat-info">
            <h3>{ss.reviewed ?? '—'}</h3>
            <p>Reviewed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-orange)' }}><i className="fa-solid fa-hourglass-half" /></div>
          <div className="stat-info">
            <h3>{ts.pendingTasks ?? '—'}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--brand-primary)', color: '#FFFFFF' }}><i className="fa-solid fa-triangle-exclamation" /></div>
          <div className="stat-info">
            <h3>{ss.late ?? '—'}</h3>
            <p>Late Submissions</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main-row">
        {/* Children Cards */}
        <div className="courses-section">
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
                      style={{ 
                        padding: '0.4rem 0.75rem', 
                        background: 'var(--brand-primary)', 
                        color: 'white', 
                        border: '2px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.78rem', 
                        fontWeight: '700', 
                        whiteSpace: 'nowrap',
                        boxShadow: '2px 2px 0px 0px var(--shadow-color)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textDecoration: 'none'
                      }}>
                      View →
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Performance + Pending Tasks */}
        <div className="tasks-section">
          <div className="section-header">
            <h2>Performance & Tasks</h2>
          </div>
          
          {/* Performance Ratings */}
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', fontFamily: 'var(--font-body)' }}>Average Ratings</h4>
          {ratingBar('Behavior', rs.avgBehavior || 0)}
          {ratingBar('Understanding', rs.avgUnderstanding || 0)}
          {ratingBar('Participation', rs.avgParticipation || 0)}
          {ratingBar('Coding', rs.avgCoding || 0)}

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: '1.25rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', fontFamily: 'var(--font-body)' }}>Pending Tasks</h4>
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
