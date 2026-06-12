import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper } from './Stepper';

describe('<Stepper />', () => {
  it('increments within the max bound', async () => {
    const onChange = vi.fn();
    render(<Stepper value={1} onChange={onChange} min={1} max={3} />);
    await userEvent.click(screen.getByRole('button', { name: /increase/i }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('decrements within the min bound', async () => {
    const onChange = vi.fn();
    render(<Stepper value={2} onChange={onChange} min={1} max={3} />);
    await userEvent.click(screen.getByRole('button', { name: /decrease/i }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disables decrement at the minimum', () => {
    render(<Stepper value={1} onChange={vi.fn()} min={1} max={3} />);
    expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled();
  });

  it('disables increment at the maximum', () => {
    render(<Stepper value={3} onChange={vi.fn()} min={1} max={3} />);
    expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled();
  });
});
