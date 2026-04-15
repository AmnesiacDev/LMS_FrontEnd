import React from 'react';
import useFetchData from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import './DashboardOverview.css';

const AdminOverview = () => {
  const { user } = useAuth();
  const adminName = user?.FullName?.split(' ')[0] || 'Admin';

  // Admin-only endpoints
  const { data: usersData, loading: usersLoading } = useFetchData('/api/v1/user');
  const { data: profilesData, loading: profilesLoading } = useFetchData('/api/v1/StudentProfile/all');
  const { data: sessionsData, loading: sessionsLoading } = useFetchData('/api/v1/session');
  const { data: tasksData, loading: tasksLoading } = useFetchData('/api/v1/task');

  // Normalize arrays
  const users = Array.isArray(usersData) ? usersData : (usersData?.docs || usersData?.users || []);
  const profiles = Array.isArray(profilesData) ? profilesData : (profilesData?.docs || profilesData?.profiles || []);
  const sessions = Array.isArray(sessionsData) ? sessionsData : (sessionsData?.docs || sessionsData?.sessions || []);
  const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.docs || tasksData?.tasks || []);

  const students = users.filter(u => u.role === 'student');
  const instructors = users.filter(u => u.role === 'instructor');
  const parents = users.filter(u => u.role === 'parent');

  return (
    <div className="overview-container">
      <h1 className="page-title">Admin Panel — Welcome, {adminName}! 🛡️</h1>
      <p className="page-subtitle">System-wide overview of all users, sessions, and tasks.</p>

      {/* Big Stats */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>👥</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>🎓</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : students.length}</h3>
            <p>Students</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>👨‍🏫</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : instructors.length}</h3>
            <p>Instructors</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>👪</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : parents.length}</h3>
            <p>Parents</p>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="stats-grid" style={{ marginTop: '1rem' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>📋</div>
          <div className="stat-info">
            <h3>{profilesLoading ? '...' : profiles.length}</h3>
            <p>Student Profiles</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>📅</div>
          <div className="stat-info">
            <h3>{sessionsLoading ? '...' : sessions.length}</h3>
            <p>Total Sessions</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>📝</div>
          <div className="stat-info">
            <h3>{tasksLoading ? '...' : tasks.length}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main-row">
        {/* Users Table */}
        <div className="courses-section glass-panel">
          <div className="section-header">
            <h2>Recent Users</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr><td colSpan="4" style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '1rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
                ) : users.slice(0, 8).map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{u.FullName}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.Email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' :
                                    u.role === 'instructor' ? 'rgba(59, 130, 246, 0.1)' :
                                    u.role === 'parent' ? 'rgba(245, 158, 11, 0.1)' :
                                    'var(--brand-light)',
                        color: u.role === 'admin' ? 'var(--error)' :
                               u.role === 'instructor' ? 'var(--info)' :
                               u.role === 'parent' ? 'var(--warning)' :
                               'var(--brand-primary)',
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: u.isActive ? 'var(--success)' : 'var(--error)', fontWeight: '600' }}>
                        {u.isActive !== false ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="tasks-section glass-panel">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <ul className="task-list">
            <li className="task-item" style={{ cursor: 'pointer', borderLeftColor: 'var(--brand-primary)' }}>
              <div className="task-meta">
                <h4>Create New User</h4>
                <p>Add student, instructor, or parent</p>
              </div>
              <div className="task-status" style={{ color: 'var(--brand-primary)' }}>→</div>
            </li>
            <li className="task-item" style={{ cursor: 'pointer', borderLeftColor: 'var(--info)' }}>
              <div className="task-meta">
                <h4>Create New Session</h4>
                <p>Schedule a new teaching session</p>
              </div>
              <div className="task-status" style={{ color: 'var(--info)' }}>→</div>
            </li>
            <li className="task-item" style={{ cursor: 'pointer', borderLeftColor: 'var(--warning)' }}>
              <div className="task-meta">
                <h4>Manage Student Profiles</h4>
                <p>View and edit student records</p>
              </div>
              <div className="task-status" style={{ color: 'var(--warning)' }}>→</div>
            </li>
            <li className="task-item" style={{ cursor: 'pointer', borderLeftColor: 'var(--success)' }}>
              <div className="task-meta">
                <h4>View All Submissions</h4>
                <p>Review pending homework & tasks</p>
              </div>
              <div className="task-status" style={{ color: 'var(--success)' }}>→</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
