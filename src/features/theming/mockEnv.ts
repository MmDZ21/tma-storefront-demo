import { mockTelegramEnv } from '@telegram-apps/sdk-react';

/**
 * Dev-only Telegram environment mock.
 *
 * Lets `npm run dev` render the real, themed UI in an ordinary browser by
 * imitating a Telegram client (dark theme + sample launch params). It is only
 * imported behind `import.meta.env.DEV`, so it is tree-shaken out of production
 * builds — the live app must use the genuine Telegram environment.
 *
 * It runs on every load (no `isTMA()` short-circuit): `mockTelegramEnv` persists
 * launch params across reloads, but the postMessage interception it installs is
 * per-load, so it must be re-applied each time or `init()` throws on reload.
 *
 * Launch params are passed as a raw query string (the on-the-wire format), which
 * is the format Telegram itself delivers and keeps the mock fully typed.
 */
export function mockTelegramEnvForDev(): void {
  // A Telegram "Night" palette, so the dev preview shows the native dark theme.
  const themeParams = {
    accent_text_color: '#6ab2f2',
    bg_color: '#0e1621',
    button_color: '#5288c1',
    button_text_color: '#ffffff',
    destructive_text_color: '#ec3942',
    header_bg_color: '#17212b',
    hint_color: '#708499',
    link_color: '#6ab3f3',
    secondary_bg_color: '#17212b',
    section_bg_color: '#17212b',
    section_header_text_color: '#6ab3f3',
    section_separator_color: '#101921',
    subtitle_text_color: '#708499',
    text_color: '#f5f5f5',
  };

  const initData = new URLSearchParams({
    user: JSON.stringify({
      id: 1,
      first_name: 'Demo',
      last_name: 'User',
      username: 'demo',
      language_code: 'en',
    }),
    auth_date: Math.floor(Date.now() / 1000).toString(),
    signature: 'mock-signature',
    hash: 'mock-hash',
  }).toString();

  const launchParams = new URLSearchParams({
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppThemeParams: JSON.stringify(themeParams),
    tgWebAppData: initData,
  }).toString();

  mockTelegramEnv({ launchParams });
}
