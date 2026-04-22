import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { useApiRequest } from '../../hooks/useApiRequest';

const hwStatusStyles = {
  'Completed': { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  'Pending': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  'Canceled': { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  'Late submission': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

const ExternalCoursesPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin' || role === 'instructor';
  const isStudent = role === 'student';

  const [activeTab, setActiveTab] = useState('courses');

  // Courses
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const emptyCourseForm = { teacher: '', subject: '', studentProfileId: '', color: '#10b981' };
  const [courseForm, setCourseForm] = useState(emptyCourseForm);

  // Homework
  const [homeworks, setHomeworks] = useState([]);
  const [hwLoading, setHwLoading] = useState(true);
  const [hwError, setHwError] = useState(null);
  const [showCreateHw, setShowCreateHw] = useState(false);
  const [editHw, setEditHw] = useState(null);
  const [deleteHw, setDeleteHw] = useState(null);
  const [markCompleteHw, setMarkCompleteHw] = useState(null);
  const emptyHwForm = { title: '', description: '', dueDate: '', externalCourse: '', category: 'Project' };
  const [hwForm, setHwForm] = useState(emptyHwForm);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [completeLinks, setCompleteLinks] = useState([{ name: '', url: '' }]);

  // ─── FETCH ──────────────────────────────────────────────────────────────────
  const fetchCourses = async () => {
    try { setCoursesLoading(true);
      const data = await request((role === 'student' || role === 'parent') ? '/api/v1/external-course/my-course' : '/api/v1/external-course');
      const list = data.data?.docs || data.data?.courses || (Array.isArray(data.data) ? data.data : []);
      setCourses(Array.isArray(list) ? list : [list]); setCoursesError(null);
    } catch (err) { setCoursesError(err.message); } finally { setCoursesLoading(false); }
  };

  const fetchHomeworks = async () => {
    try { setHwLoading(true);
      const data = await request((role === 'student' || role === 'parent') ? '/api/v1/external-hw/my' : '/api/v1/external-hw');
      const list = data.data?.docs || (Array.isArray(data.data) ? data.data : []);
      setHomeworks(Array.isArray(list) ? list : [list]); setHwError(null);
    } catch (err) { setHwError(err.message); } finally { setHwLoading(false); }
  };

  useEffect(() => { fetchCourses(); fetchHomeworks(); }, []);

  // ─── COURSE CRUD ────────────────────────────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = { subject: courseForm.subject, studentProfileId: courseForm.studentProfileId, createdBy: user?._id };
      if (courseForm.teacher) payload.teacher = courseForm.teacher;
      if (courseForm.color) payload.color = courseForm.color;
      await request('/api/v1/external-course', 'POST', payload);
      setShowCreateCourse(false); setCourseForm(emptyCourseForm); await fetchCourses();
    } catch (err) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = {};
      if (courseForm.subject) payload.subject = courseForm.subject;
      if (courseForm.teacher) payload.teacher = courseForm.teacher;
      if (courseForm.color) payload.color = courseForm.color;
      await request(`/api/v1/external-course/${editCourse._id}`, 'PATCH', payload);
      setEditCourse(null); await fetchCourses();
    } catch (err) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const handleDeleteCourse = async () => {
    setFormLoading(true); setFormError(null);
    try { await request(`/api/v1/external-course/${deleteCourse._id}`, 'DELETE'); setDeleteCourse(null); await fetchCourses(); }
    catch (err) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  // ─── HW CRUD ────────────────────────────────────────────────────────────────
  const handleCreateHw = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      await request('/api/v1/external-hw', 'POST', { title: hwForm.title, description: hwForm.description, dueDate: hwForm.dueDate, externalCourse: hwForm.externalCourse, category: hwForm.category });
      setShowCreateHw(false); setHwForm(emptyHwForm); await fetchHomeworks();
    } catch (err) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const handleUpdateHw = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const payload = {};
      if (hwForm.title) payload.title = hwForm.title;
      if (hwForm.description) payload.description = hwForm.description;
      if (hwForm.dueDate) payload.dueDate = hwForm.dueDate;
      if (hwForm.category) payload.category = hwForm.category;
      await request(`/api/v1/external-hw/${editHw._id}`, 'PATCH', payload);
      setEditHw(null); await fetchHomeworks();
    } catch (err) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const handleDeleteHw = async () => {
    setFormLoading(true); setFormError(null);
    try { await request(`/api/v1/external-hw/${deleteHw._id}`, 'DELETE'); setDeleteHw(null); await fetchHomeworks(); }
    catch (err) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const handleMarkComplete = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError(null);
    try {
      const valid = completeLinks.filter(l => l.name.trim() && l.url.trim());
      if (!valid.length) { setFormError('At least one submission link is required'); setFormLoading(false); return; }
      await request(`/api/v1/external-hw/${markCompleteHw._id}/complete`, 'PATCH', { submissionLinks: valid });
      setMarkCompleteHw(null); await fetchHomeworks();
    } catch (err) { setFormError(err.message); } finally { setFormLoading(false); }
  };

  const updateCompleteLink = (i, field, val) => { const u = [...completeLinks]; u[i] = { ...u[i], [field]: val }; setCompleteLinks(u); };
  const addCompleteLink = () => setCompleteLinks([...completeLinks, { name: '', url: '' }]);
  const removeCompleteLink = (i) => { const u = completeLinks.filter((_, idx) => idx !== i); setCompleteLinks(u.length ? u : [{ name: '', url: '' }]); };

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', margin: '0 0 1.5rem' }}>External Courses & Homework</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
        {[{ key: 'courses', label: `📚 Courses (${courses.length})` }, { key: 'homework', label: `📝 Homework (${homeworks.length})` }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '0.6rem 1.5rem', background: activeTab === t.key ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
            color: activeTab === t.key ? 'white' : 'var(--text-secondary)',
            border: activeTab === t.key ? 'none' : '1px solid var(--border-color)',
            borderRadius: '100px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.15s ease',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ COURSES TAB ═══ */}
      {activeTab === 'courses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            {(isAdmin || role === 'parent') && <button onClick={() => { setCourseForm(emptyCourseForm); setFormError(null); setShowCreateCourse(true); }} className="modal-btn modal-btn-primary" style={{ width: 'auto', padding: '0.6rem 1.3rem' }}>➕ Add Course</button>}
          </div>
          {coursesLoading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
          {coursesError && <p style={{ color: 'var(--error)' }}>{coursesError}</p>}
          {!coursesLoading && !courses.length && <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}><h3>No courses found</h3></div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {courses.map(c => (
              <div key={c._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderTop: `4px solid ${c.color || '#10b981'}` }}>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem' }}>{c.subject}</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 0.75rem', fontSize: '0.88rem' }}>{c.teacher ? `👨‍🏫 ${c.teacher}` : 'No teacher'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.color || '#10b981' }}></div>{c.color || '#10b981'}
                </div>
                {(isAdmin || role === 'parent') && (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => { setCourseForm({ teacher: c.teacher || '', subject: c.subject || '', studentProfileId: '', color: c.color || '#10b981' }); setFormError(null); setEditCourse(c); }} style={{ flex: 1, padding: '0.4rem', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>✏️ Edit</button>
                    <button onClick={() => { setFormError(null); setDeleteCourse(c); }} style={{ flex: 1, padding: '0.4rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══ HOMEWORK TAB ═══ */}
      {activeTab === 'homework' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            {isAdmin && <button onClick={() => { setHwForm(emptyHwForm); setFormError(null); setShowCreateHw(true); }} className="modal-btn modal-btn-primary" style={{ width: 'auto', padding: '0.6rem 1.3rem' }}>➕ Add Homework</button>}
          </div>
          {hwLoading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
          {hwError && <p style={{ color: 'var(--error)' }}>{hwError}</p>}
          {!hwLoading && !homeworks.length && <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}><h3>No homework found</h3></div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: '1.5rem' }}>
            {homeworks.map(hw => {
              const st = hwStatusStyles[hw.status] || hwStatusStyles['Pending'];
              const courseName = hw.externalCourse?.subject || 'Unknown';
              const courseColor = hw.externalCourse?.color || '#10b981';
              return (
                <div key={hw._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderTop: `4px solid ${courseColor}`, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h3 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem' }}>{hw.title || 'Untitled'}</h3><p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{courseName}<span> • {hw.externalCourse?.teacher || ''}</span></p></div>
                    <span className="modal-badge" style={{ background: st.bg, color: st.color }}>{hw.status}</span>
                  </div>
                  {hw.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>{hw.description}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {hw.dueDate && <span>📅 Due: <strong>{new Date(hw.dueDate).toLocaleDateString()}</strong></span>}
                    {hw.category && <span>🏷️ {hw.category}</span>}
                    {hw.isSubmitted && hw.submissionDate && <span>✅ Submitted: {new Date(hw.submissionDate).toLocaleDateString()}</span>}
                  </div>
                  {hw.submissionLinks?.length > 0 && <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>{hw.submissionLinks.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noreferrer" className="modal-chip" style={{ color: '#10b981', fontSize: '0.78rem' }}>🔗 {l.name || 'Link'}</a>)}</div>}
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    {isStudent && hw.status === 'Pending' && <button onClick={() => { setCompleteLinks([{ name: '', url: '' }]); setFormError(null); setMarkCompleteHw(hw); }} style={{ flex: 1, padding: '0.4rem', background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>✅ Submit</button>}
                    {isAdmin && (<>
                      <button onClick={() => { setHwForm({ title: hw.title || '', description: hw.description || '', dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().slice(0, 16) : '', externalCourse: hw.externalCourse?._id || '', category: hw.category || 'Project' }); setFormError(null); setEditHw(hw); }} style={{ flex: 1, padding: '0.4rem', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>✏️ Edit</button>
                      <button onClick={() => { setFormError(null); setDeleteHw(hw); }} style={{ flex: 1, padding: '0.4rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>🗑️ Delete</button>
                    </>)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══ MODALS ═══ */}
      {/* Create Course */}
      <Modal isOpen={showCreateCourse} onClose={() => setShowCreateCourse(false)} title="Add External Course" size="md">
        <form onSubmit={handleCreateCourse}>
          {formError && <div className="modal-error">⚠️ {formError}</div>}
          <div className="modal-form-group"><label className="modal-label">Subject</label><input className="modal-input" required value={courseForm.subject} onChange={e => setCourseForm({ ...courseForm, subject: e.target.value })} placeholder="e.g. Mathematics" /></div>
          <div className="modal-form-group"><label className="modal-label">Teacher</label><input className="modal-input" value={courseForm.teacher} onChange={e => setCourseForm({ ...courseForm, teacher: e.target.value })} placeholder="Teacher name" /></div>
          <div className="modal-form-group"><label className="modal-label">Student Profile ID</label><input className="modal-input" required value={courseForm.studentProfileId} onChange={e => setCourseForm({ ...courseForm, studentProfileId: e.target.value })} placeholder="ObjectId" /></div>
          <div className="modal-form-group"><label className="modal-label">Color</label><div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><input type="color" value={courseForm.color} onChange={e => setCourseForm({ ...courseForm, color: e.target.value })} style={{ width: '48px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: '8px' }} /><span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontFamily: 'monospace' }}>{courseForm.color}</span></div></div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">{formLoading ? 'Creating...' : '➕ Create Course'}</button>
        </form>
      </Modal>

      {/* Edit Course */}
      <Modal isOpen={!!editCourse} onClose={() => setEditCourse(null)} title={`Edit — ${editCourse?.subject}`} size="md">
        <form onSubmit={handleUpdateCourse}>
          {formError && <div className="modal-error">⚠️ {formError}</div>}
          <div className="modal-form-group"><label className="modal-label">Subject</label><input className="modal-input" value={courseForm.subject} onChange={e => setCourseForm({ ...courseForm, subject: e.target.value })} /></div>
          <div className="modal-form-group"><label className="modal-label">Teacher</label><input className="modal-input" value={courseForm.teacher} onChange={e => setCourseForm({ ...courseForm, teacher: e.target.value })} /></div>
          <div className="modal-form-group"><label className="modal-label">Color</label><div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><input type="color" value={courseForm.color} onChange={e => setCourseForm({ ...courseForm, color: e.target.value })} style={{ width: '48px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: '8px' }} /><span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontFamily: 'monospace' }}>{courseForm.color}</span></div></div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-info">{formLoading ? 'Saving...' : '💾 Save Changes'}</button>
        </form>
      </Modal>

      {/* Delete Course */}
      <Modal isOpen={!!deleteCourse} onClose={() => setDeleteCourse(null)} title="Delete Course" size="sm">
        <div className="modal-warning-icon">⚠️</div>
        <p className="modal-warning-text">Delete <strong>{deleteCourse?.subject}</strong>?</p>
        <p className="modal-warning-sub">This is permanent.</p>
        {formError && <div className="modal-error">⚠️ {formError}</div>}
        <div className="modal-actions"><button onClick={() => setDeleteCourse(null)} className="modal-btn modal-btn-ghost">Cancel</button><button onClick={handleDeleteCourse} disabled={formLoading} className="modal-btn modal-btn-danger">{formLoading ? 'Deleting...' : '🗑️ Delete'}</button></div>
      </Modal>

      {/* Create HW */}
      <Modal isOpen={showCreateHw} onClose={() => setShowCreateHw(false)} title="Add Homework" size="lg">
        <form onSubmit={handleCreateHw}>
          {formError && <div className="modal-error">⚠️ {formError}</div>}
          <div className="modal-form-group"><label className="modal-label">Title</label><input className="modal-input" required value={hwForm.title} onChange={e => setHwForm({ ...hwForm, title: e.target.value })} placeholder="Homework title" /></div>
          <div className="modal-form-group"><label className="modal-label">Description</label><textarea className="modal-textarea" value={hwForm.description} onChange={e => setHwForm({ ...hwForm, description: e.target.value })} placeholder="Description" /></div>
          <div className="modal-row modal-row-2">
            <div className="modal-form-group"><label className="modal-label">Due Date</label><input className="modal-input" type="datetime-local" required value={hwForm.dueDate} onChange={e => setHwForm({ ...hwForm, dueDate: e.target.value })} /></div>
            <div className="modal-form-group"><label className="modal-label">Category</label><select className="modal-select" value={hwForm.category} onChange={e => setHwForm({ ...hwForm, category: e.target.value })}><option value="Essay">Essay</option><option value="Project">Project</option><option value="Quiz">Quiz</option><option value="Lab">Lab</option><option value="Presentation">Presentation</option><option value="Other">Other</option></select></div>
          </div>
          <div className="modal-form-group"><label className="modal-label">External Course ID</label><input className="modal-input" required value={hwForm.externalCourse} onChange={e => setHwForm({ ...hwForm, externalCourse: e.target.value })} placeholder="ObjectId" /></div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">{formLoading ? 'Creating...' : '➕ Create Homework'}</button>
        </form>
      </Modal>

      {/* Edit HW */}
      <Modal isOpen={!!editHw} onClose={() => setEditHw(null)} title={`Edit — ${editHw?.title}`} size="lg">
        <form onSubmit={handleUpdateHw}>
          {formError && <div className="modal-error">⚠️ {formError}</div>}
          <div className="modal-form-group"><label className="modal-label">Title</label><input className="modal-input" value={hwForm.title} onChange={e => setHwForm({ ...hwForm, title: e.target.value })} /></div>
          <div className="modal-form-group"><label className="modal-label">Description</label><textarea className="modal-textarea" value={hwForm.description} onChange={e => setHwForm({ ...hwForm, description: e.target.value })} /></div>
          <div className="modal-row modal-row-2">
            <div className="modal-form-group"><label className="modal-label">Due Date</label><input className="modal-input" type="datetime-local" value={hwForm.dueDate} onChange={e => setHwForm({ ...hwForm, dueDate: e.target.value })} /></div>
            <div className="modal-form-group"><label className="modal-label">Category</label><select className="modal-select" value={hwForm.category} onChange={e => setHwForm({ ...hwForm, category: e.target.value })}><option value="Essay">Essay</option><option value="Project">Project</option><option value="Quiz">Quiz</option><option value="Lab">Lab</option><option value="Presentation">Presentation</option><option value="Other">Other</option></select></div>
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-info">{formLoading ? 'Saving...' : '💾 Save Changes'}</button>
        </form>
      </Modal>

      {/* Delete HW */}
      <Modal isOpen={!!deleteHw} onClose={() => setDeleteHw(null)} title="Delete Homework" size="sm">
        <div className="modal-warning-icon">⚠️</div>
        <p className="modal-warning-text">Delete <strong>"{deleteHw?.title}"</strong>?</p>
        <p className="modal-warning-sub">This is permanent.</p>
        {formError && <div className="modal-error">⚠️ {formError}</div>}
        <div className="modal-actions"><button onClick={() => setDeleteHw(null)} className="modal-btn modal-btn-ghost">Cancel</button><button onClick={handleDeleteHw} disabled={formLoading} className="modal-btn modal-btn-danger">{formLoading ? 'Deleting...' : '🗑️ Delete'}</button></div>
      </Modal>

      {/* Mark Complete (Student) */}
      <Modal isOpen={!!markCompleteHw} onClose={() => setMarkCompleteHw(null)} title={`Submit — ${markCompleteHw?.title}`} size="md">
        <form onSubmit={handleMarkComplete}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.92rem' }}>Add your submission links to mark as complete.</p>
          {formError && <div className="modal-error">⚠️ {formError}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="modal-label" style={{ margin: 0 }}>Submission Links</label>
            <button type="button" onClick={addCompleteLink} className="modal-add-btn">+ Add</button>
          </div>
          {completeLinks.map((l, i) => (
            <div key={i} className="modal-link-row">
              <input className="modal-input" placeholder="Name" required value={l.name} onChange={e => updateCompleteLink(i, 'name', e.target.value)} />
              <input className="modal-input" style={{ flex: 2 }} placeholder="https://..." type="url" required value={l.url} onChange={e => updateCompleteLink(i, 'url', e.target.value)} />
              {completeLinks.length > 1 && <button type="button" onClick={() => removeCompleteLink(i)} className="modal-link-remove">✕</button>}
            </div>
          ))}
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-success" style={{ marginTop: '0.75rem' }}>{formLoading ? 'Submitting...' : '✅ Mark as Complete'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default ExternalCoursesPage;
