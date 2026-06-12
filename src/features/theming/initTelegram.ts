import {
  init as initSdk,
  isTMA,
  miniApp,
  themeParams,
  viewport,
  retrieveLaunchParams,
} from '@telegram-apps/sdk-react';

/**
 * Telegram SDK bootstrap (SPEC §2, §3.6, §5).
 *
 * This is the single place the app touches the raw SDK. It wires the event bus,
 * mounts the components slice 1 needs, and exposes Telegram's theme + viewport
 * as CSS variables (`themeParams.bindCssVars()` → `--tg-theme-*`). Every step is
 * defensive: a client that lacks a feature must degrade, never crash (§5).
 */

export interface TelegramInitResult {
  /** False in a normal browser — the §3.9 fallback page takes over. */
  inTelegram: boolean;
  /** 'tdesktop' | 'ios' | 'android' | … when known. */
  platform: string | null;
}

/** Run an SDK step, swallowing unsupported-method errors (dev-logged only). */
function attempt(action: () => void): void {
  try {
    action();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[telegram] non-fatal init step failed:', error);
    }
  }
}

function safePlatform(): string | null {
  try {
    return retrieveLaunchParams().tgWebAppPlatform;
  } catch {
    return null;
  }
}

export function initTelegram(): TelegramInitResult {
  // Outside Telegram, do nothing: the semantic-token fallbacks in index.css keep
  // the UI styled, and the fallback page (slice 7) explains where the app lives.
  if (!isTMA()) {
    return { inTelegram: false, platform: null };
  }

  try {
    initSdk();

    // Theme params drive every color. Mount synchronously so the first paint is
    // already themed (no flash), then publish the --tg-theme-* variables.
    attempt(() => themeParams.mountSync());
    attempt(() => {
      if (themeParams.bindCssVars.isAvailable()) themeParams.bindCssVars();
    });

    // Mini app powers the isDark signal and header/background color control.
    attempt(() => miniApp.mountSync());

    // Viewport mounts asynchronously; once ready, publish --tg-viewport-* and
    // expand to full height on load (SPEC §3.6).
    attempt(() => {
      void viewport
        .mount()
        .then(() => {
          if (viewport.bindCssVars.isAvailable()) viewport.bindCssVars();
          if (viewport.expand.isAvailable()) viewport.expand();
        })
        .catch((error: unknown) => {
          if (import.meta.env.DEV) {
            console.warn('[telegram] viewport mount failed:', error);
          }
        });
    });

    return { inTelegram: true, platform: safePlatform() };
  } catch (error) {
    // A hard SDK failure must never blank the app — fall back to token theming.
    if (import.meta.env.DEV) {
      console.warn('[telegram] init failed, using fallback theming:', error);
    }
    return { inTelegram: false, platform: null };
  }
}

/**
 * Tell Telegram the app is ready to be shown (hides the native loading
 * placeholder). Call once after the first paint for the "instant load" feel.
 */
export function markTelegramReady(): void {
  if (miniApp.ready.isAvailable()) {
    miniApp.ready();
  }
}
