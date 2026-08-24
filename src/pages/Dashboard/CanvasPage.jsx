import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApiRequest } from '../../hooks/useApiRequest';
import { SkeletonCardList } from '../../components/Skeleton/Skeleton';
import { sanitizeErrorMessage } from '../../utils/errorSanitizer';

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  title: { fontFamily: 'var(--font-heading)', fontSize: '2rem', margin: 0, fontWeight: 400 },
  subtitle: { color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem', fontWeight: 600 },
  controls: {
    display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
    flexWrap: 'wrap', alignItems: 'center',
  },
  select: {
    flex: 1, minWidth: '240px', maxWidth: '420px',
    padding: '0.55rem 0.85rem', border: '3px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', background: 'var(--card-bg)',
    color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600,
    fontFamily: 'var(--font-body)', outline: 'none',
    boxShadow: '2px 2px 0px 0px var(--shadow-color)', cursor: 'pointer',
  },
  button: (variant) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    padding: '0.6rem 1.25rem',
    background: variant === 'primary' ? 'var(--brand-primary)' : 'var(--card-bg)',
    color: variant === 'primary' ? '#FFFFFF' : 'var(--text-primary)',
    border: '3px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase',
    letterSpacing: '0.04em', boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer', font: 'inherit', fontFamily: 'var(--font-body)',
  }),
  grid: {
    display: 'grid', gap: '1.25rem',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  },
  card: {
    background: 'var(--card-bg)', border: '3px solid var(--border-color)',
    borderRadius: 'var(--radius-md)', boxShadow: '4px 4px 0px 0px var(--shadow-color)',
    overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column',
    textAlign: 'left', padding: 0, font: 'inherit', color: 'var(--text-primary)',
  },
  preview: {
    height: '150px', background: 'var(--bg-tertiary)',
    borderBottom: '3px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', fontSize: '2rem', overflow: 'hidden',
  },
  previewImg: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  cardBody: { padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  cardTitle: {
    fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 400, margin: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
    fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600,
  },
  badge: (shared) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.15rem 0.55rem',
    background: shared ? 'var(--success, #22c55e)' : 'var(--bg-tertiary)',
    color: shared ? '#FFFFFF' : 'var(--text-muted)',
    border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }),
  empty: {
    padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)',
    background: 'var(--card-bg)', border: '3px dashed var(--border-color)',
    borderRadius: 'var(--radius-md)', fontWeight: 600,
  },
  error: {
    padding: '0.75rem 1rem', marginBottom: '1rem',
    background: 'var(--error, #ef4444)', color: '#FFFFFF',
    border: '3px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem', fontWeight: 600,
  },
};

const formatDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? '' : parsed.toLocaleDateString();
};

const CanvasPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAuthor = user?.role === 'instructor' || user?.role === 'admin';

  const [sessions, setSessions] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState('');

  // The selected session lives in the URL so a board card can link straight
  // back to the right session's list, and so a refresh keeps its place.
  const selectedSessionId = searchParams.get('session') || '';

  // ─── Sessions (authors only) ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthor) {
      setSessionsLoading(false);
      return undefined;
    }
    let cancelled = false;
    setSessionsLoading(true);
    setSessionsError('');

    (async () => {
      try {
        // /session/me is scoped to student, parent, and instructor; admins are
        // not on that allowlist and read the full collection instead.
        const url = user?.role === 'admin'
          ? '/api/v1/session?limit=100&sort=-date'
          : '/api/v1/session/me?limit=100&sort=-date';
        const res = await request(url);
        if (cancelled) return;
        const docs = res.data?.docs
          ?? res.data?.sessions
          ?? (Array.isArray(res.data) ? res.data : []);
        setSessions(Array.isArray(docs) ? docs : []);
      } catch (err) {
        // Kept separate from `error`, which belongs to the board list: a failed
        // session lookup must not be wiped out by the next board reload.
        if (!cancelled) setSessionsError(sanitizeErrorMessage(err.message));
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthor, request, user?.role]);

  // ─── Boards ─────────────────────────────────────────────────────────────────
  const loadBoards = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const url = selectedSessionId
        ? `/api/v1/session-canvas/session/${selectedSessionId}?limit=50`
        : '/api/v1/session-canvas/me?limit=50';
      const res = await request(url);
      setBoards(res.data?.docs ?? []);
    } catch (err) {
      setError(sanitizeErrorMessage(err.message));
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, [request, selectedSessionId]);

  useEffect(() => { loadBoards(); }, [loadBoards]);

  // ─── Create ─────────────────────────────────────────────────────────────────
  // The dropdown defaults to "All my boards" (an empty value), so keying the
  // create button off the selection alone left it permanently disabled on
  // arrival. Fall back to the newest session instead: the list is fetched
  // sorted by -date, so sessions[0] is the one an instructor almost always
  // means. The dropdown still overrides it for any other session.
  const targetSessionId = selectedSessionId || sessions[0]?._id || '';

  const targetSession = useMemo(
    () => sessions.find((session) => session._id === targetSessionId),
    [sessions, targetSessionId],
  );

  const createBoard = useCallback(async () => {
    if (!targetSessionId || creating) return;

    setCreating(true);
    setError('');

    try {
      const res = await request('/api/v1/session-canvas', 'POST', {
        sessionId: targetSessionId,
        title: `Board ${new Date().toLocaleDateString()}`,
      });
      navigate(`/dashboard/canvas/${res.data.canvas._id}`);
    } catch (err) {
      setError(sanitizeErrorMessage(err.message));
      setCreating(false);
    }
  }, [creating, navigate, request, targetSessionId]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session._id === selectedSessionId),
    [sessions, selectedSessionId],
  );

  const canCreate = Boolean(targetSessionId) && !creating;

  const emptyMessage = !isAuthor
    ? 'Nothing here yet — boards appear once an instructor shares one with you.'
    : sessions.length === 0 && !sessionsLoading
      ? 'You have no sessions yet. A board is always attached to a session, so create a session first.'
      : selectedSessionId
        ? 'No boards on this session yet. Create one to start drawing.'
        : 'No boards yet. Hit New board to start one on your latest session.';

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Canvas</h1>
          <p style={styles.subtitle}>
            {isAuthor
              ? 'Whiteboards and drafts attached to your sessions'
              : 'Boards your instructor has shared with you'}
          </p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {sessionsError && <div style={styles.error}>{sessionsError}</div>}

      {isAuthor && (
        <div style={styles.controls}>
          <select
            style={styles.select}
            value={selectedSessionId}
            aria-label="Session"
            onChange={(e) => {
              const next = e.target.value;
              setSearchParams(next ? { session: next } : {}, { replace: true });
            }}
          >
            <option value="">All my boards</option>
            {sessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.title}
                {session.date ? ` — ${formatDate(session.date)}` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            style={{
              ...styles.button('primary'),
              opacity: canCreate ? 1 : 0.5,
              cursor: canCreate ? 'pointer' : 'not-allowed',
            }}
            onClick={createBoard}
            disabled={!canCreate}
            title={
              targetSession
                ? `Create a board on "${targetSession.title}"`
                : sessionsLoading
                  ? 'Loading your sessions…'
                  : 'Create a session first — a board is always attached to one'
            }
          >
            <i className="fa-solid fa-plus" />
            {creating ? 'Creating…' : 'New board'}
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonCardList count={3} />
      ) : boards.length === 0 ? (
        <div style={styles.empty}>
          <i className="fa-solid fa-pen-ruler" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }} />
          {emptyMessage}
        </div>
      ) : (
        <div style={styles.grid}>
          {boards.map((board) => (
            <button
              key={board._id}
              type="button"
              style={styles.card}
              onClick={() => navigate(`/dashboard/canvas/${board._id}`)}
            >
              <div style={styles.preview}>
                {board.thumbnail ? (
                  <img src={board.thumbnail} alt="" style={styles.previewImg} />
                ) : (
                  <i className="fa-solid fa-pen-ruler" />
                )}
              </div>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>{board.title}</h2>
                <div style={styles.cardMeta}>
                  {isAuthor && <span style={styles.badge(board.isShared)}>
                    {board.isShared ? 'Shared' : 'Private'}
                  </span>}
                  <span>{board.elementCount ?? 0} shapes</span>
                  {board.updatedAt && <span>{formatDate(board.updatedAt)}</span>}
                </div>
                {!selectedSessionId && board.sessionId?.title && (
                  <div style={styles.cardMeta}>
                    <i className="fa-solid fa-calendar-days" /> {board.sessionId.title}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isAuthor && selectedSession && boards.length > 0 && (
        <p style={{ ...styles.subtitle, marginTop: '1.25rem' }}>
          Showing boards for “{selectedSession.title}”.
        </p>
      )}
    </div>
  );
};

export default CanvasPage;
