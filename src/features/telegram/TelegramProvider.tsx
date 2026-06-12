import type { ReactNode } from 'react';
import { TelegramContext, type TelegramEnv } from './TelegramContext';

/** Provides the Telegram environment (from `initTelegram()`) to the tree. */
export function TelegramProvider({ value, children }: { value: TelegramEnv; children: ReactNode }) {
  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}
