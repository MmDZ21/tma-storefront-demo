import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initTelegram, ThemeProvider } from '@/features/theming';
import { App } from '@/app/App';

async function bootstrap(): Promise<void> {
  // In development, imitate a Telegram client so the themed UI renders in a
  // normal browser. The dynamic import sits behind the DEV guard, so the mock
  // module is dead-code-eliminated from production builds entirely — it is never
  // bundled or fetched in the live app.
  if (import.meta.env.DEV) {
    const { mockTelegramEnvForDev } = await import('@/features/theming/mockEnv');
    mockTelegramEnvForDev();
  }

  initTelegram();

  const rootEl = document.getElementById('root');
  if (!rootEl) {
    throw new Error('Root element #root not found');
  }

  createRoot(rootEl).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
}

void bootstrap();
