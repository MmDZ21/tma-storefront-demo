import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { shouldShowOutsideTelegramFallback, waitForBootstrapHash } from './publicRoute';

describe('shouldShowOutsideTelegramFallback', () => {
  it('keeps the public build-yours route available in a normal browser', () => {
    expect(
      shouldShowOutsideTelegramFallback({
        inTelegram: false,
        hash: '#/build-yours',
        previewFallback: false,
      }),
    ).toBe(false);
  });

  it('keeps the Telegram fallback for other outside-Telegram routes', () => {
    expect(
      shouldShowOutsideTelegramFallback({
        inTelegram: false,
        hash: '#/',
        previewFallback: false,
      }),
    ).toBe(true);
  });

  it('never replaces a real Telegram session with the fallback', () => {
    expect(
      shouldShowOutsideTelegramFallback({
        inTelegram: true,
        hash: '#/',
        previewFallback: false,
      }),
    ).toBe(false);
  });
});

describe('waitForBootstrapHash', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  afterEach(() => {
    window.location.hash = '';
    vi.useRealTimers();
  });

  it('resolves immediately when a hash is already present', async () => {
    window.location.hash = '#/build-yours';
    await expect(waitForBootstrapHash(50)).resolves.toBe('#/build-yours');
  });

  it('waits for a late hashchange when the hash starts empty', async () => {
    vi.useFakeTimers();
    const pending = waitForBootstrapHash(100);
    queueMicrotask(() => {
      window.location.hash = '#/build-yours';
    });
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toBe('#/build-yours');
  });
});
