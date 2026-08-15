import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApiRequest } from '../../hooks/useApiRequest';
import { sanitizeErrorMessage } from '../../utils/errorSanitizer';

// The Excalidraw bundle is ~1 MB of JavaScript plus its stylesheet. Loading it
// here — behind the route, behind a dynamic import — keeps it off every other
// page in the dashboard. configureExcalidrawAssets has to run before the bundle
// is evaluated, so it is awaited inside the same lazy factory.
const ExcalidrawBoard = lazy(async () => {
  const { configureExcalidrawAssets } = await import('../../components/Canvas/excalidrawAssets');
  configureExcalidrawAssets();
  return import('../../components/Canvas/ExcalidrawBoard');
});

// Idle time after the last stroke before the board saves itself. Long enough
// that a continuous drawing session is one request, not thirty.
const AUTOSAVE_IDLE_MS = 5000;

const styles = {
  page: {
    display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)',
    minHeight: '520px', gap: '1rem',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: '1rem', flexWrap: 'wrap',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '2.4rem', height: '2.4rem', flexShrink: 0,
    background: 'var(--card-bg)', color: 'var(--text-primary)',
    border: '3px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    boxShadow: '2px 2px 0px 0px var(--shadow-color)',
    cursor: 'pointer', textDecoration: 'none', font: 'inherit',
  },
  titleInput: {
    flex: 1, minWidth: '160px', maxWidth: '460px',
    padding: '0.5rem 0.85rem', border: '3px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', background: 'var(--card-bg)',
    color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700,
    fontFamily: 'var(--font-heading)', outline: 'none',
    boxShadow: '2px 2px 0px 0px var(--shadow-color)',
  },
  titleText: {
    fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 400,
    margin: 0, color: 'var(--text-primary)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' },
  status: {
    fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: 'var(--text-muted)', whiteSpace: 'nowrap',
  },
  button: (variant) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.55rem 1.1rem',
    background: variant === 'primary' ? 'var(--brand-primary)' : 'var(--card-bg)',
    color: variant === 'primary' ? '#FFFFFF' : 'var(--text-primary)',
    border: '3px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase',
    letterSpacing: '0.04em', boxShadow: '2px 2px 0px 0px var(--shadow-color)',
    cursor: 'pointer', font: 'inherit', fontFamily: 'var(--font-body)',
  }),
  badge: (shared) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.3rem 0.75rem',
    background: shared ? 'var(--success, #22c55e)' : 'var(--bg-tertiary)',
    color: shared ? '#FFFFFF' : 'var(--text-muted)',
    border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.04em', whiteSpace: 'nowrap',
  }),
  banner: (tone) => ({
    padding: '0.75rem 1rem',
    background: tone === 'error' ? 'var(--error, #ef4444)' : 'var(--accent-orange, #f97316)',
    color: '#FFFFFF', border: '3px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', boxShadow: '3px 3px 0px 0px var(--shadow-color)',
    fontSize: '0.85rem', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
  }),
  canvasShell: {
    flex: 1, minHeight: '380px',
    border: '3px solid var(--border-color)', borderRadius: 'var(--radius-md)',
    boxShadow: '4px 4px 0px 0px var(--shadow-color)',
    overflow: 'hidden', background: 'var(--card-bg)', position: 'relative',
  },
  centered: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: 'var(--text-muted)', fontWeight: 600, gap: '0.6rem',
  },
};

const CanvasLoading = ({ label }) => (
  <div style={styles.centered}>
    <i className="fa-solid fa-circle-notch fa-spin" /> {label}
  </div>
);

const CanvasBoardPage = () => {
  const { canvasId } = useParams();
  const navigate = useNavigate();
  const { request } = useApiRequest();

  const [board, setBoard] = useState(null);
  const [initialScene, setInitialScene] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [title, setTitle] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveState, setSaveState] = useState('idle'); // idle | dirty | saving | saved

  // Refs, not state: these are read by timers and by the unmount flush, and
  // must never be a render input or the autosave timer restarts on every stroke.
  const latestSceneRef = useRef({ elements: [], appState: {}, files: {}, sceneVersion: 0 });
  const savedSceneVersionRef = useRef(0);
  const serverVersionRef = useRef(0);
  const saveTimerRef = useRef(null);
  const savingRef = useRef(false);
  const dirtyRef = useRef(false);
  // saveNow re-arms the autosave timer when the scene moved on mid-flight, but
  // scheduleSave is defined in terms of saveNow. The ref breaks that cycle.
  const scheduleSaveRef = useRef(null);

  // ─── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await request(`/api/v1/session-canvas/${canvasId}`);
        if (cancelled) return;

        const canvas = res.data?.canvas;
        setBoard(canvas);
        setCanEdit(res.data?.canEdit === true);
        setTitle(canvas?.title ?? '');
        serverVersionRef.current = canvas?.version ?? 0;

        if (canvas?.sceneData) {
          try {
            setInitialScene(JSON.parse(canvas.sceneData));
          } catch {
            // A board whose stored scene will not parse is still openable — the
            // instructor gets a blank canvas rather than a dead page.
            setInitialScene(null);
            setLoadError('This board’s saved drawing could not be read. Starting from a blank canvas.');
          }
        } else {
          setInitialScene(null);
        }
      } catch (err) {
        if (!cancelled) setLoadError(sanitizeErrorMessage(err.message));
      }
    })();

    return () => { cancelled = true; };
  }, [canvasId, request]);

  // ─── Save ───────────────────────────────────────────────────────────────────
  const saveNow = useCallback(async () => {
    if (!canEdit || savingRef.current || !dirtyRef.current) return;

    savingRef.current = true;
    setSaveState('saving');
    setSaveError('');

    const { elements, appState, files, sceneVersion } = latestSceneRef.current;

    try {
      // Loaded lazily and only on a real save (at most once per idle window),
      // so the Excalidraw bundle is never pulled in before the editor mounts.
      const { sceneToJson, sceneToThumbnail } = await import(
        '../../components/Canvas/sceneSerialization'
      );

      const [sceneData, thumbnail] = await Promise.all([
        Promise.resolve(sceneToJson(elements, appState, files)),
        sceneToThumbnail(elements, appState, files),
      ]);

      const res = await request(`/api/v1/session-canvas/${canvasId}`, 'PATCH', {
        sceneData,
        thumbnail,
        expectedVersion: serverVersionRef.current,
      });

      serverVersionRef.current = res.data?.canvas?.version ?? serverVersionRef.current + 1;
      savedSceneVersionRef.current = sceneVersion;

      // Anything drawn while the request was in flight leaves the board dirty,
      // so the next idle tick picks it up instead of the change being lost.
      const stillDirty = latestSceneRef.current.sceneVersion !== sceneVersion;

      dirtyRef.current = stillDirty;
      setSaveState(stillDirty ? 'dirty' : 'saved');
      if (stillDirty) scheduleSaveRef.current?.();
    } catch (err) {
      setSaveError(sanitizeErrorMessage(err.message));
      setSaveState('dirty');
    } finally {
      savingRef.current = false;
    }
  }, [canEdit, canvasId, request]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { saveNow(); }, AUTOSAVE_IDLE_MS);
  }, [saveNow]);

  useEffect(() => { scheduleSaveRef.current = scheduleSave; }, [scheduleSave]);

  const handleSceneChange = useCallback(
    (elements, appState, files, sceneVersion) => {
      latestSceneRef.current = { elements, appState, files, sceneVersion };
      if (!canEdit) return;

      // Fires on selection and panning too; only a real drawing change moves
      // the scene version, and only that should mark the board dirty.
      if (sceneVersion === savedSceneVersionRef.current) return;

      dirtyRef.current = true;
      setSaveState((prev) => (prev === 'saving' ? prev : 'dirty'));
      scheduleSave();
    },
    [canEdit, scheduleSave],
  );

  // Cancel any pending autosave on unmount. The save itself is not flushed here:
  // an async request started during teardown cannot report success or failure to
  // a UI that is already gone, which is exactly how a "saved" board turns out
  // not to be. The beforeunload guard below covers the tab-close case instead.
  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  useEffect(() => {
    if (!canEdit) return undefined;

    const guard = (event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [canEdit]);

  // ─── Title and sharing ──────────────────────────────────────────────────────
  const commitTitle = useCallback(async () => {
    const trimmed = title.trim();
    if (!canEdit || !trimmed || trimmed === board?.title) {
      setTitle(board?.title ?? '');
      return;
    }

    try {
      const res = await request(`/api/v1/session-canvas/${canvasId}`, 'PATCH', { title: trimmed });
      setBoard(res.data?.canvas);
      serverVersionRef.current = res.data?.canvas?.version ?? serverVersionRef.current;
    } catch (err) {
      setSaveError(sanitizeErrorMessage(err.message));
      setTitle(board?.title ?? '');
    }
  }, [board, canEdit, canvasId, request, title]);

  const toggleShare = useCallback(async () => {
    if (!canEdit || !board) return;

    try {
      const res = await request(`/api/v1/session-canvas/${canvasId}/share`, 'PATCH', {
        isShared: !board.isShared,
      });
      setBoard(res.data?.canvas);
    } catch (err) {
      setSaveError(sanitizeErrorMessage(err.message));
    }
  }, [board, canEdit, canvasId, request]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (loadError && !board) {
    return (
      <div style={styles.page}>
        <div style={styles.banner('error')}>
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{loadError}</span>
          <button type="button" style={styles.button()} onClick={() => navigate('/dashboard/canvas')}>
            Back to boards
          </button>
        </div>
      </div>
    );
  }

  const sessionTitle = board?.sessionId?.title;
  const statusLabel = {
    idle: '',
    dirty: 'Unsaved changes',
    saving: 'Saving…',
    saved: 'All changes saved',
  }[saveState];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/dashboard/canvas" style={styles.backBtn} aria-label="Back to boards">
            <i className="fa-solid fa-arrow-left" />
          </Link>

          {canEdit ? (
            <input
              style={styles.titleInput}
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              aria-label="Board title"
            />
          ) : (
            <h1 style={styles.titleText}>{board?.title ?? 'Board'}</h1>
          )}
        </div>

        <div style={styles.actions}>
          {sessionTitle && (
            <span style={styles.status} title={sessionTitle}>
              <i className="fa-solid fa-calendar-days" /> {sessionTitle}
            </span>
          )}

          {canEdit ? (
            <>
              {statusLabel && <span style={styles.status}>{statusLabel}</span>}
              <button
                type="button"
                style={styles.button()}
                onClick={toggleShare}
                title={board?.isShared ? 'Stop sharing with the student' : 'Share with the student'}
              >
                <i className={board?.isShared ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} />
                {board?.isShared ? 'Shared' : 'Private'}
              </button>
              <button type="button" style={styles.button('primary')} onClick={saveNow}>
                <i className="fa-solid fa-floppy-disk" /> Save
              </button>
            </>
          ) : (
            <span style={styles.badge(true)}>
              <i className="fa-solid fa-eye" /> View only
            </span>
          )}
        </div>
      </div>

      {saveError && (
        <div style={styles.banner('error')}>
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{saveError}</span>
          <button type="button" style={styles.button()} onClick={() => window.location.reload()}>
            Reload board
          </button>
        </div>
      )}

      {loadError && board && (
        <div style={styles.banner('warn')}>
          <i className="fa-solid fa-circle-info" />
          <span>{loadError}</span>
        </div>
      )}

      <div style={styles.canvasShell}>
        {board ? (
          <Suspense fallback={<CanvasLoading label="Loading the canvas…" />}>
            <ExcalidrawBoard
              initialScene={initialScene}
              readOnly={!canEdit}
              onChange={handleSceneChange}
            />
          </Suspense>
        ) : (
          <CanvasLoading label="Opening board…" />
        )}
      </div>
    </div>
  );
};

export default CanvasBoardPage;
