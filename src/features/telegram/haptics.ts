import {
  hapticFeedback,
  type ImpactHapticFeedbackStyle,
  type NotificationHapticFeedbackType,
} from '@telegram-apps/sdk-react';

/**
 * Thin, defensive wrapper over Telegram haptics (SPEC §3.2/§3.6 — haptics on key
 * actions). Each call is a no-op when unsupported, so callers needn't guard.
 */
export const haptics = {
  impact(style: ImpactHapticFeedbackStyle = 'medium'): void {
    if (hapticFeedback.impactOccurred.isAvailable()) {
      hapticFeedback.impactOccurred(style);
    }
  },
  notification(type: NotificationHapticFeedbackType = 'success'): void {
    if (hapticFeedback.notificationOccurred.isAvailable()) {
      hapticFeedback.notificationOccurred(type);
    }
  },
  selection(): void {
    if (hapticFeedback.selectionChanged.isAvailable()) {
      hapticFeedback.selectionChanged();
    }
  },
};
