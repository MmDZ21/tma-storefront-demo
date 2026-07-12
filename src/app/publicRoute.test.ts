import { describe, expect, it } from 'vitest';
import { shouldShowOutsideTelegramFallback } from './publicRoute';

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
