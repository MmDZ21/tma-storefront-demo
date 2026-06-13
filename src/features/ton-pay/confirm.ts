import { TON_INDEXER_BASE } from './config';

/** The minimal slice of a toncenter v3 transaction we rely on. */
export interface IndexerTransaction {
  hash: string;
  now: number;
  in_msg?: { value?: string | null; source?: string | null } | null;
}

export interface PaymentCriteria {
  /** Exact nanoton amount expected (string, from the Order). */
  amountNano: string;
  /** Unix seconds; only transactions at/after this count. */
  sinceUnix: number;
}

/**
 * Pick the transaction that confirms our payment from a recipient's recent inbound
 * transactions: an incoming message of exactly `amountNano`, at/after `sinceUnix`.
 * Returns the tx hash, or null if none match.
 *
 * SECURITY-PASS NOTE: this matches on amount + time only — it does NOT verify the
 * sender or bind to our specific external message (that needs message-hash matching
 * via @ton/core, or a per-order comment nonce). Adequate for a single-user testnet
 * demo; hardening is a documented follow-up (see DECISIONS "Slice 5").
 */
export function matchPaymentTx(
  transactions: IndexerTransaction[],
  { amountNano, sinceUnix }: PaymentCriteria,
): string | null {
  const match = transactions.find((tx) => tx.in_msg?.value === amountNano && tx.now >= sinceUnix);
  return match ? match.hash : null;
}

/** Fetch a testnet account's recent transactions from the toncenter v3 indexer. */
export async function fetchRecentTransactions(
  account: string,
  signal?: AbortSignal,
): Promise<IndexerTransaction[]> {
  const url = `${TON_INDEXER_BASE}/transactions?account=${encodeURIComponent(account)}&limit=20&sort=desc`;
  const res = await fetch(url, signal ? { signal } : undefined);
  if (!res.ok) {
    throw new Error(`Indexer error: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  const list = (data as { transactions?: unknown }).transactions;
  return Array.isArray(list) ? (list as IndexerTransaction[]) : [];
}

export interface WatchOptions extends PaymentCriteria {
  recipient: string;
  signal?: AbortSignal;
  /** Bounded so we never poll forever. */
  attempts?: number;
  intervalMs?: number;
}

/**
 * Poll the testnet indexer until the matching payment appears (returns its tx hash),
 * or the bounded attempt window runs out (returns null — the caller leaves the order
 * 'placed' and shows an "awaiting confirmation" hint, never dead-ends).
 */
export async function watchTonPayment(opts: WatchOptions): Promise<string | null> {
  const { recipient, amountNano, sinceUnix, signal } = opts;
  const attempts = opts.attempts ?? 20;
  const intervalMs = opts.intervalMs ?? 3000;
  for (let i = 0; i < attempts; i++) {
    if (signal?.aborted) return null;
    try {
      const txs = await fetchRecentTransactions(recipient, signal);
      const hash = matchPaymentTx(txs, { amountNano, sinceUnix });
      if (hash) return hash;
    } catch {
      // Transient indexer error — keep trying within the bounded window.
    }
    await delay(intervalMs, signal);
  }
  return null;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}
