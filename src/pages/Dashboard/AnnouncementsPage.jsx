import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApiRequest } from '../../hooks/useApiRequest';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import { SkeletonCardGrid } from '../../components/Skeleton/Skeleton';

const emptyForm = {
  title: '',
  body: '',
  targetStudentProfiles: [],
  isPinned: false,
  expiresAt: '',
};

const getList = (res, key) => {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.docs)) return data.docs;
  return [];
};

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = user?.role || 'student';
  const canManage = role === 'admin' || role === 'instructor';

  const [announcements, setAnnouncements] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [deleteAnnouncement, setDeleteAnnouncement] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  /* Pagination */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await request(`/api/v1/announcements?${params.toString()}`);
      const list = getList(res, 'announcements');
      setAnnouncements(list);
      setTotalDocs(res?.data?.total || res?.totalDocs || res?.results || list.length);
      setTotalPages(res?.data?.totalPages || res?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    if (!canManage) return;
    try {
      const res = await request('/api/v1/StudentProfile/all');
      setProfiles(getList(res, 'profiles'));
    } catch {
      setProfiles([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileOptions = useMemo(() => profiles.map((profile) => ({
    id: profile._id,
    label: `${profile.user?.FullName || profile.user?.UserName || 'Student'}${profile.grade ? ` - Grade ${profile.grade}` : ''}`,
  })), [profiles]);

  const buildPayload = () => ({
    title: formData.title.trim(),
    body: formData.body.trim(),
    targetStudentProfiles: formData.targetStudentProfiles,
    isPinned: formData.isPinned,
    expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
  });

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await request('/api/v1/announcements', 'POST', buildPayload());
      setShowCreate(false);
      setFormData(emptyForm);
      await fetchAnnouncements();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await request(`/api/v1/announcements/${editAnnouncement._id}`, 'PATCH', buildPayload());
      setEditAnnouncement(null);
      await fetchAnnouncements();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      await request(`/api/v1/announcements/${deleteAnnouncement._id}`, 'DELETE');
      setDeleteAnnouncement(null);
      await fetchAnnouncements();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (announcement) => {
    setFormData({
      title: announcement.title || '',
      body: announcement.body || '',
      targetStudentProfiles: (announcement.targetStudentProfiles || []).map((item) => item._id || item),
      isPinned: !!announcement.isPinned,
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : '',
    });
    setFormError(null);
    setEditAnnouncement(announcement);
  };

  const renderForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit}>
      {formError && <div className="modal-error">{formError}</div>}
      <div className="modal-form-group">
        <label className="modal-label">Title</label>
        <input className="modal-input" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </div>
      <div className="modal-form-group">
        <label className="modal-label">Body</label>
        <textarea className="modal-textarea" required value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
      </div>
      <div className="modal-form-group">
        <label className="modal-label">
          Target Students{' '}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
            ({formData.targetStudentProfiles.length === 0 ? 'everyone' : `${formData.targetStudentProfiles.length} selected`})
          </span>
        </label>
        {profileOptions.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
            {profileOptions.map((profile) => {
              const selected = formData.targetStudentProfiles.includes(profile.id);
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? formData.targetStudentProfiles.filter((id) => id !== profile.id)
                      : [...formData.targetStudentProfiles, profile.id];
                    setFormData({ ...formData, targetStudentProfiles: next });
                  }}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--border-color)',
                    background: selected ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                    color: selected ? '#fff' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {selected ? <><i className="fa-solid fa-circle-check" /> </> : ''}{profile.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Leave empty to target everyone.</p>
        )}
        {formData.targetStudentProfiles.length > 0 && (
          <button
            type="button"
            onClick={() => setFormData({ ...formData, targetStudentProfiles: [] })}
            style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear all (target everyone)
          </button>
        )}
      </div>
      <div className="modal-row modal-row-2">
        <label className="modal-checkbox">
          <input type="checkbox" checked={formData.isPinned} onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })} />
          Pin announcement
        </label>
        <div className="modal-form-group">
          <label className="modal-label">Expires at</label>
          <input className="modal-input" type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} />
        </div>
      </div>
      <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">
        {formLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Announcements</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>{announcements.length} visible announcements</p>
        </div>
        {canManage && (
          <button className="modal-btn modal-btn-primary" style={{ width: 'auto', padding: '0.65rem 1.2rem' }} onClick={() => { setFormData(emptyForm); setFormError(null); setShowCreate(true); }}>
            <i className="fa-solid fa-bullhorn" /> Create Announcement
          </button>
        )}
      </div>

      {loading && <SkeletonCardGrid count={6} minWidth={320} />}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {!loading && announcements.length === 0 && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>No announcements</h3>
          <p style={{ color: 'var(--text-muted)' }}>Pinned or targeted announcements will appear here.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {announcements.map((announcement) => (
          <article key={announcement._id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderTop: announcement.isPinned ? '4px solid var(--brand-primary)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{announcement.title}</h3>
              {announcement.isPinned && (
                <span className="modal-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <i className="fa-solid fa-thumbtack" style={{ color: '#f59e0b' }} /> Pinned
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{announcement.body}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>By {announcement.createdBy?.FullName || 'System'}</span>
              <span>{announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : ''}</span>
            </div>
            {announcement.expiresAt && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Expires: {new Date(announcement.expiresAt).toLocaleString()}</p>
            )}
            {canManage && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="modal-btn modal-btn-info" style={{ padding: '0.45rem 0.75rem' }} onClick={() => openEdit(announcement)}>
                  <i className="fa-solid fa-pen-to-square" /> Edit
                </button>
                <button className="modal-btn modal-btn-danger" style={{ padding: '0.45rem 0.75rem' }} onClick={() => { setFormError(null); setDeleteAnnouncement(announcement); }}>
                  <i className="fa-solid fa-trash" /> Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {!loading && announcements.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={(n) => { setLimit(n); setPage(1); }}
          total={totalDocs}
        />
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Announcement" size="md">
        {renderForm(handleCreate, 'Create Announcement')}
      </Modal>

      <Modal isOpen={!!editAnnouncement} onClose={() => setEditAnnouncement(null)} title={`Edit - ${editAnnouncement?.title || 'Announcement'}`} size="md">
        {renderForm(handleUpdate, 'Save Changes')}
      </Modal>

      <Modal isOpen={!!deleteAnnouncement} onClose={() => setDeleteAnnouncement(null)} title="Delete Announcement" size="sm">
        <p className="modal-warning-text">Delete <strong>{deleteAnnouncement?.title}</strong>?</p>
        {formError && <div className="modal-error">{formError}</div>}
        <div className="modal-actions">
          <button className="modal-btn modal-btn-ghost" onClick={() => setDeleteAnnouncement(null)}>Cancel</button>
          <button className="modal-btn modal-btn-danger" disabled={formLoading} onClick={handleDelete}>
            {formLoading ? 'Deleting...' : <><i className="fa-solid fa-trash" /> Delete</>}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
