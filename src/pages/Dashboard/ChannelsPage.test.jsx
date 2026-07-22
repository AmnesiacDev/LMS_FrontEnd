import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ChannelsPage from './ChannelsPage';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'instructor-1', role: 'instructor' } }),
}));

vi.mock('../../hooks/useApiRequest', () => ({
  useApiRequest: () => ({ request: mocks.request }),
}));

const channel = {
  _id: 'channel-1',
  name: 'Ali Student Learning Team',
  studentProfileId: { user: { _id: 'student-1', FullName: 'Ali Student' } },
  members: [
    { userId: { _id: 'student-1', FullName: 'Ali Student', role: 'student' }, role: 'student' },
    { userId: { _id: 'parent-1', FullName: 'Mona Parent', role: 'parent' }, role: 'parent' },
    { userId: { _id: 'instructor-1', FullName: 'Omar Instructor', role: 'instructor' }, role: 'instructor' },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.request.mockImplementation((url, method) => {
    if (url === '/api/v1/channels') {
      return Promise.resolve({ data: { channels: [channel] } });
    }
    if (url === '/api/v1/channels/channel-1/messages?limit=100') {
      return Promise.resolve({ data: { messages: [] } });
    }
    if (url === '/api/v1/channels/channel-1/messages' && method === 'POST') {
      return Promise.resolve({
        data: {
          message: {
            _id: 'message-1',
            senderId: { _id: 'instructor-1', FullName: 'Omar Instructor', role: 'instructor' },
            content: 'Ali completed the first module.',
            createdAt: new Date().toISOString(),
          },
        },
      });
    }
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
});

describe('learning-team channels', () => {
  it('shows the assigned team and sends a shared message', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ChannelsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Ali Student Learning Team' })).toBeInTheDocument();
    expect(screen.getByText('Mona Parent')).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/message your learning team/i),
      'Ali completed the first module.',
    );
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mocks.request).toHaveBeenCalledWith(
        '/api/v1/channels/channel-1/messages',
        'POST',
        { content: 'Ali completed the first module.' },
      );
    });
    expect(await screen.findByText('Ali completed the first module.')).toBeInTheDocument();
  });
});
