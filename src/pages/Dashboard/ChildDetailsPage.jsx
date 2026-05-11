import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import { useAuth } from '../../context/AuthContext';
import './DashboardOverview.css';

// Styles for status badges
const statusStyles = {
  'completed': { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  'pending': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  'canceled': { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  'Completed': { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  'Pending': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  'Canceled': { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  'Late submission': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

const ChildDetailsPage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'instructor';
  const canDownloadTranscript = ['admin', 'instructor', 'parent'].includes(user?.role);
  
  const [activeTab, setActiveTab] = useState('Overview');

  // Fetch Child Profile Data
  const { data: profileRes, loading: profileLoading } = useFetchData(`/api/v1/StudentProfile/${profileId}`);
  const profile = profileRes || {};
  const childUser = profile.user || {};
  
  // Fetch and filter other data based on role
  const { data: tasksRaw, loading: tasksLoading } = useFetchData(isAdmin ? `/api/v1/task/student/${profileId}` : '/api/v1/task/me');
  const { data: extCoursesRaw, loading: extCoursesLoading } = useFetchData(isAdmin ? `/api/v1/external-course/${profileId}/student` : '/api/v1/external-course/my-course');
  const { data: extHwRaw, loading: extHwLoading } = useFetchData(isAdmin ? '/api/v1/external-hw' : '/api/v1/external-hw/my');
  const { data: sessionsRaw, loading: sessionsLoading } = useFetchData(isAdmin ? `/api/v1/session/student/${profileId}` : '/api/v1/session/me');
  const { data: reviewsRaw, loading: reviewsLoading } = useFetchData(isAdmin ? `/api/v1/sessionReview/student/${profileId}` : '/api/v1/sessionReview/me');
  const { data: parentDashboardRaw, loading: parentDashboardLoading } = useFetchData(`/api/v1/progress/parent/${profileId}/dashboard`);

  const isLoading = profileLoading || tasksLoading || extCoursesLoading || extHwLoading || sessionsLoading || reviewsLoading || parentDashboardLoading;

  if (isLoading) {
    return (
      <div className="overview-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Loading child details...</h2>
      </div>
    );
  }

  // Safely extract arrays from responses
  const tasksAll = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.docs || tasksRaw?.tasks || []);
  const extCoursesAll = Array.isArray(extCoursesRaw) ? extCoursesRaw : (extCoursesRaw?.docs || extCoursesRaw?.courses || []);
  const extHwAll = Array.isArray(extHwRaw) ? extHwRaw : (extHwRaw?.docs || []);
  const sessionsAll = Array.isArray(sessionsRaw) ? sessionsRaw : (sessionsRaw?.docs || sessionsRaw?.sessions || []);
  const reviewsAll = Array.isArray(reviewsRaw) ? reviewsRaw : (reviewsRaw?.docs || reviewsRaw?.reviews || []);

  // Ensure robust filtering handling both populated/unpopulated studentProfileId
  const getProfileId = (item, field = 'studentProfileId') => {
      const val = item[field];
      if (!val) return null;
      return typeof val === 'object' ? val._id : val;
  };

  // 1. Internal Tasks
  const childTasks = tasksAll.filter(t => getProfileId(t) === profileId);
  const pendingTasks = childTasks.filter(t => t.status === 'pending');
  const completedTasks = childTasks.filter(t => t.status === 'completed');
  
  // 2. External Courses & HW
  const childCourses = extCoursesAll.filter(c => getProfileId(c) === profileId);
  const childCourseIds = childCourses.map(c => c._id);
  const childHw = extHwAll.filter(hw => {
      const hwCourseId = typeof hw.externalCourse === 'object' ? hw.externalCourse?._id : hw.externalCourse;
      return childCourseIds.includes(hwCourseId);
  });

  // 3. Sessions & Reviews
  const childSessions = sessionsAll.filter(s => getProfileId(s) === profileId);
  const childReviews = reviewsAll.filter(r => getProfileId(r) === profileId);
  const parentDashboard = parentDashboardRaw?.data || parentDashboardRaw || {};
  const dashboardStudent = parentDashboard.student || {};
  const dashboardAttendance = parentDashboard.attendance || {};
  const recentExams = parentDashboard.recentExams || [];
  const upcomingDashboardTasks = parentDashboard.upcomingTasks || [];
  const latestDashboardReview = parentDashboard.latestReview;

  // Deriving Stats locally to substitute aggregate APIs
  const completionRate = childTasks.length > 0 ? Math.round((completedTasks.length / childTasks.length) * 100) : 0;
  
  const initials = (childUser.FullName || 'Student').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const downloadTranscript = async () => {
    const response = await fetch(`/api/v1/StudentProfile/${profileId}/transcript.pdf`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access-token') || ''}` },
      credentials: 'include',
    });

    if (!response.ok) {
      alert('Could not download transcript.');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${childUser.FullName || 'student'}-transcript.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overview-container" style={{ padding: '2rem 0' }}>
      
      {/* Header Profile Section */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        ← Back to Overview
      </button>

      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-primary), var(--info))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', boxShadow: '0 8px 16px rgba(59,130,246,0.3)' }}>
          {initials}
        </div>
        <div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>{childUser.FullName || 'Student'}</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Grade: <strong>{profile.grade || 'N/A'}</strong> • Joined: {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {canDownloadTranscript && (
            <button
              className="nb-btn nb-btn-secondary"
              onClick={downloadTranscript}
              style={{ marginRight: '0.75rem' }}
            >
              Download Transcript
            </button>
          )}
          <button 
            className="nb-btn nb-btn-primary" 
            onClick={() => navigate(`/dashboard/progress/${profileId}`)}
          >
            📈 View Progress Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        {['Overview', 'External Curriculum', 'Internal Sessions', 'Session Reviews'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.6rem 1.5rem',
              background: activeTab === tab ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '100px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content Rendering based on Active Tab */}
      
      {activeTab === 'Overview' && (
        <>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}>📋</div>
              <div className="stat-info">
                <h3>{childTasks.length}</h3>
                <p>Internal Tasks</p>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>✅</div>
              <div className="stat-info">
                <h3>{completionRate}%</h3>
                <p>Completion Rate</p>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>📚</div>
              <div className="stat-info">
                <h3>{childCourses.length}</h3>
                <p>External Courses</p>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>⚡</div>
              <div className="stat-info">
                <h3>{pendingTasks.length + childHw.filter(h => h.status === 'Pending').length}</h3>
                <p>Overall Pending Work</p>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>S</div>
              <div className="stat-info">
                <h3>{dashboardStudent.attendanceStreak ?? profile.attendanceStreak ?? 0}</h3>
                <p>Attendance Streak</p>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}>A</div>
              <div className="stat-info">
                <h3>{dashboardAttendance.attendanceRate ?? 0}%</h3>
                <p>Attendance Rate</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Quick Pending Internal Tasks */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🔥 Pending Internal Tasks</h3>
              {pendingTasks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>All caught up!</p> : (
                <ul className="task-list">
                  {pendingTasks.slice(0, 5).map(t => (
                    <li key={t._id} className="task-item pending" style={{ padding: '0.8rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: '0 0 0.2rem' }}>{t.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Pending External HW */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📝 Pending External Homework</h3>
              {childHw.filter(h => h.status === 'Pending').length === 0 ? <p style={{ color: 'var(--text-muted)' }}>All caught up!</p> : (
                <ul className="task-list">
                  {childHw.filter(h => h.status === 'Pending').slice(0, 5).map(hw => (
                    <li key={hw._id} className="task-item pending" style={{ padding: '0.8rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', marginBottom: '0.5rem', borderLeft: `4px solid ${hw.externalCourse?.color || 'var(--warning)'}` }}>
                      <h4 style={{ margin: '0 0 0.2rem' }}>{hw.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Course: {hw.externalCourse?.subject || 'Unknown'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Exam Results</h3>
            {recentExams.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No exam results yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recentExams.map((exam, index) => (
                  <div key={`${exam.title}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{exam.title}</h4>
                      <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{exam.date ? new Date(exam.date).toLocaleDateString() : ''}</p>
                    </div>
                    <strong>{exam.percentage ?? 0}%</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Latest Session Review</h3>
            {!latestDashboardReview ? <p style={{ color: 'var(--text-muted)' }}>No session review yet.</p> : (
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Overall</span><strong>{latestDashboardReview.overAllRating ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Behavior</span><strong>{latestDashboardReview.behavior ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Understanding</span><strong>{latestDashboardReview.understanding ?? 'N/A'}</strong></div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{latestDashboardReview.date ? new Date(latestDashboardReview.date).toLocaleDateString() : ''}</p>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Upcoming Tasks</h3>
            {upcomingDashboardTasks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No upcoming tasks.</p> : (
              <ul className="task-list">
                {upcomingDashboardTasks.map((task, index) => (
                  <li key={`${task.title}-${index}`} className="task-item pending">
                    <div className="task-meta">
                      <h4>{task.title}</h4>
                      <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                    </div>
                    <div className="task-status">{task.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'External Curriculum' && (
        <div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Enrolled External Courses</h2>
          {childCourses.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No external courses assigned.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {childCourses.map(c => (
                <div key={c._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderTop: `4px solid ${c.color || '#10b981'}` }}>
                  <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem' }}>{c.subject}</h3>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 0.75rem', fontSize: '0.88rem' }}>👨‍🏫 {c.teacher || 'No teacher'}</p>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>External Homework History</h2>
          {childHw.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No homework records.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {childHw.map(hw => {
                const st = statusStyles[hw.status] || statusStyles['Pending'];
                return (
                  <div key={hw._id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 0.2rem', fontSize: '1rem' }}>{hw.title}</h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '100px', background: st.bg, color: st.color }}>{hw.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{hw.externalCourse?.subject || 'Course'}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      <span>📅 Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      {hw.submissionDate && <span>✅ Submitted: {new Date(hw.submissionDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Internal Sessions' && (
        <div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Internal Platform Sessions</h2>
          {childSessions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No sessions loaded yet.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {childSessions.map(s => (
                <div key={s._id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem' }}>{s.title || 'Untitled Session'}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>📅 {s.date ? new Date(s.date).toLocaleDateString() : 'No date'}</p>
                  </div>
                  <span style={{ padding: '0.3rem 0.75rem', background: s.StudentAttended ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.StudentAttended ? 'var(--success)' : 'var(--error)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {s.StudentAttended ? '✅ Attended' : '❌ Missed'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginTop: '3rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Internal Platform Tasks</h2>
          {childTasks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No tasks assigned.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {childTasks.map(t => {
                const st = statusStyles[t.status] || statusStyles['pending'];
                return (
                  <div key={t._id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 0.2rem', fontSize: '1rem' }}>{t.title}</h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '100px', background: st.bg, color: st.color }}>{t.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Session Reviews' && (
        <div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Session Reviews</h2>
          {childReviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No reviews available yet.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {childReviews.map(review => (
                <div key={review._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '3px solid var(--border-color)', boxShadow: '4px 4px 0px 0px var(--shadow-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem' }}>Session Review</h3>
                      {review.session?.title && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>📚 {review.session.title}</p>}
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--info))', color: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                      {review.overAllRating?.toFixed(1) || '—'}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                    {['Behavior', 'underStanding', 'participation', 'coding'].map(key => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '90px', textTransform: 'capitalize' }}>{key === 'underStanding' ? 'Understanding' : key}</span>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${((review[key] || 0) / 5) * 100}%`, background: 'var(--brand-primary)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{review[key] || 0}/5</span>
                      </div>
                    ))}
                  </div>
                  
                  {review.notes && (
                    <p style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      📝 {review.notes}
                    </p>
                  )}
                  <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};

export default ChildDetailsPage;
