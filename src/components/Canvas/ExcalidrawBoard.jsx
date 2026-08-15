import { useCallback, useMemo } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { useTheme } from '../../context/ThemeContext';
import { sceneVersionOf } from './sceneSerialization';

/**
 * The Excalidraw editor, wrapped so the rest of the app never touches the
 * library directly.
 *
 * This module pulls in ~1 MB of JavaScript plus a stylesheet, so it must only
 * ever be reached through a dynamic import — see CanvasBoardPage, which
 * configures the font asset path before importing it.
 */
const ExcalidrawBoard = ({ initialScene, readOnly = false, onChange }) => {
  const { theme } = useTheme();

  // Excalidraw reads initialData exactly once on mount and ignores later
  // changes, so this must not be rebuilt on every render — a new object
  // identity here is what causes the "board resets while you draw" class of bug.
  const initialData = useMemo(
    () => ({
      elements: initialScene?.elements ?? [],
      appState: {
        ...(initialScene?.appState ?? {}),
        // Persisted appState can carry a stale collaborator map and a stale
        // width/height that make the canvas mount at the wrong size.
        collaborators: undefined,
        width: undefined,
        height: undefined,
      },
      files: initialScene?.files ?? {},
      scrollToContent: true,
    }),
    [initialScene],
  );

  const handleChange = useCallback(
    (elements, appState, files) => {
      // The scene version is computed here rather than by the caller so the
      // page never has to reach back into the Excalidraw bundle on a hot path
      // that fires on every pointer move.
      onChange?.(elements, appState, files, sceneVersionOf(elements));
    },
    [onChange],
  );

  return (
    <Excalidraw
      initialData={initialData}
      onChange={handleChange}
      viewModeEnabled={readOnly}
      theme={theme === 'dark' ? 'dark' : 'light'}
      UIOptions={{
        canvasActions: {
          // The platform owns persistence; Excalidraw's own "save to active
          // file" would write a second, divergent copy of the board.
          loadScene: !readOnly,
          saveToActiveFile: false,
          export: { saveFileToDisk: true },
          toggleTheme: false,
        },
      }}
    />
  );
};

export default ExcalidrawBoard;
