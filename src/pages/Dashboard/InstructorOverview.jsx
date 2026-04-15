import React from 'react';
import useFetchData from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import './DashboardOverview.css';

const InstructorOverview = () => {
  const { user } = useAuth();
  const instructorName = user?.FullName?.split(' ')[0] || 'Instructor';

  // Instructor endpoints
  const { data: sessions, loading: sessionsLoading } = useFetchData('/api/v1/session');
  const { data: tasks, loading: tasksLoading } = useFetchData('/api/v1/task');
  const { data: submissions, loading: subsLoading } = useFetchData('/api/v1/submission');
  const { data: reviews, loading: reviewsLoading } = useFetchData('/api/v1/sessionReview');

  const sessionList = Array.isArray(sessions) ? sessions : (sessions?.docs || sessions?.sessions || []);
  const taskList = Array.isArray(tasks) ? tasks : (tasks?.docs || tasks?.tasks || []);
  const submissionList = Array.isArray(submissions) ? submissions : (submissions?.docs || submissions?.submissions || []);
  const reviewList = Array.isArray(reviews) ? reviews : (reviews?.docs || reviews?.reviews || []);

  // Derived stats
  const pendingSubs = submissionList.filter(s => s.status === 'Pending' || s.status === 'Completed');
  const upcomingSessions = sessionList.filter(s => s.status === 'pending' && new Date(s.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pendingTasks = taskList.filter(t => t.status === 'pending');
  const completedTasks = taskList.filter(t => t.status === 'completed');
  const completionRate = taskList.length > 0 ? Math.round((completedTasks.length / taskList.length) * 100) : 0;

  // Review averages
  const avgOverall = reviewList.length > 0 ? (reviewList.reduce((sum, r) => sum + (r.overAllRating || 0), 0) / reviewList.length).toFixed(1) : '—';

  return (
    <div className="overview-container">
      <h1 className="page-title">Welcome, {instructorName}! 🎓</h1>
      <p className="page-subtitle">Here's an overview of your teaching activity.</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>📅</div>
          <div className="stat-info">
            <h3>{sessionsLoading ? '...' : sessionList.length}</h3>
            <p>Total Sessions</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>📝</div>
          <div className="stat-info">
            <h3>{tasksLoading ? '...' : taskList.length}</h3>
            <p>Tasks Assigned</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>📩</div>
          <div className="stat-info">
            <h3>{subsLoading ? '...' : pendingSubs.length}</h3>
            <p>Pending Reviews</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>🏆</div>
          <div className="stat-info">
            <h3>{tasksLoading ? '...' : `${completionRate}%`}</h3>
            <p>Task Completion</p>
          </div>
        </div>
      </div>

      {/* Second Stats Row */}
      <div className="stats-grid" style={{ marginTop: '1rem' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>⭐</div>
          <div className="stat-info">
            <h3>{reviewsLoading ? '...' : avgOverall}</h3>
            <p>Avg Rating</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>✅</div>
          <div className="stat-info">
            <h3>{tasksLoading ? '...' : completedTasks.length}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>⏳</div>
          <div className="stat-info">
            <h3>{tasksLoading ? '...' : pendingTasks.length}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>📚</div>
          <div className="stat-info">
            <h3>{reviewsLoading ? '...' : reviewList.length}</h3>
            <p>Reviews Given</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main-row">
        {/* Upcoming Sessions */}
        <div className="courses-section glass-panel">
          <div className="section-header">
            <h2>Upcoming Sessions</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{upcomingSessions.length} upcoming</span>
          </div>
          <div className="course-list">
            {sessionsLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading sessions...</p> :
             upcomingSessions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No upcoming sessions.</p> :
             upcomingSessions.slice(0, 5).map(session => (
              <div key={session._id} className="course-item">
                <div className="course-img" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--info))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.8rem', borderRadius: 'var(--radius-md)' }}>
                  {new Date(session.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
                <div className="course-details">
                  <h4>{session.title}</h4>
                  <p>{session.description?.slice(0, 60) || 'No description'}</p>
                  <p style={{ fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions Needing Review */}
        <div className="tasks-section glass-panel">
          <div className="section-header">
            <h2>Submissions to Review</h2>
          </div>
          <ul className="task-list">
            {subsLoading ? <li className="task-item"><div className="task-meta"><h4>Loading...</h4></div></li> :
             pendingSubs.length === 0 ? <li className="task-item"><div className="task-meta"><h4>All caught up! ✅</h4></div></li> :
             pendingSubs.slice(0, 6).map(sub => (
              <li key={sub._id} className="task-item upcoming">
                <div className="task-meta">
                  <h4>{sub.task?.title || 'Submission'}</h4>
                  <p>Submitted: {sub.SubmissionDate ? new Date(sub.SubmissionDate).toLocaleDateString() : 'Pending'}</p>
                </div>
                <div className="task-status" style={{ color: sub.status === 'Completed' ? 'var(--success)' : 'var(--warning)' }}>{sub.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstructorOverview;
