import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { init, themeParams, emitEvent, mockTelegramEnv } from '@telegram-apps/sdk-react';
import { ThemeProvider } from './ThemeProvider';

// A dark Telegram palette used as the initial mocked launch theme.
const DARK_THEME = {
  bg_color: '#0e1621',
  text_color: '#f5f5f5',
  hint_color: '#708499',
  link_color: '#6ab3f3',
  button_color: '#5288c1',
  button_text_color: '#ffffff',
  secondary_bg_color: '#17212b',
};

function launchParams(theme: Record<string, string>): string {
  return new URLSearchParams({
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppThemeParams: JSON.stringify(theme),
    tgWebAppData: new URLSearchParams({
      auth_date: '1',
      signature: 'mock-signature',
      hash: 'mock-hash',
    }).toString(),
  }).toString();
}

describe('runtime theme reactivity', () => {
  beforeEach(() => {
    // The brand fetch is irrelevant here; return a valid brand to keep output clean.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              name: 'Demo',
              welcomeLine: 'Demo',
              logoEmoji: '🛍️',
              accentColor: '#0098ea',
              currency: { label: 'TON' },
              productsFile: '/config/products.coffee.json',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
      ),
    );
    mockTelegramEnv({ launchParams: launchParams(DARK_THEME) });
    init();
    themeParams.mountSync();
  });

  afterEach(() => {
    themeParams.unmount();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    vi.unstubAllGlobals();
  });

  it('toggles the dark class + color-scheme when Telegram emits theme_changed', async () => {
    render(
      <ThemeProvider>
        <span>app</span>
      </ThemeProvider>,
    );

    // Starts dark — the mocked launch palette is a dark theme.
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(document.documentElement.style.colorScheme).toBe('dark');

    // The user switches Telegram to light mode mid-session.
    act(() => {
      emitEvent('theme_changed', {
        theme_params: {
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#999999',
          link_color: '#2481cc',
          button_color: '#2481cc',
          button_text_color: '#ffffff',
          secondary_bg_color: '#f1f1f1',
        },
      });
    });

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
