import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { init, mainButton, mockTelegramEnv } from '@telegram-apps/sdk-react';
import { useMainButton } from './useMainButton';

// Capture the events the SDK posts to the Telegram client (web_app_setup_main_button
// carries the button label), so we can assert the native button always gets the latest text.
const events: Array<[string, unknown]> = [];

function launchParams(): string {
  return new URLSearchParams({
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppThemeParams: JSON.stringify({
      bg_color: '#0e1621',
      text_color: '#f5f5f5',
      button_color: '#0088cc',
      button_text_color: '#ffffff',
    }),
    tgWebAppData: new URLSearchParams({ auth_date: '1', signature: 's', hash: 'h' }).toString(),
  }).toString();
}

function postedTexts(): Array<string | undefined> {
  return events
    .filter(([name]) => name === 'web_app_setup_main_button')
    .map(([, payload]) => (payload as { text?: string }).text);
}

function Harness({ text, active = true }: { text: string; active?: boolean }) {
  useMainButton({ text, onClick: () => {}, active });
  return null;
}

describe('useMainButton', () => {
  beforeEach(() => {
    events.length = 0;
    mockTelegramEnv({
      launchParams: launchParams(),
      onEvent([name, payload], next) {
        events.push([name, payload]);
        next();
      },
    });
    init();
  });

  afterEach(() => {
    cleanup(); // unmount React first (runs effect cleanups while still mounted)
    try {
      mainButton.unmount();
    } catch {
      /* already unmounted */
    }
  });

  it('pushes the current label to the native button on every change (no stale render — BUG 2)', () => {
    const { rerender } = render(<Harness text="Add to cart · 1.5 TON" />);
    rerender(<Harness text="Add to cart · 3 TON" />);
    rerender(<Harness text="Add to cart · 4.5 TON" />);

    // Must end on the CURRENT label, and each change must reach the native layer in order.
    expect(postedTexts().at(-1)).toBe('Add to cart · 4.5 TON');
    expect(postedTexts()).toEqual([
      'Add to cart · 1.5 TON',
      'Add to cart · 3 TON',
      'Add to cart · 4.5 TON',
    ]);
  });

  it('is a no-op when inactive (outside Telegram the in-app button takes over)', () => {
    render(<Harness text="ignored" active={false} />);
    expect(postedTexts()).toEqual([]);
  });
});
