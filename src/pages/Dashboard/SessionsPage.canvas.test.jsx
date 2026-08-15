import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SessionsPage from './SessionsPage';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  navigate: vi.fn(),
  role: 'instructor',
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'instructor-1', role: mocks.role } }),
}));

vi.mock('../../hooks/useApiRequest', () => ({
  useApiRequest: () => ({ request: mocks.request }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}));

const session = {
  _id: 'session-1',
  title: 'Recursion basics',
  description: 'Tracing a recursive call stack',
  date: new Date('2026-09-01T10:00:00Z').toISOString(),
  status: 'pending',
  StudentAttended: true,
  instructorId: { _id: 'instructor-1', FullName: 'Omar Instructor' },
  studentProfileId: { _id: 'profile-1', user: { _id: 'student-1', FullName: 'Ali Student' } },
};

const board = {
  _id: 'board-1',
  title: 'Call stack sketch',
  elementCount: 7,
  isShared: false,
  thumbnail: '',
  updatedAt: new Date('2026-09-01T11:00:00Z').toISOString(),
};

// Boards are fetched lazily, so every assertion here has to expand the card
// first — that expansion is the behaviour under test as much as the rendering.
const expandFirstSession = async (user) => {
  const card = await screen.findByText('Recursion basics');
  await user.click(card);
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <SessionsPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.role = 'instructor';
  mocks.request.mockImplementation((url, method) => {
    if (url.startsWith('/api/v1/session/me') || url.startsWith('/api/v1/session?')) {
      return Promise.resolve({ data: { docs: [session], total: 1, totalPages: 1 } });
    }
    if (url.startsWith('/api/v1/student-instructor-assignments')) {
      return Promise.resolve({ data: { students: [], docs: [] } });
    }
    if (url.startsWith('/api/v1/session-canvas/session/session-1')) {
      return Promise.resolve({ data: { docs: [board] } });
    }
    if (url === '/api/v1/session-canvas' && method === 'POST') {
      return Promise.resolve({ data: { canvas: { _id: 'board-new' } } });
    }
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('session boards on the sessions page', () => {
  it('does not fetch boards until a session card is expanded', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Recursion basics');
    expect(mocks.request).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/session-canvas/session/'),
    );

    await expandFirstSession(user);

    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith(
        '/api/v1/session-canvas/session/session-1?limit=50',
      ),
    );
  });

  it('lists the session’s boards and opens one', async () => {
    const user = userEvent.setup();
    renderPage();
    await expandFirstSession(user);

    const chip = await screen.findByTitle('Call stack sketch');
    expect(chip).toBeInTheDocument();
    // Instructors see the share state on the chip.
    expect(screen.getByText('Private')).toBeInTheDocument();

    await user.click(chip);
    expect(mocks.navigate).toHaveBeenCalledWith('/dashboard/canvas/board-1');
  });

  it('creates a board from the session and opens it', async () => {
    const user = userEvent.setup();
    renderPage();
    await expandFirstSession(user);

    await screen.findByTitle('Call stack sketch');
    await user.click(screen.getByRole('button', { name: /new board/i }));

    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith('/api/v1/session-canvas', 'POST', {
        sessionId: 'session-1',
        title: 'Recursion basics — board',
      }),
    );
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith('/dashboard/canvas/board-new'),
    );
  });

  it('re-expanding a card reuses the boards it already loaded', async () => {
    const user = userEvent.setup();
    renderPage();

    await expandFirstSession(user);
    await screen.findByTitle('Call stack sketch');

    const boardCalls = () =>
      mocks.request.mock.calls.filter(([url]) =>
        url.startsWith('/api/v1/session-canvas/session/'),
      ).length;

    expect(boardCalls()).toBe(1);

    await expandFirstSession(user); // collapse
    await expandFirstSession(user); // expand again

    await waitFor(() => expect(screen.getByTitle('Call stack sketch')).toBeInTheDocument());
    expect(boardCalls()).toBe(1);
  });

  it('hides the create button from students and shows shape counts instead', async () => {
    mocks.role = 'student';
    const user = userEvent.setup();
    renderPage();
    await expandFirstSession(user);

    await screen.findByTitle('Call stack sketch');
    expect(screen.queryByRole('button', { name: /new board/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
    expect(screen.getByText('7 shapes')).toBeInTheDocument();
  });

  it('surfaces a board load failure without breaking the card', async () => {
    mocks.request.mockImplementation((url) => {
      if (url.startsWith('/api/v1/session/me')) {
        return Promise.resolve({ data: { docs: [session], total: 1, totalPages: 1 } });
      }
      if (url.startsWith('/api/v1/student-instructor-assignments')) {
        return Promise.resolve({ data: { students: [], docs: [] } });
      }
      if (url.startsWith('/api/v1/session-canvas/session/')) {
        return Promise.reject(new Error('Session not found'));
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    const user = userEvent.setup();
    renderPage();
    await expandFirstSession(user);

    // sanitizeErrorMessage rewrites anything containing "not found" before it
    // reaches the user, so assert on what is actually rendered.
    expect(
      await screen.findByText(/the requested resource could not be found/i),
    ).toBeInTheDocument();
    // The rest of the expanded card still renders.
    expect(screen.getByText(/AI Session Summary/i)).toBeInTheDocument();
  });
});
