import { createContext, useContext } from 'react';

export interface TelegramEnv {
  /** True when Telegram launch data is present (real client or dev mock). */
  inTelegram: boolean;
  /** 'tdesktop' | 'ios' | 'android' | … when known. */
  platform: string | null;
  /**
   * True only in a real Telegram client that renders native chrome (MainButton,
   * BackButton). False under the dev mock / outside Telegram, where in-app
   * equivalents are shown instead — the mock can't paint Telegram's own UI.
   */
  nativeControls: boolean;
}

/** Defaults to "not in Telegram" so components degrade gracefully in tests. */
export const TelegramContext = createContext<TelegramEnv>({
  inTelegram: false,
  platform: null,
  nativeControls: false,
});

export function useTelegram(): TelegramEnv {
  return useContext(TelegramContext);
}
