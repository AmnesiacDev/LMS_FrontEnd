import { exportToCanvas, getSceneVersion, serializeAsJSON } from '@excalidraw/excalidraw';

/**
 * Scene helpers, kept out of ExcalidrawBoard.jsx so that file exports nothing
 * but its component (React Fast Refresh requires that).
 *
 * Importing this module pulls in the Excalidraw bundle, so only reach for it
 * from code that already runs inside the canvas route.
 */

// A board card thumbnail is decorative; 480px on the long edge keeps it well
// inside the backend's 400 KB thumbnail cap even for a dense drawing.
const THUMBNAIL_MAX_EDGE = 480;

/**
 * Excalidraw's onChange fires on pure interaction too — selecting, panning,
 * hovering. getSceneVersion sums the per-element version counters, so it only
 * moves when the drawing itself actually changed. Autosave keys off this rather
 * than off onChange, which would otherwise fire a save on every mouse move.
 */
export const sceneVersionOf = (elements) => getSceneVersion(elements ?? []);

/**
 * Turn the live scene into the exact JSON text the backend stores.
 *
 * `serializeAsJSON` is Excalidraw's own .excalidraw writer, so what we save is a
 * file the user could also open on excalidraw.com — no private format.
 */
export const sceneToJson = (elements, appState, files) =>
  serializeAsJSON(elements ?? [], appState ?? {}, files ?? {}, 'local');

/**
 * Render a small PNG data URL for the board list. Returns '' when there is
 * nothing to draw or the export fails — a missing thumbnail is a cosmetic
 * problem and must never block a save.
 */
export const sceneToThumbnail = async (elements, appState, files) => {
  const visible = (elements ?? []).filter((el) => el && !el.isDeleted);
  if (visible.length === 0) return '';

  try {
    const canvas = await exportToCanvas({
      elements: visible,
      appState: { ...appState, exportBackground: true, exportWithDarkMode: false },
      files: files ?? {},
      getDimensions: (width, height) => {
        const scale = Math.min(1, THUMBNAIL_MAX_EDGE / Math.max(width, height));
        return { width: width * scale, height: height * scale, scale };
      },
    });
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
};
