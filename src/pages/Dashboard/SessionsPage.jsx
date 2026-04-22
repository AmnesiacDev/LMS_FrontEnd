import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { useApiRequest } from '../../hooks/useApiRequest';

const statusColor = (s) => {
  if (s === 'completed') return '#10b981';
  if (s === 'canceled' || s === 'student canceled') return '#ef4444';
  return '#f59e0b';
};

const SessionsPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin' || role === 'instructor';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => { fetchSessions(); }, []);

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
          <label className="modal-label">Student Profile ID</label>
          <input className="modal-input" placeholder="ObjectId" required={!isEdit} disabled={isEdit} value={formData.studentProfileId} onChange={e => setFormData({ ...formData, studentProfileId: e.target.value })} />
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
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Sessions</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{sessions.length} sessions</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setFormData(emptyForm); setFormError(null); setShowCreate(true); }} className="modal-btn modal-btn-primary" style={{ width: 'auto', padding: '0.65rem 1.4rem' }}>➕ Create Session</button>
        )}
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading sessions...</p>}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {!loading && sessions.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
          <h3>No sessions found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Sessions will appear here once created.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sessions.map(session => (
          <div key={session._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: `4px solid ${statusColor(session.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{session.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{session.description}</p>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>📅 {session.date ? new Date(session.date).toLocaleString() : 'No date'}</span>
                  {session.instructorId?.FullName && <span>👨‍🏫 {session.instructorId.FullName}</span>}
                  <span>✅ Attended: {session.StudentAttended ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <span className="modal-badge" style={{ background: statusColor(session.status) + '18', color: statusColor(session.status), textTransform: 'capitalize' }}>{session.status}</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button onClick={() => setViewSession(session)} style={{ padding: '0.3rem 0.55rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>👁️</button>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(session)} style={{ padding: '0.3rem 0.55rem', background: 'rgba(59,130,246,0.08)', color: 'var(--info)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>✏️</button>
                      <button onClick={() => { setFormError(null); setDeleteSession(session); }} style={{ padding: '0.3rem 0.55rem', background: 'rgba(239,68,68,0.08)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {session.summary && <p style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📋 {session.summary}</p>}
          </div>
        ))}
      </div>

      {/* ═══ VIEW ═══ */}
      <Modal isOpen={!!viewSession} onClose={() => setViewSession(null)} title={viewSession?.title || 'Session Details'} size="lg">
        {viewSession && (
          <>
            <div className="modal-detail-grid">
              <div className="modal-detail-item">
                <div className="detail-label">Status</div>
                <span className="modal-badge" style={{ background: statusColor(viewSession.status) + '18', color: statusColor(viewSession.status), textTransform: 'capitalize' }}>{viewSession.status}</span>
              </div>
              <div className="modal-detail-item">
                <div className="detail-label">Date</div>
                <div className="detail-value">{viewSession.date ? new Date(viewSession.date).toLocaleString() : '—'}</div>
              </div>
              <div className="modal-detail-item">
                <div className="detail-label">Attended</div>
                <div className="detail-value">{viewSession.StudentAttended ? '✅ Yes' : '❌ No'}</div>
              </div>
              <div className="modal-detail-item">
                <div className="detail-label">ID</div>
                <div className="detail-value mono">{viewSession._id}</div>
              </div>
            </div>
            <div className="modal-section-label">Description</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{viewSession.description}</p>
            {viewSession.summary && (<><div className="modal-section-label">Summary</div><p style={{ color: 'var(--text-secondary)' }}>{viewSession.summary}</p></>)}
            {viewSession.notes && (<><div className="modal-section-label">Notes</div><div className="modal-detail-item"><div className="detail-value" style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>{viewSession.notes}</div></div></>)}
            {viewSession.recapVideoLinks?.length > 0 && (<><div className="modal-section-label">Recap Videos</div><div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>{viewSession.recapVideoLinks.map((v, i) => <a key={i} href={v.link} target="_blank" rel="noreferrer" className="modal-chip" style={{ color: 'var(--brand-primary)' }}>🎬 {v.title || 'Video'}</a>)}</div></>)}
            {viewSession.attachmentsLinks?.length > 0 && (<><div className="modal-section-label">Attachments</div><div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>{viewSession.attachmentsLinks.map((a, i) => <a key={i} href={a.attachmentLink} target="_blank" rel="noreferrer" className="modal-chip" style={{ color: 'var(--info)' }}>📎 {a.title || 'File'}</a>)}</div></>)}
          </>
        )}
      </Modal>

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
