import { useNavigate } from 'react-router-dom';
import React from 'react';
import useFetchData from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import './DashboardOverview.css';

const AdminOverview = () => {
  const navigate = useNavigate();
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

  // Role badge colors
  const roleBadge = (role) => {
    const config = {
      admin:      { bg: 'var(--brand-primary)', color: '#FFFFFF' },
      instructor: { bg: 'var(--accent-yellow)', color: 'var(--text-primary)' },
      parent:     { bg: 'var(--accent-orange)', color: 'var(--text-primary)' },
      student:    { bg: 'var(--success)', color: '#FFFFFF' },
    };
    const c = config[role] || config.student;
    return {
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.72rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      background: c.bg,
      color: c.color,
      border: '2px solid var(--border-color)',
      display: 'inline-block',
    };
  };

  return (
    <div className="overview-container">
      <div>
        <h1 className="page-title">Admin Panel — Welcome, {adminName}! 🛡️</h1>
        <p className="page-subtitle">System-wide overview of all users, sessions, and tasks.</p>
      </div>

      {/* Big Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-yellow)' }}>👥</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>🎓</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : students.length}</h3>
            <p>Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-orange)' }}>👨‍🏫</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : instructors.length}</h3>
            <p>Instructors</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--info)' }}>👪</div>
          <div className="stat-info">
            <h3>{usersLoading ? '...' : parents.length}</h3>
            <p>Parents</p>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>📋</div>
          <div className="stat-info">
            <h3>{profilesLoading ? '...' : profiles.length}</h3>
            <p>Student Profiles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--brand-primary)', color: '#FFFFFF' }}>📅</div>
          <div className="stat-info">
            <h3>{sessionsLoading ? '...' : sessions.length}</h3>
            <p>Total Sessions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-yellow)' }}>📝</div>
          <div className="stat-info">
            <h3>{tasksLoading ? '...' : tasks.length}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main-row">
        {/* Users Table */}
        <div className="courses-section">
          <div className="section-header">
            <h2>Recent Users</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-body)' }}>Name</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-body)' }}>Email</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-body)' }}>Role</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-body)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr><td colSpan="4" style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '1rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
                ) : users.slice(0, 8).map(u => {
                  const isStudent = u.role === 'student';
                  const profile = isStudent ? profiles.find(p => (p.user?._id || p.user) === u._id) : null;
                  
                  return (
                  <tr 
                    key={u._id} 
                    style={{ 
                      borderBottom: '2px solid var(--border-color)',
                      cursor: profile ? 'pointer' : 'default',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => { if(profile) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={(e) => { if(profile) e.currentTarget.style.background = 'transparent'; }}
                    onClick={() => {
                      if (profile) navigate(`/dashboard/child/${profile._id}`);
                    }}
                    title={profile ? "Click to view full student details (tasks, sessions, etc.)" : ""}
                  >
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{u.FullName}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{u.Email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={roleBadge(u.role)}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        color: u.isActive !== false ? '#FFFFFF' : 'var(--text-primary)', 
                        fontWeight: '700',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        background: u.isActive !== false ? 'var(--accent-yellow)' : 'var(--brand-primary)',
                        border: '2px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase'
                      }}>
                        {u.isActive !== false ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="tasks-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <ul className="task-list">
            <li className="task-item" onClick={() => navigate('/dashboard/users')} style={{ cursor: 'pointer', borderLeftColor: 'var(--brand-primary)' }}>
              <div className="task-meta">
                <h4>Manage Users</h4>
                <p>Add student, instructor, or parent</p>
              </div>
              <div className="task-status" style={{ background: 'var(--brand-primary)', color: '#FFFFFF' }}>→</div>
            </li>
            <li className="task-item" onClick={() => navigate('/dashboard/sessions')} style={{ cursor: 'pointer', borderLeftColor: 'var(--success)' }}>
              <div className="task-meta">
                <h4>Manage Sessions</h4>
                <p>Schedule a new teaching session</p>
              </div>
              <div className="task-status" style={{ background: 'var(--success)', color: '#FFFFFF' }}>→</div>
            </li>
            <li className="task-item" onClick={() => navigate('/dashboard/profiles')} style={{ cursor: 'pointer', borderLeftColor: 'var(--accent-orange)' }}>
              <div className="task-meta">
                <h4>Manage Student Profiles</h4>
                <p>View and edit student records</p>
              </div>
              <div className="task-status" style={{ background: 'var(--accent-orange)', color: 'var(--text-primary)' }}>→</div>
            </li>
            <li className="task-item" onClick={() => navigate('/dashboard/submissions')} style={{ cursor: 'pointer', borderLeftColor: 'var(--accent-yellow)' }}>
              <div className="task-meta">
                <h4>View All Submissions</h4>
                <p>Review pending homework & tasks</p>
              </div>
              <div className="task-status" style={{ background: 'var(--accent-yellow)', color: 'var(--text-primary)' }}>→</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
