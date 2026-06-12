import { useEffect } from 'react';
import { backButton } from '@telegram-apps/sdk-react';

function devWarn(message: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
}

/**
 * Shows Telegram's native BackButton on a subpage and routes its press to
 * `onClick` (SPEC §3.6). No-ops when `active` is false (e.g. outside Telegram).
 */
export function useBackButton(onClick: () => void, active = true): void {
  useEffect(() => {
    if (!active) return;
    try {
      backButton.mount();
      backButton.show();
      backButton.onClick(onClick);
    } catch (error) {
      devWarn('[telegram] backButton unavailable:', error);
      return;
    }
    return () => {
      try {
        backButton.offClick(onClick);
        backButton.hide();
      } catch (error) {
        devWarn('[telegram] backButton teardown failed:', error);
      }
    };
  }, [onClick, active]);
}
