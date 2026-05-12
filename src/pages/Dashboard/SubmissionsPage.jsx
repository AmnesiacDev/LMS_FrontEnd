import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';
import { useApiRequest } from '../../hooks/useApiRequest';

const normalizeSubmissions = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.submissions)) return data.submissions;
  return [];
};

const statusStyles = {
  Completed: { bg: 'rgba(16,185,129,0.1)', color: 'var(--success)' },
  Pending: { bg: 'rgba(245,158,11,0.1)', color: 'var(--warning)' },
  Reviewed: { bg: 'rgba(59,130,246,0.1)', color: 'var(--info)' },
  Resubmitted: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  'Late submission': { bg: 'rgba(239,68,68,0.1)', color: 'var(--error)' },
};

const SubmissionsPage = () => {
  const { user } = useAuth();
  const { request, requestFormData } = useApiRequest();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin' || role === 'instructor';
  const isParent = role === 'parent';
  const canFilterByStudent = isAdmin || isParent;
  const canUpload = role === 'student' || role === 'instructor' || role === 'admin';
  const canDeleteFiles = role === 'instructor' || role === 'admin';

  const [uploadingId, setUploadingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [studentFilter, setStudentFilter] = useState('');
  const endpoint = (role === 'student' || role === 'parent') ? '/api/v1/submission/me' : '/api/v1/submission';
  const { data, loading, error, refetch } = useFetchData(endpoint);

  const allSubmissions = normalizeSubmissions(data);
  const submissions = allSubmissions.filter(sub => {
    if (!studentFilter) return true;
    const name = sub.studentProfileId?.user?.FullName || sub.student?.FullName || '';
    return name.toLowerCase().includes(studentFilter.toLowerCase());
  });

  const handleUpload = async (submissionId, files) => {
    if (!files || files.length === 0) return;
    if (files.length > 5) {
      setActionError('You can upload up to 5 files at once.');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    setUploadingId(submissionId);
    setActionError(null);
    try {
      await requestFormData(`/api/v1/submission/${submissionId}/files`, 'POST', formData);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteFile = async (submissionId, publicId) => {
    if (!publicId) return;
    setUploadingId(submissionId);
    setActionError(null);
    try {
      await request(`/api/v1/submission/${submissionId}/files?publicId=${encodeURIComponent(publicId)}`, 'DELETE');
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Submissions</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{submissions.length} total</p>
        </div>
        {isAdmin && (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Filter by student name..."
              value={studentFilter}
              onChange={e => setStudentFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem 0.5rem 2.2rem',
                border: '1px solid var(--border-color)',
                borderRadius: '100px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                width: '220px',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none' }}>🔍</span>
          </div>
        )}
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading submissions...</p>}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
      {actionError && <div className="modal-error" style={{ marginBottom: '1rem' }}>{actionError}</div>}

      {!loading && submissions.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No submissions found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Submissions will appear here once tasks are submitted.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
        {submissions.map((sub) => {
          const st = statusStyles[sub.status] || statusStyles.Pending;
          const attachments = sub.fileAttachments || [];
          const links = sub.Task_links || [];

          return (
            <section key={sub._id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.05rem' }}>{sub.task?.title || 'Untitled task'}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Submitted: {sub.SubmissionDate ? new Date(sub.SubmissionDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-md)', background: st.bg, color: st.color, fontWeight: 700, fontSize: '0.8rem' }}>
                  {sub.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>Score</div>
                  <div style={{ fontWeight: 700 }}>{sub.review?.score !== undefined ? `${sub.review.score}/10` : '-'}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>Rating</div>
                  <div style={{ fontWeight: 700 }}>{sub.review?.rating || '-'}</div>
                </div>
              </div>

              {(sub.note || sub.review?.comment) && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sub.note || sub.review?.comment}</p>
              )}

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Links</h4>
                {links.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No links submitted.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {links.map((link, index) => (
                      <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                        {link.name || link.url}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Files</h4>
                {attachments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No files uploaded.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {attachments.map((file) => (
                      <div key={file.publicId || file.url} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', padding: '0.6rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        <a href={file.url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name || file.format || 'Attachment'}
                        </a>
                        {canDeleteFiles && file.publicId && (
                          <button className="modal-btn modal-btn-danger" style={{ padding: '0.35rem 0.55rem', width: 'auto' }} disabled={uploadingId === sub._id} onClick={() => handleDeleteFile(sub._id, file.publicId)}>
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {canUpload && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border-color)' }}>
                  <label className="modal-label">Upload files</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem',
                    background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)', cursor: uploadingId === sub._id ? 'not-allowed' : 'pointer',
                    boxShadow: '2px 2px 0px 0px var(--shadow-color)', transition: 'all 0.1s ease',
                    opacity: uploadingId === sub._id ? 0.6 : 1,
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem',
                      background: 'var(--brand-primary)', color: '#fff', border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem',
                      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>📎 Choose Files</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Drop or browse files
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,video/*"
                      disabled={uploadingId === sub._id}
                      onChange={(event) => handleUpload(sub._id, event.target.files)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p className="modal-hint">Up to 5 files, 10MB each. Images, PDFs, and videos are supported.</p>
                  {uploadingId === sub._id && <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Uploading...</p>}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionsPage;
