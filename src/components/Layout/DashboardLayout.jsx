import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './DashboardLayout.css';

const navConfig = {
  student: [
    { to: '/dashboard', icon: '📊', label: 'Overview', end: true },
    { to: '/dashboard/sessions', icon: '📅', label: 'My Sessions' },
    { to: '/dashboard/tasks', icon: '📝', label: 'My Tasks' },
    { to: '/dashboard/submissions', icon: '📤', label: 'Submissions' },
    { to: '/dashboard/external', icon: '📚', label: 'External Courses' },
  ],
  parent: [
    { to: '/dashboard', icon: '👪', label: 'Children', end: true },
    { to: '/dashboard/sessions', icon: '📅', label: 'Sessions' },
    { to: '/dashboard/tasks', icon: '📝', label: 'Tasks' },
    { to: '/dashboard/external', icon: '📚', label: 'External Courses' },
  ],
  instructor: [
    { to: '/dashboard', icon: '🎓', label: 'Overview', end: true },
    { to: '/dashboard/sessions', icon: '📅', label: 'Sessions' },
    { to: '/dashboard/tasks', icon: '📝', label: 'Tasks' },
    { to: '/dashboard/submissions', icon: '📩', label: 'Submissions' },
    { to: '/dashboard/reviews', icon: '⭐', label: 'Reviews' },
    { to: '/dashboard/external', icon: '📚', label: 'External Courses' },
  ],
  admin: [
    { to: '/dashboard', icon: '🛡️', label: 'Overview', end: true },
    { to: '/dashboard/users', icon: '👥', label: 'Users' },
    { to: '/dashboard/profiles', icon: '📋', label: 'Student Profiles' },
    { to: '/dashboard/sessions', icon: '📅', label: 'Sessions' },
    { to: '/dashboard/tasks', icon: '📝', label: 'Tasks' },
    { to: '/dashboard/submissions', icon: '📩', label: 'Submissions' },
    { to: '/dashboard/reviews', icon: '⭐', label: 'Reviews' },
    { to: '/dashboard/external', icon: '📚', label: 'External Courses' },
  ],
};

const roleLabels = {
  student: 'Student Portal',
  parent:  'Parent Portal',
  instructor: 'Instructor Portal',
  admin: 'Admin Panel',
};

const DashboardLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const localStorageToken = localStorage.getItem('access-token');
  
  let user = null;
  try {
    const stored = localStorage.getItem('lms-user');
    if (stored) {
      user = JSON.parse(stored);
    }
  } catch (e) {
    user = null;
  }

  const role = user?.role || 'student';
  const navItems = navConfig[role] || navConfig.student;
  const portalLabel = roleLabels[role] || 'Portal';
  const userName = user?.FullName || user?.UserName || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('access-token');
    localStorage.removeItem('lms-user');
    localStorage.removeItem('token-expiry');
    navigate('/login');
  };

  if (!localStorageToken || !user) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="dashboard-wrapper">
      <aside className={`dashboard-sidebar glass-panel ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="brand-logo">Youssef's <span className="gradient-text">LMS</span></h2>
          <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-role-badge">
            <span className="role-pill">{role}</span>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end || false}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span className="label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
             <span className="icon">🚪</span>
             {sidebarOpen && <span className="label">Log Out</span>}
          </button>
        </div>
      </aside>

      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="dashboard-header glass-panel">
           <div className="header-left">
             {!sidebarOpen && (
               <button className="toggle-sidebar-btn-mobile" onClick={() => setSidebarOpen(true)}>
                  ☰
               </button>
             )}
             <h3>{portalLabel}</h3>
           </div>
           
           <div className="header-right">
             <button className="theme-toggle-icon" onClick={toggleTheme} title="Toggle Theme">
               {theme === 'light' ? '🌙' : '☀️'}
             </button>
             <div className="user-profile">
               <div className="avatar">{initials}</div>
               <span>{userName}</span>
             </div>
           </div>
        </header>

        <div className="dashboard-content">
           <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;