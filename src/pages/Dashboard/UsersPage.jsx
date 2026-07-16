import React, { useCallback, useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import { useApiRequest } from '../../hooks/useApiRequest';
import { SkeletonTableRows } from '../../components/Skeleton/Skeleton';

const roleBadge = (role) => {
  const colors = {
    admin:      { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
    instructor: { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
    student:    { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
    parent:     { bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6' },
  };
  const c = colors[role] || colors.student;
  return (
    <span className="modal-badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}33`, fontWeight: 700 }}>{role}</span>
  );
};

/* Avatar background per role */
const roleAvatarBg = {
  admin:      '#ef4444',
  instructor: '#3b82f6',
  student:    '#10b981',
  parent:     '#8b5cf6',
};

const UsersPage = () => {
  const { request } = useApiRequest();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Pagination */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const emptyForm = { FullName: '', UserName: '', Email: '', password: '', passwordConfirm: '', role: 'student' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const data = await request(`/api/v1/user?${params.toString()}`);
      const list = data.data?.docs || data.data?.users || data.data || [];
      const arr = Array.isArray(list) ? list : [];
      setUsers(arr);
      setTotalDocs(data.data?.total || data.totalDocs || data.results || arr.length);
      setTotalPages(data.data?.totalPages || data.totalPages || 1);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [limit, page, request]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      await request('/api/v1/user', 'POST', formData);
      setShowCreate(false); setFormData(emptyForm); await fetchUsers();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = { FullName: formData.FullName, UserName: formData.UserName, role: formData.role };
      if (formData.password) { payload.password = formData.password; payload.passwordConfirm = formData.passwordConfirm; }
      await request(`/api/v1/user/${editUser._id}`, 'PATCH', payload);
      setEditUser(null); await fetchUsers();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true); setFormError(null);
    try {
      await request(`/api/v1/user/${deleteUser._id}`, 'DELETE');
      setDeleteUser(null); await fetchUsers();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const openEdit = (u) => {
    setFormData({ FullName: u.FullName || '', UserName: u.UserName || '', Email: u.Email || '', password: '', passwordConfirm: '', role: u.role || 'student' });
    setFormError(null); setEditUser(u);
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            <i className="fa-solid fa-users" style={{ color: '#6366f1', marginRight: '0.5rem', fontSize: '1.6rem' }} />
            User Management
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontWeight: 600 }}>{users.length} registered users</p>
        </div>
        <button onClick={() => { setFormData(emptyForm); setFormError(null); setShowCreate(true); }} className="nb-btn nb-btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <i className="fa-solid fa-user-plus" style={{ marginRight: '0.4rem' }} /> Add User
        </button>
      </div>

      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {/* Users Table */}
      <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows rows={8} cols={6} />}
            {!loading && users.map(u => {
              const initials = (u.FullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px', height: '36px', fontSize: '0.75rem', borderRadius: '10px',
                        background: roleAvatarBg[u.role] || '#6366f1',
                        color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, flexShrink: 0,
                        border: '2px solid var(--border-color)',
                        boxShadow: '2px 2px 0 var(--shadow-color)',
                        fontFamily: 'var(--font-heading)',
                      }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: '700' }}>{u.FullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{u.UserName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{u.Email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{roleBadge(u.role)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="modal-badge" style={{
                      background: u.isActive !== false ? '#10b981' : '#ef4444',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '0.3rem 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                    }}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => openEdit(u)} style={{ padding: '0.3rem 0.55rem', background: 'rgba(59,130,246,0.08)', color: 'var(--info)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}><i className="fa-solid fa-pen-to-square" /></button>
                      <button onClick={() => { setFormError(null); setDeleteUser(u); }} style={{ padding: '0.3rem 0.55rem', background: 'rgba(239,68,68,0.08)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}><i className="fa-solid fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!loading && users.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={(n) => { setLimit(n); setPage(1); }}
          total={totalDocs}
        />
      )}

      {/* ═══ CREATE MODAL ═══ */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New User" size="md">
        <form onSubmit={handleCreate}>
          {formError && <div className="modal-error"><i className="fa-solid fa-triangle-exclamation" /> {formError}</div>}
          <div className="modal-row modal-row-2">
            <div className="modal-form-group">
              <label className="modal-label">Full Name</label>
              <input className="modal-input" required placeholder="John Doe" value={formData.FullName} onChange={e => setFormData({ ...formData, FullName: e.target.value })} />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">Username</label>
              <input className="modal-input" required placeholder="johndoe" value={formData.UserName} onChange={e => setFormData({ ...formData, UserName: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Email</label>
            <input className="modal-input" type="email" required placeholder="john@example.com" value={formData.Email} onChange={e => setFormData({ ...formData, Email: e.target.value })} />
          </div>
          <div className="modal-row modal-row-2">
            <div className="modal-form-group">
              <label className="modal-label">Password</label>
              <input className="modal-input" type="password" required placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">Confirm Password</label>
              <input className="modal-input" type="password" required placeholder="••••••••" value={formData.passwordConfirm} onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Role</label>
            <select className="modal-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">{formLoading ? 'Creating...' : <><i className="fa-solid fa-plus" /> Create User</>}</button>
        </form>
      </Modal>

      {/* ═══ EDIT MODAL ═══ */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit — ${editUser?.FullName}`} size="md">
        <form onSubmit={handleUpdate}>
          {formError && <div className="modal-error"><i className="fa-solid fa-triangle-exclamation" /> {formError}</div>}
          <div className="modal-profile-header">
            <div className="modal-profile-avatar">
              {(editUser?.FullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="modal-profile-info">
              <h3>{editUser?.FullName}</h3>
              <p>{editUser?.Email}</p>
            </div>
          </div>
          <div className="modal-row modal-row-2">
            <div className="modal-form-group">
              <label className="modal-label">Full Name</label>
              <input className="modal-input" value={formData.FullName} onChange={e => setFormData({ ...formData, FullName: e.target.value })} />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">Username</label>
              <input className="modal-input" value={formData.UserName} onChange={e => setFormData({ ...formData, UserName: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Email</label>
            <input className="modal-input" disabled value={formData.Email} />
            <p className="modal-hint">Email cannot be changed</p>
          </div>
          <div className="modal-section-label">Change Password (optional)</div>
          <div className="modal-row modal-row-2">
            <div className="modal-form-group">
              <label className="modal-label">New Password</label>
              <input className="modal-input" type="password" placeholder="Leave empty to keep" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">Confirm</label>
              <input className="modal-input" type="password" placeholder="Leave empty to keep" value={formData.passwordConfirm} onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Role</label>
            <select className="modal-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-info">{formLoading ? 'Saving...' : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}</button>
        </form>
      </Modal>

      {/* ═══ DELETE MODAL ═══ */}
      <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" size="sm">
        <div className="modal-warning-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
        <p className="modal-warning-text">Are you sure you want to deactivate <strong>{deleteUser?.FullName}</strong>?</p>
        <p className="modal-warning-sub">This is a soft delete — the user will be marked inactive.</p>
        {formError && <div className="modal-error"><i className="fa-solid fa-triangle-exclamation" /> {formError}</div>}
        <div className="modal-actions">
          <button onClick={() => setDeleteUser(null)} className="modal-btn modal-btn-ghost">Cancel</button>
          <button onClick={handleDelete} disabled={formLoading} className="modal-btn modal-btn-danger">{formLoading ? 'Deleting...' : <><i className="fa-solid fa-trash" /> Delete</>}</button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
