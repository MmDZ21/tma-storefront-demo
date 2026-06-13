import { describe, it, expect } from 'vitest';
import { isValidRecipient } from './config';

describe('isValidRecipient', () => {
  it('accepts a well-formed 48-char user-friendly address', () => {
    expect(isValidRecipient('0QDtestRecipientForVitestAAAAAAAAAAAAAAAAAAAAAAA')).toBe(true);
  });

  it('rejects the all-zero placeholder (F2 — fail loud, not silently send to junk)', () => {
    expect(isValidRecipient('0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')).toBe(false);
  });

  it('rejects wrong-length, spaced, or empty input', () => {
    expect(isValidRecipient('short')).toBe(false);
    expect(isValidRecipient('has spaces AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')).toBe(false);
    expect(isValidRecipient('')).toBe(false);
  });
});
