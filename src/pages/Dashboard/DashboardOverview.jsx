import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const { user } = useAuth();
  
  // Profile
  const { data: profileData, loading: profileLoading } = useFetchData('/api/v1/StudentProfile/me');
  // Stats endpoints — useFetchData returns result.data from API
  // API returns: { status: "success", data: { stats: {...} } }
  // So useFetchData returns: { stats: {...} }
  const { data: taskStats, loading: taskStatsLoading } = useFetchData('/api/v1/task/me/stats');
  const { data: subStats } = useFetchData('/api/v1/submission/me/stats');
  const { data: reviewStats } = useFetchData('/api/v1/sessionReview/me/stats');
  // Recent data
  const { data: tasksRaw } = useFetchData('/api/v1/task/me');
  const { data: sessionsRaw } = useFetchData('/api/v1/session/me');
  // External courses
  const { data: extCoursesRaw } = useFetchData('/api/v1/external-course/my-course');
  const { data: extHwRaw } = useFetchData('/api/v1/external-hw/my');

  const studentName = user?.FullName?.split(' ')[0] || user?.name || "Student";
  
  // Normalize profile
  const profile = Array.isArray(profileData) ? profileData[0] : (profileData?.docs?.[0] || profileData);
  const grade = profile?.grade || "N/A";

  // Normalize stats — useFetchData strips the outer { status, data } wrapper
  const ts = taskStats?.stats || taskStats || {};
  const ss = subStats?.stats || subStats || {};
  const rs = reviewStats?.stats || reviewStats || {};

  // Normalize lists
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.tasks || tasksRaw?.docs || []);
  const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : (sessionsRaw?.sessions || sessionsRaw?.docs || []);
  const extCourses = Array.isArray(extCoursesRaw) ? extCoursesRaw : (extCoursesRaw?.courses || extCoursesRaw?.docs || []);
  const extHws = Array.isArray(extHwRaw) ? extHwRaw : (extHwRaw?.docs || []);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const upcomingSessions = sessions
    .filter(s => s.status === 'pending' && new Date(s.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);
  const pendingExtHws = extHws.filter(hw => hw.status === 'Pending');

  const isLoading = profileLoading || taskStatsLoading;

  // Rating bar helper
  const ratingBar = (label, value, max = 5) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '100px' }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: 'linear-gradient(90deg, var(--brand-primary), var(--info))', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: '600', minWidth: '35px', textAlign: 'right' }}>{typeof value === 'number' ? value.toFixed(1) : '—'}/{max}</span>
    </div>
  );

  return (
    <div className="overview-container">
      <h1 className="page-title">Welcome back, {isLoading ? "..." : studentName}! 👋</h1>
      <p className="page-subtitle">Here is what's happening with your learning. (Grade: {grade})</p>

      {/* ══════ STATS CARDS ══════ */}
      <div className="stats-grid">
         <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>📋</div>
            <div className="stat-info">
               <h3>{ts.totalTasks ?? '—'}</h3>
               <p>Total Tasks</p>
            </div>
         </div>
         <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>✅</div>
            <div className="stat-info">
               <h3>{ts.completedTasks ?? '—'}</h3>
               <p>Completed</p>
            </div>
         </div>
         <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>⏳</div>
            <div className="stat-info">
               <h3>{ts.pendingTasks ?? '—'}</h3>
               <p>Pending Tasks</p>
            </div>
         </div>
         <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>🏆</div>
            <div className="stat-info">
               <h3>{ts.completionRate !== undefined ? `${Math.round(ts.completionRate)}%` : '—'}</h3>
               <p>Completion Rate</p>
            </div>
         </div>
      </div>

      {/* ══════ SUBMISSION STATS ══════ */}
      <div className="stats-grid" style={{ marginTop: '1rem' }}>
         <div className="stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>📄</div>
            <div className="stat-info">
               <h3>{ss.totalSubmissions ?? '—'}</h3>
               <p>Total Submissions</p>
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
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>📤</div>
            <div className="stat-info">
               <h3>{ss.pending ?? '—'}</h3>
               <p>Awaiting Review</p>
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
        {/* ══════ SESSION REVIEW AVERAGES ══════ */}
        <div className="courses-section glass-panel">
          <div className="section-header">
            <h2>Performance Ratings</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rs.Count ?? 0} reviews</span>
          </div>
          
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-primary), var(--info))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '1.4rem',
              }}>
                {rs.avgOverall !== undefined ? rs.avgOverall.toFixed(1) : '—'}
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0 }}>Overall Average</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>out of 5.0</p>
              </div>
            </div>
            {ratingBar('Behavior', rs.avgBehavior || 0)}
            {ratingBar('Understanding', rs.avgUnderstanding || 0)}
            {ratingBar('Participation', rs.avgParticipation || 0)}
            {ratingBar('Coding', rs.avgCoding || 0)}
          </div>
        </div>

        {/* ══════ UPCOMING ══════ */}
        <div className="tasks-section glass-panel">
          <div className="section-header">
            <h2>Upcoming</h2>
          </div>
          
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions</h4>
              <ul className="task-list">
                {upcomingSessions.map(s => (
                  <li key={s._id} className="task-item upcoming">
                    <div className="task-meta">
                      <h4>{s.title}</h4>
                      <p>{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <div className="task-status">{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '1rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Tasks</h4>
              <ul className="task-list">
                {pendingTasks.slice(0, 5).map(t => {
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

          {/* Pending External HW */}
          {pendingExtHws.length > 0 && (
            <>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '1rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>External Homework</h4>
              <ul className="task-list">
                {pendingExtHws.slice(0, 4).map(hw => {
                  const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date();
                  return (
                    <li key={hw._id} className={`task-item ${isOverdue ? 'overdue' : 'pending'}`}>
                      <div className="task-meta">
                        <h4>{hw.title || 'Untitled'}</h4>
                        <p>{hw.externalCourse?.subject || 'External'}</p>
                      </div>
                      <div className="task-status">{isOverdue ? 'Overdue' : (hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : '—')}</div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {upcomingSessions.length === 0 && pendingTasks.length === 0 && pendingExtHws.length === 0 && (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>No upcoming items 🎉</p>
          )}
        </div>
      </div>

      {/* ══════ EXTERNAL COURSES QUICK VIEW ══════ */}
      {extCourses.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <h2>External Courses</h2>
            <Link to="/dashboard/external-courses" className="view-all-btn">View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {extCourses.slice(0, 6).map(c => (
              <div key={c._id} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-tertiary)', borderTop: `3px solid ${c.color || '#10b981'}`, transition: 'transform 0.2s ease' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{c.subject}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>{c.teacher || ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
