import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { SkeletonCardGrid } from '../../components/Skeleton/Skeleton';
import { useApiRequest } from '../../hooks/useApiRequest';
import './DashboardOverview.css';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const emptyForm = {
  title: '',
  description: '',
  totalMark: 100,
  passingMark: 50,
  score: '',
  date: '',
  studentProfileId: '',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const calcPercentage = (score, total) => {
  if (score == null || total == null || total === 0) return null;
  return Math.round((Number(score) / Number(total)) * 100);
};

const verdict = (score, total, passing) => {
  if (score == null) return { label: 'Ungraded', color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
  if (Number(score) >= Number(passing)) return { label: 'Passed', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
  return { label: 'Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
};

/* ── Single exam card ────────────────────────────────────────────────────── */

const ExamCard = ({ exam, canManage, onEdit, onDelete }) => {
  const pct = calcPercentage(exam.score, exam.totalMark);
  const v = verdict(exam.score, exam.totalMark, exam.passingMark);
  const studentName = exam.studentProfileId?.user?.FullName || exam.studentProfileId?.user?.UserName;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '3px solid var(--border-color)',
        boxShadow: '4px 4px 0 var(--shadow-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
            {exam.title}
          </h3>
          {studentName && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-user" style={{ marginRight: '0.3rem' }} /> {studentName}
            </p>
          )}
        </div>
        <span style={{
          padding: '0.25rem 0.7rem',
          background: v.bg,
          color: v.color,
          fontSize: '0.72rem',
          fontWeight: 800,
          borderRadius: '100px',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>{v.label}</span>
      </div>

      {exam.description && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {exam.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.5rem',
        padding: '0.75rem',
        background: 'var(--bg-tertiary)',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
      }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: v.color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
          {exam.score != null ? exam.score : '—'}
        </span>
        <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          / {exam.totalMark}
        </span>
        {pct != null && (
          <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 700, color: v.color }}>
            {pct}%
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span><i className="fa-solid fa-calendar-day" /> {formatDate(exam.date)}</span>
        <span><i className="fa-solid fa-flag-checkered" /> Passing: {exam.passingMark}</span>
      </div>

      {canManage && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button onClick={() => onEdit(exam)} className="modal-btn modal-btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
            <i className="fa-solid fa-pen" /> Edit
          </button>
          <button onClick={() => onDelete(exam)} className="modal-btn modal-btn-danger" style={{ flex: 1, padding: '0.5rem' }}>
            <i className="fa-solid fa-trash" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main page ───────────────────────────────────────────────────────────── */

const ExamsPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = user?.role || 'student';
  const canManage = role === 'admin' || role === 'instructor';
  const isMine = role === 'student' || role === 'parent';

  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const [verdictFilter, setVerdictFilter] = useState('all');

  const [showCreate, setShowCreate] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [deleteExam, setDeleteExam] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const endpoint = isMine ? '/api/v1/exam/my-exams' : '/api/v1/exam';
      const data = await request(endpoint);
      const list = data.data?.exams || data.exams || [];
      setExams(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!canManage) return;
    try {
      const data = await request(
        role === 'instructor' ? '/api/v1/session/me/students' : '/api/v1/StudentProfile/all'
      );
      const list = data.data?.students || data.data?.profiles || data.data?.docs ||
                   data.students || data.docs || [];
      setStudents(Array.isArray(list) ? list : []);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    fetchExams();
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Filters ── */
  const filtered = useMemo(() => exams.filter(exam => {
    if (search && !exam.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (studentFilter !== 'all') {
      const id = exam.studentProfileId?._id || exam.studentProfileId;
      if (id !== studentFilter) return false;
    }
    if (verdictFilter !== 'all') {
      const v = verdict(exam.score, exam.totalMark, exam.passingMark).label.toLowerCase();
      if (v !== verdictFilter) return false;
    }
    return true;
  }), [exams, search, studentFilter, verdictFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const scored = exams.filter(e => e.score != null);
    const passed = scored.filter(e => Number(e.score) >= Number(e.passingMark));
    const avgPct = scored.length === 0
      ? 0
      : Math.round(scored.reduce((acc, e) => acc + (Number(e.score) / Number(e.totalMark)) * 100, 0) / scored.length);
    return {
      total: exams.length,
      scored: scored.length,
      passed: passed.length,
      failed: scored.length - passed.length,
      passRate: scored.length === 0 ? 0 : Math.round((passed.length / scored.length) * 100),
      avgPct,
    };
  }, [exams]);

  /* ── Form handlers ── */
  const buildPayload = () => {
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      totalMark: Number(formData.totalMark),
      passingMark: Number(formData.passingMark),
      studentProfileId: formData.studentProfileId,
      date: formData.date || undefined,
    };
    if (formData.score !== '' && formData.score != null) payload.score = Number(formData.score);
    return payload;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await request('/api/v1/exam', 'POST', buildPayload());
      setShowCreate(false);
      setFormData(emptyForm);
      await fetchExams();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await request(`/api/v1/exam/${editExam._id}`, 'PATCH', buildPayload());
      setEditExam(null);
      setFormData(emptyForm);
      await fetchExams();
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
      await request(`/api/v1/exam/${deleteExam._id}`, 'DELETE');
      setDeleteExam(null);
      await fetchExams();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setFormError(null);
    setShowCreate(true);
  };

  const openEdit = (exam) => {
    setFormData({
      title: exam.title || '',
      description: exam.description || '',
      totalMark: exam.totalMark ?? 100,
      passingMark: exam.passingMark ?? 50,
      score: exam.score ?? '',
      date: exam.date ? new Date(exam.date).toISOString().slice(0, 10) : '',
      studentProfileId: exam.studentProfileId?._id || exam.studentProfileId || '',
    });
    setFormError(null);
    setEditExam(exam);
  };

  /* ── Form fields (shared between create and edit) ── */
  const renderFormFields = () => (
    <>
      <div className="modal-form-group">
        <label className="modal-label">Exam Title</label>
        <input
          className="modal-input"
          required
          placeholder="e.g. Mid-term Algebra"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="modal-form-group">
        <label className="modal-label">Description</label>
        <textarea
          className="modal-textarea"
          placeholder="Topics covered, format, notes…"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="modal-row modal-row-2">
        <div className="modal-form-group">
          <label className="modal-label">Student</label>
          <select
            className="modal-select"
            required
            value={formData.studentProfileId}
            onChange={e => setFormData({ ...formData, studentProfileId: e.target.value })}
          >
            <option value="">Choose a student</option>
            {students.map(p => (
              <option key={p._id} value={p._id}>
                {p.user?.FullName || p.user?.UserName || p._id}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Exam Date</label>
          <input
            className="modal-input"
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>
      <div className="modal-row modal-row-3">
        <div className="modal-form-group">
          <label className="modal-label">Total Mark</label>
          <input
            className="modal-input"
            type="number"
            min="1"
            required
            value={formData.totalMark}
            onChange={e => setFormData({ ...formData, totalMark: e.target.value })}
          />
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Passing Mark</label>
          <input
            className="modal-input"
            type="number"
            min="0"
            required
            value={formData.passingMark}
            onChange={e => setFormData({ ...formData, passingMark: e.target.value })}
          />
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Score (optional)</label>
          <input
            className="modal-input"
            type="number"
            min="0"
            placeholder="Leave blank to set later"
            value={formData.score}
            onChange={e => setFormData({ ...formData, score: e.target.value })}
          />
        </div>
      </div>
    </>
  );

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>
            <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--brand-primary)', marginRight: '0.5rem' }} />
            Exams
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            {exams.length} total {exams.length === 1 ? 'exam' : 'exams'}
            {stats.scored > 0 && ` · ${stats.passRate}% pass rate · ${stats.avgPct}% avg`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="modal-btn modal-btn-primary"
            style={{ width: 'auto', padding: '0.65rem 1.4rem' }}
          >
            <i className="fa-solid fa-plus" /> Create Exam
          </button>
        )}
      </div>

      {/* ── Stats strip ── */}
      {exams.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><i className="fa-solid fa-pen-to-square" /></div>
            <div className="stat-info"><h3>{stats.total}</h3><p>Total Exams</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><i className="fa-solid fa-circle-check" /></div>
            <div className="stat-info"><h3>{stats.passed}</h3><p>Passed</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><i className="fa-solid fa-circle-xmark" /></div>
            <div className="stat-info"><h3>{stats.failed}</h3><p>Failed</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><i className="fa-solid fa-percent" /></div>
            <div className="stat-info"><h3>{stats.avgPct}%</h3><p>Average</p></div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <input
            type="text"
            placeholder="Search exam title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              border: '2px solid var(--border-color)',
              borderRadius: '100px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}>
            <i className="fa-solid fa-magnifying-glass" />
          </span>
        </div>

        {canManage && students.length > 0 && (
          <select
            value={studentFilter}
            onChange={e => setStudentFilter(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              border: '2px solid var(--border-color)',
              borderRadius: '100px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="all">All students</option>
            {students.map(p => (
              <option key={p._id} value={p._id}>
                {p.user?.FullName || p.user?.UserName || p._id}
              </option>
            ))}
          </select>
        )}

        <select
          value={verdictFilter}
          onChange={e => setVerdictFilter(e.target.value)}
          style={{
            padding: '0.55rem 1rem',
            border: '2px solid var(--border-color)',
            borderRadius: '100px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            outline: 'none',
          }}
        >
          <option value="all">All results</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="ungraded">Ungraded</option>
        </select>
      </div>

      {/* ── Body ── */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)', color: '#ef4444', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <i className="fa-solid fa-pen-to-square" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            {exams.length === 0 ? 'No exams yet' : 'No matches'}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {exams.length === 0
              ? (canManage ? 'Click "Create Exam" to add the first one.' : 'You don\'t have any exam records yet.')
              : 'Try a different search or filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(exam => (
            <ExamCard
              key={exam._id}
              exam={exam}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={setDeleteExam}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Exam" size="lg">
        <form onSubmit={handleCreate}>
          {renderFormFields()}
          {formError && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{formError}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setShowCreate(false)} className="modal-btn modal-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">
              {formLoading ? 'Creating…' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editExam} onClose={() => setEditExam(null)} title="Edit Exam" size="lg">
        <form onSubmit={handleUpdate}>
          {renderFormFields()}
          {formError && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{formError}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setEditExam(null)} className="modal-btn modal-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">
              {formLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={!!deleteExam} onClose={() => setDeleteExam(null)} title="Delete Exam">
        <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong>{deleteExam?.title}</strong>? This action cannot be undone.
        </p>
        {formError && <p style={{ color: '#ef4444' }}>{formError}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setDeleteExam(null)} className="modal-btn modal-btn-secondary">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={formLoading} className="modal-btn modal-btn-danger">
            {formLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ExamsPage;
