import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { useApiRequest } from '../../hooks/useApiRequest';

/* ─── Warm Status Colors ─── */
const statusColor = (s) => {
  if (s === 'completed') return { bg: 'var(--accent-yellow)', text: 'var(--text-primary)' };
  if (s === 'canceled' || s === 'student canceled') return { bg: 'var(--brand-primary)', text: '#FFFFFF' };
  return { bg: 'var(--accent-orange)', text: 'var(--text-primary)' };   // pending
};

/* ─── Styles (Neo-Brutalist) ─── */
const styles = {
  page: {
    padding: '0',
  },
  /* ── Header ── */
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  title: { fontFamily: 'var(--font-heading)', fontSize: '2rem', margin: 0, fontWeight: 400 },
  subtitle: { color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem', fontWeight: 600 },
  createBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    padding: '0.65rem 1.4rem', background: 'var(--brand-primary)', color: '#FFFFFF',
    border: '3px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase',
    letterSpacing: '0.04em', boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer', transition: 'all 0.12s ease', fontFamily: 'var(--font-body)',
  },
  headerActions: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
  },
  exportBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    padding: '0.65rem 1.1rem', background: 'var(--card-bg)', color: 'var(--text-primary)',
    border: '3px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase',
    letterSpacing: '0.04em', boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer', transition: 'all 0.12s ease', fontFamily: 'var(--font-body)',
  },

  /* ── Filters ── */
  filtersRow: {
    display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
  },
  filterPill: (active) => ({
    padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--border-color)',
    background: active ? 'var(--brand-primary)' : 'var(--card-bg)',
    color: active ? '#FFFFFF' : 'var(--text-primary)',
    fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase',
    letterSpacing: '0.04em', cursor: 'pointer',
    boxShadow: active ? 'var(--shadow-sm)' : '2px 2px 0px 0px var(--shadow-color)',
    transition: 'all 0.12s ease', fontFamily: 'var(--font-body)',
    transform: active ? 'translate(-1px, -1px)' : 'none',
  }),
  searchInput: {
    flex: 1, minWidth: '200px', maxWidth: '320px',
    padding: '0.5rem 0.85rem', border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', background: 'var(--card-bg)',
    color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500,
    fontFamily: 'var(--font-body)', outline: 'none',
    boxShadow: '2px 2px 0px 0px var(--shadow-color)',
  },

  /* ── Session Card ── */
  card: {
    background: 'var(--card-bg)', 
    border: '3px solid var(--border-color)',
    borderRadius: 'var(--radius-md)', 
    boxShadow: '4px 4px 0px 0px var(--shadow-color)',
    overflow: 'hidden', 
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    padding: '1.25rem 1.5rem', cursor: 'pointer',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: '1rem', transition: 'background 0.12s ease',
  },
  cardLeft: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 400,
    margin: '0 0 0.3rem', color: 'var(--text-primary)',
  },
  cardDesc: { color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 0.5rem', lineHeight: 1.4 },
  metaRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 },
  statusBadge: (status) => {
    const c = statusColor(status);
    return {
      padding: '0.25rem 0.7rem', borderRadius: 'var(--radius-sm)',
      border: '2px solid var(--border-color)', background: c.bg, color: c.text,
      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.04em',
    };
  },
  chevron: (expanded) => ({
    width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.9rem', transition: 'transform 0.2s ease, background 0.15s ease',
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    cursor: 'pointer',
  }),
  actionBtns: { display: 'flex', gap: '0.35rem' },
  actionBtn: (color) => ({
    padding: '0.3rem 0.5rem', background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)', border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem',
    boxShadow: '1px 1px 0px 0px var(--shadow-color)',
    transition: 'all 0.1s ease',
  }),

  /* ── Expandable Content ── */
  expandedContent: {
    borderTop: '2px solid var(--border-color)',
    padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)',
    animation: 'slideDown 0.25s ease',
  },
  contentGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem',
  },
  contentSection: {
    padding: '1rem', background: 'var(--card-bg)', border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0px 0px var(--shadow-color)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
    margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  linkItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)',
    marginBottom: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)',
    fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.1s ease',
    cursor: 'pointer',
  },
  emptyState: {
    color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.25rem 0',
  },
  summaryBox: {
    padding: '0.75rem', background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
};

const SessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin' || role === 'instructor';
  const canExportCalendar = ['student', 'parent', 'instructor'].includes(role);

  const [sessions, setSessions] = useState([]);
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded cards
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [showCreate, setShowCreate] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [deleteSession, setDeleteSession] = useState(null);
  const [viewSession, setViewSession] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const emptyForm = { title: '', description: '', studentProfileId: '', instructorId: '', date: '', notes: '', summary: '', status: 'pending', StudentAttended: true };
  const [formData, setFormData] = useState(emptyForm);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await request(isAdmin ? '/api/v1/session' : '/api/v1/session/me');
      const list = data.data?.docs || data.data?.sessions || [];
      setSessions(Array.isArray(list) ? list : [list]);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchStudentProfiles = async () => {
    if (!isAdmin) return;
    try {
      const data = await request('/api/v1/StudentProfile/all');
      const list = data.data?.profiles || data.data?.docs || data.data;
      setStudentProfiles(Array.isArray(list) ? list : []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchSessions(); fetchStudentProfiles(); }, []);

  /* ── Toggle expand ── */
  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Filtered sessions ── */
  const filteredSessions = sessions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
    }
    return true;
  });

  // Count by status
  const counts = {
    all: sessions.length,
    pending: sessions.filter(s => s.status === 'pending').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    canceled: sessions.filter(s => s.status === 'canceled' || s.status === 'student canceled').length,
  };

  /* ── CRUD handlers ── */
  const handleCreate = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = { title: formData.title, description: formData.description, studentProfileId: formData.studentProfileId, instructorId: formData.instructorId, date: formData.date, StudentAttended: formData.StudentAttended };
      if (formData.notes) payload.notes = formData.notes;
      if (formData.summary) payload.summary = formData.summary;
      await request('/api/v1/session', 'POST', payload);
      setShowCreate(false); setFormData(emptyForm); await fetchSessions();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = {};
      if (formData.title) payload.title = formData.title;
      if (formData.description) payload.description = formData.description;
      if (formData.summary !== undefined) payload.summary = formData.summary;
      if (formData.notes !== undefined) payload.notes = formData.notes;
      if (formData.status) payload.status = formData.status;
      payload.StudentAttended = formData.StudentAttended;
      await request(`/api/v1/session/${editSession._id}`, 'PATCH', payload);
      setEditSession(null); await fetchSessions();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true); setFormError(null);
    try {
      await request(`/api/v1/session/${deleteSession._id}`, 'DELETE');
      setDeleteSession(null); await fetchSessions();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const exportCalendar = async () => {
    try {
      const response = await fetch('/api/v1/session/me/calendar.ics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access-token') || ''}` },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Could not export calendar.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'algogambit-sessions.ics';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (s) => {
    setFormData({ title: s.title || '', description: s.description || '', studentProfileId: s.studentProfileId?._id || s.studentProfileId || '', instructorId: s.instructorId?._id || s.instructorId || '', date: s.date ? new Date(s.date).toISOString().slice(0, 16) : '', notes: s.notes || '', summary: s.summary || '', status: s.status || 'pending', StudentAttended: s.StudentAttended !== false });
    setFormError(null); setEditSession(s);
  };

  const renderFormFields = (isEdit) => (
    <>
      <div className="modal-form-group">
        <label className="modal-label">Title</label>
        <input className="modal-input" required placeholder="Session title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
      </div>
      <div className="modal-form-group">
        <label className="modal-label">Description</label>
        <textarea className="modal-textarea" required placeholder="Session description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="modal-row modal-row-2">
        <div className="modal-form-group">
          <label className="modal-label">Student</label>
          {isEdit ? (
            <input className="modal-input" disabled value={formData.studentProfileId} />
          ) : studentProfiles.length > 0 ? (
            <select className="modal-select" required value={formData.studentProfileId} onChange={e => setFormData({ ...formData, studentProfileId: e.target.value })}>
              <option value="">Choose a student</option>
              {studentProfiles.map(p => (
                <option key={p._id} value={p._id}>
                  {p.user?.FullName || p.user?.UserName || 'Student'}{p.grade ? ` - Grade ${p.grade}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <input className="modal-input" placeholder="ObjectId" required value={formData.studentProfileId} onChange={e => setFormData({ ...formData, studentProfileId: e.target.value })} />
          )}
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Instructor ID</label>
          <input className="modal-input" placeholder="ObjectId" required={!isEdit} disabled={isEdit} value={formData.instructorId} onChange={e => setFormData({ ...formData, instructorId: e.target.value })} />
        </div>
      </div>
      <div className="modal-row modal-row-2">
        <div className="modal-form-group">
          <label className="modal-label">Date & Time</label>
          <input className="modal-input" type="datetime-local" required={!isEdit} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Status</label>
          <select className="modal-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="student canceled">Student Canceled</option>
          </select>
        </div>
      </div>
      <div className="modal-form-group">
        <label className="modal-checkbox">
          <input type="checkbox" checked={formData.StudentAttended} onChange={e => setFormData({ ...formData, StudentAttended: e.target.checked })} />
          Student Attended
        </label>
      </div>
      <div className="modal-form-group">
        <label className="modal-label">Summary</label>
        <textarea className="modal-textarea" style={{ minHeight: '60px' }} placeholder="Session summary..." value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} />
      </div>
      <div className="modal-form-group">
        <label className="modal-label">Notes</label>
        <textarea className="modal-textarea" style={{ minHeight: '60px' }} placeholder="Any notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
      </div>
    </>
  );

  return (
    <div style={styles.page}>
      {/* ── CSS Keyframe for expand animation ── */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 600px; }
        }
      `}</style>

      {/* ═══ Header ═══ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sessions</h1>
          <p style={styles.subtitle}>{filteredSessions.length} of {sessions.length} sessions</p>
        </div>
        <div style={styles.headerActions}>
          {canExportCalendar && (
            <button
              onClick={exportCalendar}
              style={styles.exportBtn}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              Export Calendar
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => { setFormData({ ...emptyForm, instructorId: user?._id || '' }); setFormError(null); setShowCreate(true); }}
              style={styles.createBtn}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              ➕ Create Session
            </button>
          )}
        </div>
      </div>

      {/* ═══ Filters ═══ */}
      <div style={styles.filtersRow}>
        {['all', 'pending', 'completed', 'canceled'].map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            style={styles.filterPill(statusFilter === f)}
            onMouseEnter={e => { if (statusFilter !== f) { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px 0px var(--shadow-color)'; } }}
            onMouseLeave={e => { if (statusFilter !== f) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--shadow-color)'; } }}
          >
            {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
          </button>
        ))}
        <input
          type="text"
          placeholder="🔍 Search sessions..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* ═══ Loading / Error / Empty ═══ */}
      {loading && <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading sessions...</p>}
      {error && <p style={{ color: 'var(--error)', fontWeight: 600 }}>⚠️ {error}</p>}
      {!loading && filteredSessions.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>📅</p>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}>No sessions found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Sessions will appear here once created.'}
          </p>
        </div>
      )}

      {/* ═══ Session Cards ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredSessions.map(session => {
          const isExpanded = expandedIds.has(session._id);
          const hasLinks = session.attachmentsLinks?.length > 0;
          const hasVideos = session.recapVideoLinks?.length > 0;
          const hasSummary = !!session.summary;
          const hasNotes = !!session.notes;
          const hasContent = hasLinks || hasVideos || hasSummary || hasNotes;

          return (
            <div 
              key={session._id} 
              style={styles.card}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px 0px var(--shadow-color)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--shadow-color)';
              }}
            >
              {/* ── Card Header (Clickable) ── */}
              <div
                style={{
                  ...styles.cardHeader,
                  background: isExpanded ? 'var(--bg-secondary)' : 'transparent',
                }}
                onClick={() => toggleExpand(session._id)}
              >
                <div style={styles.cardLeft}>
                  <h3 style={styles.cardTitle}>{session.title}</h3>
                  <p style={styles.cardDesc}>{session.description}</p>
                  <div style={styles.metaRow}>
                    <span style={styles.metaItem}>📅 {session.date ? new Date(session.date).toLocaleString() : 'No date'}</span>
                    {session.instructorId?.FullName && <span style={styles.metaItem}>👨‍🏫 {session.instructorId.FullName}</span>}
                    {isAdmin && session.studentProfileId?.user?.FullName && (
                      <span 
                        style={{ ...styles.metaItem, color: 'var(--brand-primary)', cursor: 'pointer', textDecoration: 'underline' }} 
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/child/${session.studentProfileId._id}`); }}
                        title="View student profile"
                      >
                        🎓 {session.studentProfileId.user.FullName}
                      </span>
                    )}
                    <span style={styles.metaItem}>{session.StudentAttended ? '✅' : '❌'} Attended: {session.StudentAttended ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div style={styles.cardRight}>
                  <span style={styles.statusBadge(session.status)}>{session.status}</span>
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    {isAdmin && (
                      <div style={styles.actionBtns}>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(session); }}
                          style={styles.actionBtn()}
                          title="Edit"
                        >✏️</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFormError(null); setDeleteSession(session); }}
                          style={styles.actionBtn()}
                          title="Delete"
                        >🗑️</button>
                      </div>
                    )}
                    <div style={styles.chevron(isExpanded)}>▼</div>
                  </div>
                </div>
              </div>

              {/* ── Expanded Dropdown Content ── */}
              {isExpanded && (
                <div style={styles.expandedContent}>
                  {!hasContent ? (
                    <p style={styles.emptyState}>No additional resources attached to this session.</p>
                  ) : (
                    <div style={styles.contentGrid}>
                      {/* Recap Videos */}
                      {hasVideos && (
                        <div style={styles.contentSection}>
                          <p style={styles.sectionTitle}>🎬 Recap Videos</p>
                          {session.recapVideoLinks.map((v, i) => (
                            <a
                              key={i}
                              href={v.link}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.linkItem}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-yellow)'; e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.transform = 'none'; }}
                            >
                              <span style={{ fontSize: '1.1rem' }}>▶️</span>
                              <span>{v.title || `Video ${i + 1}`}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Attachments / Files */}
                      {hasLinks && (
                        <div style={styles.contentSection}>
                          <p style={styles.sectionTitle}>📎 Files & Attachments</p>
                          {session.attachmentsLinks.map((a, i) => (
                            <a
                              key={i}
                              href={a.attachmentLink}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.linkItem}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-peach)'; e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.transform = 'none'; }}
                            >
                              <span style={{ fontSize: '1.1rem' }}>📄</span>
                              <span>{a.title || `Attachment ${i + 1}`}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Summary */}
                      {hasSummary && (
                        <div style={styles.contentSection}>
                          <p style={styles.sectionTitle}>📋 Session Summary</p>
                          <div style={styles.summaryBox}>{session.summary}</div>
                        </div>
                      )}

                      {/* Notes */}
                      {hasNotes && (
                        <div style={styles.contentSection}>
                          <p style={styles.sectionTitle}>📝 Notes</p>
                          <div style={styles.summaryBox}>{session.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ CREATE ═══ */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Session" size="lg">
        <form onSubmit={handleCreate}>
          {formError && <div className="modal-error">⚠️ {formError}</div>}
          {renderFormFields(false)}
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">{formLoading ? 'Creating...' : '➕ Create Session'}</button>
        </form>
      </Modal>

      {/* ═══ EDIT ═══ */}
      <Modal isOpen={!!editSession} onClose={() => setEditSession(null)} title={`Edit — ${editSession?.title}`} size="lg">
        <form onSubmit={handleUpdate}>
          {formError && <div className="modal-error">⚠️ {formError}</div>}
          {renderFormFields(true)}
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-info">{formLoading ? 'Saving...' : '💾 Save Changes'}</button>
        </form>
      </Modal>

      {/* ═══ DELETE ═══ */}
      <Modal isOpen={!!deleteSession} onClose={() => setDeleteSession(null)} title="Delete Session" size="sm">
        <div className="modal-warning-icon">⚠️</div>
        <p className="modal-warning-text">Delete <strong>"{deleteSession?.title}"</strong>?</p>
        <p className="modal-warning-sub">This action is permanent and cannot be undone.</p>
        {formError && <div className="modal-error">⚠️ {formError}</div>}
        <div className="modal-actions">
          <button onClick={() => setDeleteSession(null)} className="modal-btn modal-btn-ghost">Cancel</button>
          <button onClick={handleDelete} disabled={formLoading} className="modal-btn modal-btn-danger">{formLoading ? 'Deleting...' : '🗑️ Delete'}</button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsPage;
