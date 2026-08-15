// Excalidraw resolves its font files against window.EXCALIDRAW_ASSET_PATH,
// defaulting to unpkg.com. The production CSP is `font-src 'self'` with no CDN,
// so that default is blocked and every hand-drawn font falls back silently.
//
// vite.config.js copies the font families out of node_modules into
// public/excalidraw-assets on every dev start and build; this points Excalidraw
// at that same-origin copy. The two must stay in sync — the constant there is
// EXCALIDRAW_ASSET_DIR.
//
// The trailing slash is required: Excalidraw appends "fonts/<Family>/<file>".
const ASSET_PATH = '/excalidraw-assets/';

let configured = false;

/**
 * Point Excalidraw at the self-hosted fonts. Safe to call repeatedly; only the
 * first call does anything. Must run before the Excalidraw bundle is imported,
 * which is why the editor chunk calls this ahead of its dynamic import.
 */
export const configureExcalidrawAssets = () => {
  if (configured || typeof window === 'undefined') return;
  window.EXCALIDRAW_ASSET_PATH = ASSET_PATH;
  configured = true;
};

export default configureExcalidrawAssets;
