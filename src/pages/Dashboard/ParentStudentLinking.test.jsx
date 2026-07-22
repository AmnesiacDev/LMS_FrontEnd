import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ParentOverview from './ParentOverview';
import DashboardOverview from './DashboardOverview';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  useAuth: vi.fn(),
  useFetchData: vi.fn(),
  refetchProfile: vi.fn(),
  refetchPendingRequests: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

vi.mock('../../hooks/useApiRequest', () => ({
  useApiRequest: () => ({ request: mocks.request }),
}));

vi.mock('../../hooks/useFetchData', () => ({
  default: mocks.useFetchData,
}));

vi.mock('../../components/NextSessionCountdown/NextSessionCountdown', () => ({
  default: () => null,
}));

const emptyFetchResult = {
  data: null,
  loading: false,
  error: null,
  refetch: vi.fn(),
};

const renderPage = (component) => render(<MemoryRouter>{component}</MemoryRouter>);

const configureFetchData = ({ pendingRequests = [], profile = { grade: 'Grade 9' } } = {}) => {
  mocks.useFetchData.mockImplementation((endpoint) => {
    if (endpoint === '/api/v1/StudentProfile/me/parent-requests') {
      return {
        data: pendingRequests,
        loading: false,
        error: null,
        refetch: mocks.refetchPendingRequests,
      };
    }

    if (endpoint === '/api/v1/StudentProfile/me') {
      return {
        data: profile,
        loading: false,
        error: null,
        refetch: mocks.refetchProfile,
      };
    }

    return emptyFetchResult;
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.refetchProfile.mockResolvedValue(undefined);
  mocks.refetchPendingRequests.mockResolvedValue(undefined);
  configureFetchData();
});

describe('parent-student linking UI', () => {
  it('explains that a parent sends a request instead of immediately linking', async () => {
    const user = userEvent.setup();
    mocks.useAuth.mockReturnValue({ user: { role: 'parent', FullName: 'Mona Parent' } });
    mocks.request.mockResolvedValue({ message: 'Link request sent!' });

    renderPage(<ParentOverview />);

    await user.click(screen.getByRole('button', { name: /request child link/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/does not link the account immediately/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/only after accepting your request/i)).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/child email or username/i), 'student@example.com');
    await user.click(within(dialog).getByRole('button', { name: /^send link request$/i }));

    await waitFor(() => {
      expect(mocks.request).toHaveBeenCalledWith('/api/v1/StudentProfile/link-child', 'POST', {
        childIdentifier: 'student@example.com',
      });
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/student must accept/i);
  });

  it('shows successful and failed identifiers from a partial bulk request', async () => {
    const user = userEvent.setup();
    mocks.useAuth.mockReturnValue({ user: { role: 'parent', FullName: 'Mona Parent' } });
    mocks.request.mockResolvedValue({
      data: {
        totalLinked: 1,
        totalFailed: 1,
        failed: [{ identifier: 'already@example.com', reason: 'A link request is already pending student approval!' }],
      },
    });

    renderPage(<ParentOverview />);

    await user.click(screen.getByRole('button', { name: /request child link/i }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /multiple students/i }));
    await user.type(within(dialog).getByLabelText(/child emails.*bulk/i), 'new@example.com, already@example.com');
    await user.click(within(dialog).getByRole('button', { name: /send link requests/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/1 link request sent/i);
    expect(screen.getByRole('alert')).toHaveTextContent('already@example.com');
    expect(screen.getByRole('alert')).toHaveTextContent(/already pending/i);
  });

  it('shows duplicate-request errors returned by the backend', async () => {
    const user = userEvent.setup();
    mocks.useAuth.mockReturnValue({ user: { role: 'parent', FullName: 'Mona Parent' } });
    mocks.request.mockRejectedValue(new Error('A link request for this student is already pending student approval!'));

    renderPage(<ParentOverview />);

    await user.click(screen.getByRole('button', { name: /request child link/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/child email or username/i), 'student@example.com');
    await user.click(within(dialog).getByRole('button', { name: /^send link request$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/already pending student approval/i);
  });

  it('accepts a parent request and refreshes both request and profile data', async () => {
    const user = userEvent.setup();
    const parentId = '507f1f77bcf86cd799439011';
    mocks.useAuth.mockReturnValue({ user: { role: 'student', FullName: 'Ali Student' } });
    configureFetchData({ pendingRequests: [{ _id: parentId, FullName: 'Mona Parent', Email: 'mona@example.com' }] });
    mocks.request.mockResolvedValue({ message: 'Parent link request accepted!' });

    renderPage(<DashboardOverview />);

    await user.click(screen.getByRole('button', { name: /accept/i }));

    await waitFor(() => {
      expect(mocks.request).toHaveBeenCalledWith(`/api/v1/StudentProfile/me/parent-requests/${parentId}/accept`, 'POST');
    });
    expect(mocks.refetchPendingRequests).toHaveBeenCalledOnce();
    expect(mocks.refetchProfile).toHaveBeenCalledOnce();
    expect(await screen.findByRole('status')).toHaveTextContent(/accepted/i);
  });

  it('shows a visible error and restores actions when decline fails', async () => {
    const user = userEvent.setup();
    const parentId = '507f1f77bcf86cd799439011';
    mocks.useAuth.mockReturnValue({ user: { role: 'student', FullName: 'Ali Student' } });
    configureFetchData({ pendingRequests: [{ _id: parentId, FullName: 'Mona Parent' }] });
    mocks.request.mockRejectedValue(new Error('Pending link request not found'));

    renderPage(<DashboardOverview />);

    const declineButton = screen.getByRole('button', { name: /decline/i });
    await user.click(declineButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(/pending link request not found/i);
    expect(declineButton).toBeEnabled();
  });
});
