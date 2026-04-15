import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';

const SubmissionsPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const endpoint = (role === 'student' || role === 'parent') ? '/api/v1/submission/me' : '/api/v1/submission';
  const { data, loading, error } = useFetchData(endpoint);

  const submissions = Array.isArray(data) ? data : (data?.docs || data?.submissions || []);

  const statusStyles = {
    'Completed': { bg: 'rgba(16,185,129,0.1)', color: 'var(--success)' },
    'Pending': { bg: 'rgba(245,158,11,0.1)', color: 'var(--warning)' },
    'Reviewed': { bg: 'rgba(59,130,246,0.1)', color: 'var(--info)' },
    'Resubmitted': { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
    'Late submission': { bg: 'rgba(239,68,68,0.1)', color: 'var(--error)' },
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Submissions</h1>
        <span style={{ color: 'var(--text-muted)' }}>{submissions.length} total</span>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading submissions...</p>}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {!loading && submissions.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No submissions found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Submissions will appear here once tasks are submitted.</p>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Task</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Submitted</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Score</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Rating</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => {
              const st = statusStyles[sub.status] || statusStyles['Pending'];
              return (
                <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '500' }}>{sub.task?.title || '—'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-md)', background: st.bg, color: st.color, fontWeight: '600', fontSize: '0.8rem' }}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                    {sub.SubmissionDate ? new Date(sub.SubmissionDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                    {sub.review?.score !== undefined ? `${sub.review.score}/10` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontWeight: '500', color: 'var(--brand-primary)' }}>
                      {sub.review?.rating || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.note || sub.review?.comment || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsPage;
