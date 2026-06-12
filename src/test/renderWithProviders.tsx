import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/features/theming';
import { TelegramProvider } from '@/features/telegram';

interface Options {
  route?: string;
  inTelegram?: boolean;
}

/** Render UI inside the app's providers (Telegram env, theme/brand, router). */
export function renderWithProviders(ui: ReactElement, options: Options = {}): RenderResult {
  const { route = '/', inTelegram = false } = options;
  return render(
    <TelegramProvider
      value={{ inTelegram, platform: inTelegram ? 'tdesktop' : null, nativeControls: false }}
    >
      <ThemeProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </ThemeProvider>
    </TelegramProvider>,
  );
}
