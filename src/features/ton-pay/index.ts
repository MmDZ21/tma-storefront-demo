/**
 * TON Connect payment adapter (SPEC §3.3, §6) — **SDK-free public surface**.
 *
 * Only the confirmation poller + explorer links live here (no `@tonconnect/ui-react`),
 * so screens in the main chunk (e.g. Status) can import them without dragging the
 * heavy SDK into first paint. The wallet pieces that DO import the SDK — `TonPayProvider`
 * and `useTonPay` — are imported directly from their modules by the lazily-loaded cart
 * route (`CartRoute`), keeping the SDK in the cart chunk. Screens still never touch the
 * raw SDK; they only ever go through this adapter.
 */
export { useTonConfirmation } from './useTonConfirmation';
export { matchPaymentTx, type IndexerTransaction } from './confirm';
export { explorerTxUrl, explorerAccountUrl } from './config';
