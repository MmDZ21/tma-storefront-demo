/**
 * TON Connect payment configuration (SPEC §3.3, §4 — TESTNET ONLY).
 *
 * SDK-free on purpose: both the wallet adapter (useTonPay, imports the SDK) and the
 * fetch-only confirmation poller import this, so keeping it free of
 * `@tonconnect/ui-react` lets the confirmation path (and the Status screen) stay out
 * of the SDK's dependency graph.
 */

/**
 * Demo recipient on TON **testnet**. PLACEHOLDER — replace with the demo's own
 * testnet receiving address before on-device QA (same status as `APP.botUrl`).
 * Testnet TON is valueless, but `sendTransaction` validates the address, so the live
 * flow needs a real testnet address here.
 */
export const TON_RECIPIENT_TESTNET = '0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * TON Connect manifest URL. Derived from the live origin so it resolves to whatever
 * HTTPS origin the app is deployed to (Cloudflare Pages), and to http://localhost in
 * dev (which TON Connect permits). The manifest itself must be served over HTTPS in
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
