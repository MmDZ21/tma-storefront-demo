/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * TON **testnet** recipient address, set at deploy time (e.g. Cloudflare Pages env).
   * Absent in dev/CI → the app falls back to a placeholder that `isRecipientConfigured()`
   * rejects, so the Pay button is disabled rather than sending to a junk address.
   */
  readonly VITE_TON_RECIPIENT_TESTNET?: string;
}
