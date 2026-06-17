/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * TON **testnet** recipient address, set at deploy time (e.g. Cloudflare Pages env).
   * Absent in dev/CI → the app falls back to a placeholder that `isRecipientConfigured()`
   * rejects, so the Pay button is disabled rather than sending to a junk address.
   */
  readonly VITE_TON_RECIPIENT_TESTNET?: string;
  /** Telegram bot / Mini App deep link for the outside-Telegram fallback (QR + button). */
  readonly VITE_BOT_URL?: string;
  /**
   * Optional toncenter API key for the payment-confirmation indexer call — raises the rate
   * limit so confirmation is reliable. Absent → the unkeyed public endpoint is used.
   */
  readonly VITE_TONCENTER_API_KEY?: string;
}
