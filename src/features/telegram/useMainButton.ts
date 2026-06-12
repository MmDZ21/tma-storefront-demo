import { useEffect } from 'react';
import { mainButton } from '@telegram-apps/sdk-react';

export interface MainButtonConfig {
  text: string;
  onClick: () => void;
  enabled?: boolean;
  /** Drive the native button only when true (e.g. inside Telegram). */
  active?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

function devWarn(message: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
}

/**
 * Drives Telegram's native MainButton as the single primary CTA per screen
 * (SPEC §3.6, §5: the MainButton text drives the funnel). Inactive → no-op, so
 * an in-app button can take over outside Telegram.
 */
export function useMainButton(config: MainButtonConfig): void {
  const { text, onClick, enabled = true, active = true, backgroundColor, textColor } = config;

  // Mount while active; hide on cleanup.
  useEffect(() => {
    if (!active) return;
    try {
      mainButton.mount();
    } catch (error) {
      devWarn('[telegram] mainButton mount failed:', error);
      return;
    }
    return () => {
      try {
        mainButton.setParams({ isVisible: false });
      } catch (error) {
        devWarn('[telegram] mainButton hide failed:', error);
      }
    };
  }, [active]);

  // Reflect label, state, and brand colors.
  useEffect(() => {
    if (!active) return;
    try {
      mainButton.setParams({
        text,
        isVisible: true,
        isEnabled: enabled,
        ...(backgroundColor ? { backgroundColor: backgroundColor as `#${string}` } : {}),
        ...(textColor ? { textColor: textColor as `#${string}` } : {}),
      });
    } catch (error) {
      devWarn('[telegram] mainButton setParams failed:', error);
    }
  }, [active, text, enabled, backgroundColor, textColor]);

  // Bind the click handler.
  useEffect(() => {
    if (!active) return;
    try {
      mainButton.onClick(onClick);
    } catch (error) {
      devWarn('[telegram] mainButton onClick failed:', error);
      return;
    }
    return () => {
      try {
        mainButton.offClick(onClick);
      } catch (error) {
        devWarn('[telegram] mainButton offClick failed:', error);
      }
    };
  }, [active, onClick]);
}
