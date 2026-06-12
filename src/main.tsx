import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initTelegram, ThemeProvider } from '@/features/theming';
import { mockTelegramEnvForDev } from '@/features/theming/mockEnv';
import { App } from '@/app/App';

// In development, imitate a Telegram client so the themed UI renders in a normal
// browser. The guard means this whole branch (and the import) is tree-shaken out
// of production builds.
if (import.meta.env.DEV) {
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
