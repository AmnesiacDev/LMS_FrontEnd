import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pet from '../Pet';

describe('Pet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the stored creature on its own composited layer', () => {
    localStorage.setItem('lms-pet-choice', 'dino');
    const { container } = render(<Pet />);

    expect(screen.getByRole('button', { name: /Pet: Dino/i })).toBeInTheDocument();
    // The sprite must keep the class the layer/animation styling hangs off.
    expect(container.querySelector('.pet-sprite')).toBeInTheDocument();
    expect(container.querySelector('.pet-sprite svg')).toBeInTheDocument();
  });

  it('falls back to the default creature when the stored id is unknown', () => {
    localStorage.setItem('lms-pet-choice', 'not-a-pet');
    render(<Pet />);

    expect(screen.getByRole('button', { name: /Pet: Shiba/i })).toBeInTheDocument();
  });

  it('says something when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Pet />);

    await user.click(screen.getByRole('button', { name: /Pet: Shiba/i }));

    expect(container.querySelector('.pet-bubble')).toBeInTheDocument();
  });
});
