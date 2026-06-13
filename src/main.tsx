import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import { initTelegram, ThemeProvider } from '@/features/theming';
import { TelegramProvider } from '@/features/telegram';
import { App } from '@/app/App';

// Lazy so the QR dependency lands in its own chunk, fetched only outside Telegram.
const OutsideTelegram = lazy(() =>
  import('@/app/fallback/OutsideTelegram').then((m) => ({ default: m.OutsideTelegram })),
);

async function bootstrap(): Promise<void> {
  // In development, imitate a Telegram client so the themed UI renders in a
  // normal browser. The dynamic import sits behind the DEV guard, so the mock
  // module is dead-code-eliminated from production builds entirely.
  if (import.meta.env.DEV) {
    const { mockTelegramEnvForDev } = await import('@/features/theming/mockEnv');
    mockTelegramEnvForDev();
  }

  const env = initTelegram();
  // Native Telegram chrome only exists in a real client; under the dev mock we
  // have Telegram data but must render in-app controls (the mock paints no UI).
  const telegramEnv = { ...env, nativeControls: env.inTelegram && !import.meta.env.DEV };

  // Outside Telegram → the §3.9 fallback. In dev, `?fallback` previews it.
  const previewFallback =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('fallback');
  const showFallback = !telegramEnv.inTelegram || previewFallback;

  const rootEl = document.getElementById('root');
  if (!rootEl) {
    throw new Error('Root element #root not found');
  }

  createRoot(rootEl).render(
    <StrictMode>
      <TelegramProvider value={telegramEnv}>
        <ThemeProvider>
          {showFallback ? (
            <Suspense fallback={null}>
              <OutsideTelegram />
            </Suspense>
          ) : (
            /*
             * TODO(slice 8 — BLOCKING, needs on-device QA via the :10808 proxy):
             * Telegram delivers launch data in the URL *hash*
             * (#tgWebAppData=…&tgWebAppStartParam=PAYLOAD). HashRouter also owns the
             * hash, so on a real-client deep link (t.me/<bot>/<app>?startapp=PAYLOAD)
             * the initial hash is the Telegram params — not a route — and HashRouter
             * matches nothing while the startapp payload is dropped. The dev mock
             * injects launch params via the SDK store (not the URL), which is why
             * local/jsdom never reproduces this. Agreed fix (do NOT implement before
             * slice 8): after initTelegram() caches launch params to sessionStorage,
             * read retrieveLaunchParams().tgWebAppStartParam, map it to a route, and
             * set window.location.hash to that route BEFORE mounting <HashRouter>.
             * Keep HashRouter (refresh-safe on static hosting). See DECISIONS.md →
             * "Pre-ton-pay prep" (blocking TODO for slice 8).
             */
            <HashRouter>
              <App />
            </HashRouter>
          )}
        </ThemeProvider>
      </TelegramProvider>
    </StrictMode>,
  );
}

void bootstrap();
