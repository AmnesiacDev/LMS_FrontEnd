import React, { useMemo, useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import { SkeletonTableRows } from '../../components/Skeleton/Skeleton';

const getLogs = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.logs)) return data.logs;
  if (Array.isArray(data?.docs)) return data.docs;
  return [];
};

const AuditLogsPage = () => {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useFetchData('/api/v1/audit-logs?sort=-createdAt&limit=100');
  const logs = getLogs(data);

  const filteredLogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return logs;
    return logs.filter((log) => {
      const actor = `${log.actor?.FullName || ''} ${log.actor?.Email || ''}`;
      const haystack = `${log.action || ''} ${log.targetModel || ''} ${log.targetId || ''} ${log.actorRole || ''} ${actor}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [logs, query]);

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Audit Logs</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>{filteredLogs.length} of {logs.length} events</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search action, actor, model..."
          style={{
            minWidth: '260px',
            padding: '0.65rem 0.85rem',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {!loading && filteredLogs.length === 0 && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>No audit logs found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Important system events will appear here.</p>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '0.8rem' }}>Time</th>
              <th style={{ padding: '0.8rem' }}>Actor</th>
              <th style={{ padding: '0.8rem' }}>Action</th>
              <th style={{ padding: '0.8rem' }}>Target</th>
              <th style={{ padding: '0.8rem' }}>IP</th>
              <th style={{ padding: '0.8rem' }}>Meta</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows rows={8} cols={6} />}
            {!loading && filteredLogs.map((log) => (
              <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)', verticalAlign: 'top' }}>
                <td style={{ padding: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                </td>
                <td style={{ padding: '0.8rem' }}>
                  <div style={{ fontWeight: 700 }}>{log.actor?.FullName || 'Unknown'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.actor?.Email || log.actorRole || '-'}</div>
                </td>
                <td style={{ padding: '0.8rem' }}>
                  <span className="modal-chip">{log.action}</span>
                </td>
                <td style={{ padding: '0.8rem' }}>
                  <div>{log.targetModel || '-'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.targetId || ''}</div>
                </td>
                <td style={{ padding: '0.8rem', color: 'var(--text-muted)' }}>{log.ip || '-'}</td>
                <td style={{ padding: '0.8rem', maxWidth: '320px' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {log.meta ? JSON.stringify(log.meta, null, 2) : '-'}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
