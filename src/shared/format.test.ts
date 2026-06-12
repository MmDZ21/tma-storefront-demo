import { describe, it, expect } from 'vitest';
import { formatTokenAmount, formatUsd } from './format';

describe('formatTokenAmount', () => {
  it('trims trailing zeros', () => {
    expect(formatTokenAmount(1.5)).toBe('1.5');
    expect(formatTokenAmount(0.8)).toBe('0.8');
  });

  it('keeps whole numbers clean', () => {
    expect(formatTokenAmount(12)).toBe('12');
  });

  it('keeps meaningful decimals', () => {
    expect(formatTokenAmount(1.25)).toBe('1.25');
    expect(formatTokenAmount(0.01)).toBe('0.01');
  });

  it('groups thousands', () => {
    expect(formatTokenAmount(1000)).toBe('1,000');
  });
});

describe('formatUsd', () => {
  it('formats to two decimals with a dollar sign', () => {
    expect(formatUsd(7.8)).toBe('$7.80');
    expect(formatUsd(41.6)).toBe('$41.60');
  });

  it('groups thousands', () => {
    expect(formatUsd(1000)).toBe('$1,000.00');
  });
});
