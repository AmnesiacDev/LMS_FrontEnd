import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page and no limit picker', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows current page as aria-current', () => {
    render(
      <Pagination page={3} totalPages={10} onPageChange={() => {}} />
    );
    const current = screen.getByRole('button', { name: /^Page 3$/ });
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('disables Previous on first page', () => {
    render(
      <Pagination page={1} totalPages={5} onPageChange={() => {}} />
    );
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables Next on last page', () => {
    render(
      <Pagination page={5} totalPages={5} onPageChange={() => {}} />
    );
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('calls onPageChange with the correct page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={2} totalPages={5} onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('does not call onPageChange when clicking the current page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={2} totalPages={5} onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByRole('button', { name: /^Page 2$/ }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('shows total item count when provided', () => {
    render(
      <Pagination page={1} totalPages={3} onPageChange={() => {}} total={42} />
    );
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });
});
