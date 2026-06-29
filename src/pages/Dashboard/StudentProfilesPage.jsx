import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { useApiRequest } from '../../hooks/useApiRequest';
import { SkeletonCardGrid } from '../../components/Skeleton/Skeleton';
import { buildApiUrl } from '../../utils/apiUrl';

const StudentProfilesPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = user?.role || 'student';
  const canDownloadTranscript = ['admin', 'instructor', 'parent'].includes(role);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const emptyForm = { userId: '', parents: '', grade: '', notes: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      let endpoint;
      if (role === 'admin') endpoint = '/api/v1/StudentProfile/all';
      else if (role === 'instructor') endpoint = '/api/v1/session/me/students';
      else endpoint = '/api/v1/StudentProfile/me';

      const data = await request(endpoint);
      let list = data.data;
      if (list?.students) list = list.students;
      else if (list?.profiles) list = list.profiles;
      else if (list?.docs) list = list.docs;
      else if (!Array.isArray(list)) list = [list];
      setProfiles(Array.isArray(list) ? list : [list]);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = {};
      if (formData.grade) payload.grade = formData.grade;
      if (formData.notes) payload.notes = formData.notes;
      if (role === 'admin' && formData.parents.trim()) payload.parents = formData.parents.split(',').map(p => p.trim());
      await request(`/api/v1/StudentProfile/${formData.userId}`, 'POST', payload);
      setShowCreate(false); setFormData(emptyForm); await fetchProfiles();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = {};
      if (formData.grade) payload.grade = formData.grade;
      if (formData.notes) payload.notes = formData.notes;
      if (role === 'admin' && formData.parents.trim()) payload.parents = formData.parents.split(',').map(p => p.trim());
      await request(`/api/v1/StudentProfile/${editProfile._id}`, 'PATCH', payload);
      setEditProfile(null); await fetchProfiles();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const openEdit = (p) => {
    setFormData({
      userId: '', parents: (p.parents || []).map(par => par._id || par).join(', '),
      grade: p.grade || '', notes: p.notes || '',
    });
    setFormError(null); setEditProfile(p);
  };

  const downloadTranscript = async (profile) => {
    try {
      const response = await fetch(buildApiUrl(`/api/v1/StudentProfile/${profile._id}/transcript.pdf`), {
        headers: { Authorization: `Bearer ${localStorage.getItem('access-token') || ''}` },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Could not download transcript.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${profile.user?.FullName || 'student'}-transcript.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Student Profiles</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{profiles.length} profiles</p>
        </div>
        {role === 'admin' && (
          <button onClick={() => { setFormData(emptyForm); setFormError(null); setShowCreate(true); }} className="modal-btn modal-btn-primary" style={{ width: 'auto', padding: '0.65rem 1.4rem' }}>
            <i className="fa-solid fa-plus" /> Create Profile
          </button>
        )}
      </div>

      {loading && <SkeletonCardGrid count={6} minWidth={320} gap="1.5rem" />}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {profiles.map(profile => {
          const name = profile.user?.FullName || 'Unknown';
          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          const parentNames = (profile.parents || []).map(p => p.FullName || p.UserName || 'Parent').join(', ');
          return (
            <div key={profile._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div className="modal-profile-avatar" style={{ width: '48px', height: '48px', fontSize: '1rem', borderRadius: '14px' }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{name}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>@{profile.user?.UserName || '—'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Grade</span>
                  <span style={{ fontWeight: '600' }}>{profile.grade || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Parents</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parentNames || 'None'}</span>
                </div>
              </div>
              {profile.notes && <p style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}><i className="fa-solid fa-pen-to-square" /> {profile.notes}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setViewProfile(profile)} className="modal-btn modal-btn-ghost" style={{ padding: '0.45rem', fontSize: '0.82rem' }}><i className="fa-solid fa-eye" /> View</button>
                {canDownloadTranscript && <button onClick={() => downloadTranscript(profile)} className="modal-btn modal-btn-secondary" style={{ padding: '0.45rem', fontSize: '0.82rem' }}>Transcript</button>}
                {role === 'admin' && <button onClick={() => openEdit(profile)} className="modal-btn modal-btn-info" style={{ padding: '0.45rem', fontSize: '0.82rem' }}><i className="fa-solid fa-pen-to-square" /> Edit</button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ VIEW PROFILE MODAL ═══ */}
      <Modal isOpen={!!viewProfile} onClose={() => setViewProfile(null)} title={`Profile — ${viewProfile?.user?.FullName || 'Student'}`} size="md">
        {viewProfile && (
          <>
            <div className="modal-profile-header">
              <div className="modal-profile-avatar">
                {(viewProfile.user?.FullName || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="modal-profile-info">
                <h3>{viewProfile.user?.FullName}</h3>
                <p>@{viewProfile.user?.UserName} • {viewProfile.user?.Email}</p>
              </div>
            </div>

            <div className="modal-detail-grid">
              {role === 'admin' && (
                <div className="modal-detail-item">
                  <div className="detail-label">Profile ID</div>
                  <div className="detail-value mono">{viewProfile._id}</div>
                </div>
              )}
              <div className="modal-detail-item">
                <div className="detail-label">Grade</div>
                <div className="detail-value">{viewProfile.grade || 'N/A'}</div>
              </div>
            </div>

            <div className="modal-section-label">Linked Parents</div>
            {(viewProfile.parents || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No parents linked</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {viewProfile.parents.map((par, i) => (
                  <span key={i} className="modal-chip">
                    <i className="fa-solid fa-user" /> {par.FullName || par.UserName || par._id || par}
                    {par.Email && <span style={{ color: 'var(--text-muted)' }}>({par.Email})</span>}
                  </span>
                ))}
              </div>
            )}

            {viewProfile.notes && (
              <>
                <div className="modal-section-label">Notes</div>
                <div className="modal-detail-item">
                  <div className="detail-value" style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>{viewProfile.notes}</div>
                </div>
              </>
            )}
          </>
        )}
      </Modal>

      {/* ═══ CREATE MODAL ═══ */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Student Profile" size="md">
        <form onSubmit={handleCreate}>
          {formError && <div className="modal-error"><i className="fa-solid fa-triangle-exclamation" /> {formError}</div>}
          <div className="modal-form-group">
            <label className="modal-label">User ID (Student)</label>
            <input className="modal-input" type="text" placeholder="MongoDB ObjectId of the student" required value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} />
            <p className="modal-hint">The user must have role "student"</p>
          </div>
          {role === 'admin' && (
            <div className="modal-form-group">
              <label className="modal-label">Parent IDs</label>
              <input className="modal-input" type="text" placeholder="parentId1, parentId2" value={formData.parents} onChange={e => setFormData({ ...formData, parents: e.target.value })} />
            </div>
          )}
          <div className="modal-form-group">
            <label className="modal-label">Grade</label>
            <input className="modal-input" type="text" placeholder="e.g. 10" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Notes</label>
            <textarea className="modal-textarea" placeholder="Any notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">{formLoading ? 'Creating...' : <><i className="fa-solid fa-plus" /> Create Profile</>}</button>
        </form>
      </Modal>

      {/* ═══ EDIT MODAL ═══ */}
      <Modal isOpen={!!editProfile} onClose={() => setEditProfile(null)} title={`Edit — ${editProfile?.user?.FullName || 'Profile'}`} size="md">
        <form onSubmit={handleUpdate}>
          {formError && <div className="modal-error"><i className="fa-solid fa-triangle-exclamation" /> {formError}</div>}
          {role === 'admin' && (
            <div className="modal-form-group">
              <label className="modal-label">Parent IDs</label>
              <input className="modal-input" type="text" placeholder="parentId1, parentId2" value={formData.parents} onChange={e => setFormData({ ...formData, parents: e.target.value })} />
            </div>
          )}
          <div className="modal-form-group">
            <label className="modal-label">Grade</label>
            <input className="modal-input" type="text" placeholder="e.g. 10" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Notes</label>
            <textarea className="modal-textarea" placeholder="Any notes..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-info">{formLoading ? 'Saving...' : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}</button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentProfilesPage;
