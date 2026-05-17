import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell/NotificationBell';
import Pet from '../Pet/Pet';
import './DashboardLayout.css';

const navConfig = {
  student: [
    { to: '/dashboard', icon: 'O', label: 'Overview', end: true },
    { to: '/dashboard/sessions', icon: 'S', label: 'My Sessions' },
    { to: '/dashboard/tasks', icon: 'T', label: 'My Tasks' },
    { to: '/dashboard/submissions', icon: 'U', label: 'Submissions' },
    { to: '/dashboard/external', icon: 'E', label: 'External Courses' },
    { to: '/dashboard/announcements', icon: 'A', label: 'Announcements' },
    { to: '/dashboard/messages', icon: 'M', label: 'Messages' },
    { to: '/dashboard/progress', icon: 'P', label: 'My Progress' },
  ],
  parent: [
    { to: '/dashboard', icon: 'C', label: 'Children', end: true },
    { to: '/dashboard/sessions', icon: 'S', label: 'Sessions' },
    { to: '/dashboard/tasks', icon: 'T', label: 'Tasks' },
    { to: '/dashboard/submissions', icon: 'U', label: 'Submissions' },
    { to: '/dashboard/external', icon: 'E', label: 'External Courses' },
    { to: '/dashboard/announcements', icon: 'A', label: 'Announcements' },
    { to: '/dashboard/messages', icon: 'M', label: 'Messages' },
    { to: '/dashboard/progress', icon: 'P', label: 'Children Progress' },
  ],
  instructor: [
    { to: '/dashboard', icon: 'O', label: 'Overview', end: true },
    { to: '/dashboard/sessions', icon: 'S', label: 'Sessions' },
    { to: '/dashboard/tasks', icon: 'T', label: 'Tasks' },
    { to: '/dashboard/submissions', icon: 'U', label: 'Submissions' },
    { to: '/dashboard/reviews', icon: 'R', label: 'Reviews' },
    { to: '/dashboard/announcements', icon: 'A', label: 'Announcements' },
    { to: '/dashboard/messages', icon: 'M', label: 'Messages' },
    { to: '/dashboard/progress', icon: 'P', label: 'Progress Reports' },
  ],
  admin: [
    { to: '/dashboard', icon: 'O', label: 'Overview', end: true },
    { to: '/dashboard/users', icon: 'U', label: 'Users' },
    { to: '/dashboard/profiles', icon: 'P', label: 'Student Profiles' },
    { to: '/dashboard/sessions', icon: 'S', label: 'Sessions' },
    { to: '/dashboard/tasks', icon: 'T', label: 'Tasks' },
    { to: '/dashboard/submissions', icon: 'B', label: 'Submissions' },
    { to: '/dashboard/reviews', icon: 'R', label: 'Reviews' },
    { to: '/dashboard/external', icon: 'E', label: 'External Courses' },
    { to: '/dashboard/announcements', icon: 'A', label: 'Announcements' },
    { to: '/dashboard/audit-logs', icon: 'L', label: 'Audit Logs' },
    { to: '/dashboard/messages', icon: 'M', label: 'Messages' },
    { to: '/dashboard/progress', icon: 'G', label: 'Progress Reports' },
  ],
};

const roleLabels = {
  student: 'Student Portal',
  parent: 'Parent Portal',
  instructor: 'Instructor Portal',
  admin: 'Admin Panel',
};

const DashboardLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || 'student';
  const navItems = navConfig[role] || navConfig.student;
  const portalLabel = roleLabels[role] || 'Portal';
  const userName = user?.FullName || user?.UserName || 'User';

  /* Stable DiceBear avatar */
  const avatarSeed = user?._id || user?.UserName || userName;
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear&radius=50`;

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-wrapper">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop visible"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar glass-panel ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="brand-logo" onClick={() => navigate('/dashboard')} aria-label="Go to dashboard overview">
            <span className="brand-mark">AG</span>
            {sidebarOpen && (
              <span className="brand-word">
                Algo<span className="gradient-text">Gambit</span>
              </span>
            )}
          </button>
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
            </svg>
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-role-badge">
            <span className="role-pill">{role}</span>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end || false}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={() => { if (window.innerWidth <= 900) closeSidebar(); }}
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span className="label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="icon">X</span>
            {sidebarOpen && <span className="label">Log Out</span>}
          </button>
        </div>
      </aside>

      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="dashboard-header glass-panel">
          <div className="header-left">
            <button
              className="toggle-sidebar-btn-mobile"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <h3>{portalLabel}</h3>
          </div>

          <div className="header-right">
            <NotificationBell />
            <button className="theme-toggle-icon" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle theme">
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <button className="user-profile" onClick={() => navigate('/dashboard/account')} title="Open account profile">
              <div className="avatar" style={{ overflow: 'hidden', padding: 0 }}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%' }} />
                }
              </div>
              <span>{userName}</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>

      {/* Pixel pet — students only */}
      {role === 'student' && <Pet />}
    </div>
  );
};

export default DashboardLayout;
