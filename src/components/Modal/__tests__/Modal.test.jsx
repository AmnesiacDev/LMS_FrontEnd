nimport { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Hello"><p>body</p></Modal>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders with a dialog role and accessible title when open', () => {
    render(<Modal isOpen onClose={() => {}} title="My Modal"><p>body</p></Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('closes when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="t"><p>body</p></Modal>);
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on ESC keypress', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="t"><p>body</p></Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('locks body scroll while open', () => {
    const { rerender } = render(<Modal isOpen onClose={() => {}} title="t"><p>body</p></Modal>);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal isOpen={false} onClose={() => {}} title="t"><p>body</p></Modal>);
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
