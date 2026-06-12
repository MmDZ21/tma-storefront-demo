import { useEffect } from 'react';
import { closingBehavior } from '@telegram-apps/sdk-react';

/**
 * Enables Telegram's "close anyway?" confirmation while the cart is non-empty
 * (SPEC §3.6), so a viewer doesn't lose an in-progress order by swiping away.
 */
export function useClosingConfirmation(enabled: boolean, active = true): void {
  useEffect(() => {
    if (!active) return;
    try {
      closingBehavior.mount();
      if (enabled) {
        closingBehavior.enableConfirmation();
      } else {
        closingBehavior.disableConfirmation();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[telegram] closingBehavior unavailable:', error);
      }
    }
  }, [enabled, active]);
}
