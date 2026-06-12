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
