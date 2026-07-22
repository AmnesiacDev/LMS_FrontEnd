import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';
import { useApiRequest } from '../../hooks/useApiRequest';
import Modal from '../../components/Modal/Modal';
import { SkeletonStatsGrid, SkeletonCardGrid } from '../../components/Skeleton/Skeleton';
import './DashboardOverview.css';

const ParentOverview = () => {
  const { user } = useAuth();
  const parentName = user?.FullName?.split(' ')[0] || 'Parent';
  const { request } = useApiRequest();

  // Fetch children profiles
  const { data: profiles, loading, error, refetch } = useFetchData('/api/v1/StudentProfile/me');
  // Stats (aggregated for all children)
  const { data: taskStats } = useFetchData('/api/v1/task/me/stats');
  const { data: subStats } = useFetchData('/api/v1/submission/me/stats');
  const { data: reviewStats } = useFetchData('/api/v1/sessionReview/me/stats');
  // Recent tasks
  const { data: tasksRaw } = useFetchData('/api/v1/task/me');

  // Modal State for Link Child
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [childIdentifier, setChildIdentifier] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const [linkSuccess, setLinkSuccess] = useState(null);

  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (!childIdentifier.trim()) return;

    setLinkLoading(true);
    setLinkError(null);
    setLinkSuccess(null);

    try {
      const res = await request('/api/v1/StudentProfile/link-child', 'POST', { childIdentifier: childIdentifier.trim() });
      setLinkSuccess(res.message || 'Child successfully linked!');
      setChildIdentifier('');
      if (refetch) refetch();
      setTimeout(() => {
        setShowLinkModal(false);
        setLinkSuccess(null);
      }, 1500);
    } catch (err) {
      setLinkError(err.message || 'Failed to link child');
    } finally {
      setLinkLoading(false);
    }
  };

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

  // Normalize stats
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Welcome, {parentName}! <i className="fa-solid fa-people-roof" style={{ color: 'var(--brand-primary)' }} /></h1>
          <p className="page-subtitle">Track your children's educational progress below.</p>
        </div>
        <button
          onClick={() => { setShowLinkModal(true); setLinkError(null); setLinkSuccess(null); }}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--brand-primary)',
            color: 'white',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px 0px var(--shadow-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
          }}
        >
          <i className="fa-solid fa-user-plus" /> + Link Child
        </button>
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
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No children profiles linked to your account yet.</p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--brand-primary)',
                    color: 'white',
                    border: '2px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Link Child by Email/Username
                </button>
              </div>
            ) : (
              childrenList.map(child => {
                const childDetails = child.user || {};
                const initials = (childDetails.FullName || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div key={child._id} className="course-item" style={{ alignItems: 'center' }}>
                    <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>{initials}</div>
                    <div className="course-details" style={{ flex: 1 }}>
                      <h4>{childDetails.FullName || 'Student'}</h4>
                      <p>Grade: {child.grade || 'N/A'} {childDetails.Email ? `• ${childDetails.Email}` : ''}</p>
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

      {/* Link Child Modal */}
      <Modal isOpen={showLinkModal} title="Link Your Child's Account" onClose={() => setShowLinkModal(false)}>
        <form onSubmit={handleLinkChild}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Enter your child's student <strong>Email Address</strong> or <strong>Username</strong> to link their profile to your parent account.
            </p>

            {linkError && (
              <div className="form-error" style={{ marginBottom: '1rem' }}>
                <i className="fa-solid fa-circle-exclamation" /> {linkError}
              </div>
            )}
            {linkSuccess && (
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid #10b981', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: '700' }}>
                <i className="fa-solid fa-circle-check" /> {linkSuccess}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Child Email or Username</label>
              <input
                type="text"
                placeholder="e.g. child@email.com or ahmed_student"
                value={childIdentifier}
                onChange={(e) => setChildIdentifier(e.target.value)}
                required
                disabled={linkLoading}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn secondary" onClick={() => setShowLinkModal(false)} disabled={linkLoading}>
                Cancel
              </button>
              <button type="submit" className="modal-btn primary" disabled={linkLoading || !childIdentifier.trim()}>
                {linkLoading ? 'Linking...' : 'Link Child Account'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
  );
};

export default ParentOverview;
