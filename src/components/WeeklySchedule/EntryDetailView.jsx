import React, { useState, useEffect } from 'react';
import { formatLocalDateTime, formatDuration } from '../../utils/weekBoundary';
import { ENTRY_TYPE_COLORS } from './EntryCard';
import useScheduleApi from '../../hooks/useScheduleApi';

const fieldRow = (label, value) => (
  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
    <span style={{
      fontFamily: 'var(--font-body)',
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-muted)',
      minWidth: '80px',
      paddingTop: '0.05rem',
    }}>
      {label}
    </span>
    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>
      {value}
    </span>
  </div>
);

const EntryDetailView = ({ entryId, isManager, onClose, onEdit, onDelete }) => {
  const { getEntry } = useScheduleApi();
  const [loadState, setLoadState] = useState({ entryId: null, entry: null, error: null });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!entryId) return undefined;
    let cancelled = false;

    getEntry(entryId)
      .then(entry => {
        if (!cancelled) setLoadState({ entryId, entry, error: null });
      })
      .catch(error => {
        if (!cancelled) setLoadState({ entryId, entry: null, error: error.message });
      });

    return () => { cancelled = true; };
  }, [entryId, getEntry]);

  const isCurrentEntry = loadState.entryId === entryId;
  const entry = isCurrentEntry ? loadState.entry : null;
  const error = isCurrentEntry ? loadState.error : null;
  const loading = Boolean(entryId) && !isCurrentEntry;

  const typeColors = entry ? (ENTRY_TYPE_COLORS[entry.entryType] || {}) : {};

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.5rem' }} />
      <p style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>Loading entry…</p>
    </div>
  );

  if (error) {
    const is404 = error.includes('404') || error.toLowerCase().includes('not found');
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {is404 ? '🔍' : '⚠️'}
        </p>
        <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {is404 ? 'Entry not found.' : error}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'var(--brand-primary)',
            color: '#fff',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  if (!entry) return null;

  const instructor = typeof entry.instructorId === 'object' ? entry.instructorId : null;
  const canMutate = isManager && entry.entryType === 'custom';

  return (
    <div style={{ padding: '0.25rem 0' }}>
      {/* Type badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.65rem',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        background: typeColors.bg || 'var(--bg-secondary)',
        marginBottom: '1rem',
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: typeColors.accent || 'var(--text-primary)',
      }}>
        <i className={typeColors.icon || 'fa-solid fa-calendar'} />
        {typeColors.label || entry.entryType}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.3rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'var(--text-primary)',
      }}>
        {entry.title || entry.subject}
      </h3>

      {/* Fields */}
      {fieldRow('Subject', entry.subject || '—')}
      {fieldRow('Status', entry.status || '—')}
      {fieldRow('Start', formatLocalDateTime(entry.startAt))}
      {fieldRow('End', formatLocalDateTime(entry.endAt))}
      {fieldRow('Duration', formatDuration(entry.startAt, entry.endAt))}
      {instructor && fieldRow('Instructor', instructor.FullName || instructor.UserName || '—')}
      {entry.notes && fieldRow('Notes', entry.notes)}
      {entry.color && fieldRow('Color', (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            display: 'inline-block',
            width: '14px', height: '14px',
            background: entry.color,
            border: '2px solid var(--border-color)',
            borderRadius: '2px',
          }} />
          {entry.color}
        </span>
      ))}

      {/* Links */}
      {entry.sessionId && (
        <div style={{ marginTop: '0.5rem' }}>
          <a
            href={`/dashboard/sessions`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)',
              textDecoration: 'underline',
            }}
          >
            <i className="fa-solid fa-calendar-days" /> View Session
          </a>
        </div>
      )}
      {entry.taskId && (
        <div style={{ marginTop: '0.35rem' }}>
          <a
            href={`/dashboard/tasks`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)',
              textDecoration: 'underline',
            }}
          >
            <i className="fa-solid fa-list-check" /> View Task
          </a>
        </div>
      )}

      {/* Manager controls */}
      {canMutate && !confirmDelete && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => onEdit?.(entry)}
            style={{
              flex: 1,
              padding: '0.55rem 1rem',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            <i className="fa-solid fa-pen-to-square" /> Edit
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              flex: 1,
              padding: '0.55rem 1rem',
              background: 'var(--error)',
              color: '#fff',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            <i className="fa-solid fa-trash" /> Delete
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          background: 'rgba(251,113,133,0.1)',
          border: '2px solid var(--error)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Delete "{entry.title}"? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { onDelete?.(entry); onClose?.(); }}
              style={{
                flex: 1, padding: '0.5rem', background: 'var(--error)', color: '#fff',
                border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                flex: 1, padding: '0.5rem', background: 'var(--card-bg)', color: 'var(--text-primary)',
                border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryDetailView;
