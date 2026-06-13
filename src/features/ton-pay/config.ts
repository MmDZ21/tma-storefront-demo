/**
 * TON Connect payment configuration (SPEC §3.3, §4 — TESTNET ONLY).
 *
 * SDK-free on purpose: both the wallet adapter (useTonPay, imports the SDK) and the
 * fetch-only confirmation poller import this, so keeping it free of
 * `@tonconnect/ui-react` lets the confirmation path (and the Status screen) stay out of
 * the SDK's dependency graph.
 */

/** Sentinel used when no recipient is configured — `isRecipientConfigured()` rejects it. */
const RECIPIENT_PLACEHOLDER = '0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * Demo recipient on TON **testnet**, set at deploy time via `VITE_TON_RECIPIENT_TESTNET`
 * (Cloudflare Pages env) — NOT hardcoded. When unset it falls back to a placeholder that
 * `isRecipientConfigured()` rejects, so an unconfigured build **fails loudly** (the Pay
 * button is disabled, Demo mode still works) instead of silently sending to / polling a
 * junk address (security review F2).
 */
export const TON_RECIPIENT_TESTNET =
  import.meta.env.VITE_TON_RECIPIENT_TESTNET ?? RECIPIENT_PLACEHOLDER;

/**
 * Cheap "is it set + well-formed" gate: a TON user-friendly address is 48 base64url
 * chars. Exact CRC validation is delegated to the wallet (it rejects malformed addresses
 * on send); this just prevents shipping the placeholder / obvious garbage.
 */
export function isValidRecipient(address: string): boolean {
  return address !== RECIPIENT_PLACEHOLDER && /^[A-Za-z0-9_-]{48}$/.test(address);
}

/** Whether a real recipient is configured for the live TON flow. */
export function isRecipientConfigured(): boolean {
  return isValidRecipient(TON_RECIPIENT_TESTNET);
}

/**
 * TON Connect manifest URL. Derived from the live origin so it resolves to whatever
 * HTTPS origin the app is deployed to (Cloudflare Pages), and to http://localhost in dev
 * (which TON Connect permits). The manifest itself must be served over HTTPS in
 * production (SPEC §5) — see DECISIONS "Slice 5".
 */
export function manifestUrl(): string {
  return new URL('/tonconnect-manifest.json', window.location.origin).href;
}

/** Public testnet indexer (toncenter v3) used to confirm the incoming payment. */
export const TON_INDEXER_BASE = 'https://testnet.toncenter.com/api/v3';

/** Testnet explorer link for a confirmed transaction. */
export function explorerTxUrl(txHash: string): string {
  return `https://testnet.tonviewer.com/transaction/${encodeURIComponent(txHash)}`;
}

/** Testnet explorer link for an account (used before a tx hash is known). */
export function explorerAccountUrl(address: string): string {
  return `https://testnet.tonviewer.com/${encodeURIComponent(address)}`;
}
