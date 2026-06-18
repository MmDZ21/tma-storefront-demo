import { z } from 'zod';
import { TON_INDEXER_BASE, TONCENTER_API_KEY } from './config';

/** The minimal slice of a toncenter v3 transaction we rely on. */
export interface IndexerTransaction {
  hash: string;
  now: number;
  in_msg?: {
    value?: string | null;
    source?: string | null;
    message_content?: { decoded?: { comment?: string | null } | null } | null;
  } | null;
}

// Schema for ONLY the fields we read. toncenter returns far more; zod strips the rest.
// Everything below `hash`/`now` is nullish because real responses omit it (out-messages,
// non-text bodies, undecoded comments).
const TxSchema = z.object({
  hash: z.string(),
  now: z.number(),
  in_msg: z
    .object({
      value: z.string().nullish(),
      source: z.string().nullish(),
      message_content: z
        .object({ decoded: z.object({ comment: z.string().nullish() }).nullish() })
        .nullish(),
    })
    .nullish(),
});

/**
 * Parse a toncenter v3 transactions response, **fail-closed**: anything malformed yields
 * `[]` (never a false confirmation — security review F3). Parsed per-transaction so one
 * odd entry doesn't discard the whole batch.
 */
export function parseIndexerResponse(data: unknown): IndexerTransaction[] {
  const envelope = z.object({ transactions: z.array(z.unknown()) }).safeParse(data);
  if (!envelope.success) return [];
  const out: IndexerTransaction[] = [];
  for (const raw of envelope.data.transactions) {
    const tx = TxSchema.safeParse(raw);
    if (tx.success) out.push(tx.data);
  }
  return out;
}

export interface PaymentCriteria {
  /** Exact nanoton amount expected (string, from the Order). */
  amountNano: string;
  /** Per-order comment nonce that uniquely binds an on-chain tx to THIS order. */
  comment: string;
}

/**
 * Find the transaction confirming THIS order among a recipient's recent inbound txs: an
 * incoming message carrying our unique comment `nonce`, of exactly `amountNano`. The
 * comment makes attribution **unique** — no equal-amount collision, no riding another
 * buyer's payment (security review F1) — and the amount guards underpayment. Returns the
 * tx hash, or null. Requires the comment to be present — an undecoded/absent comment never
 * matches (fail-closed).
 *
 * Deliberately NO time bound. The per-order nonce already binds a tx to exactly one order,
 * so a tx whose on-chain `now` predates the order can't be some other order's payment. A
 * `tx.now >= sinceUnix` check added only a clock-skew failure mode: `sinceUnix` derives
 * from `order.createdAt`, which is stamped *after* the wallet returns and routinely lands a
 * second or more AFTER the tx's own `now` — silently rejecting the real payment (the
 * "stuck on Confirming…" bug). The nonce gives exact binding without trusting any clock.
 */
export function matchPaymentTx(
  transactions: IndexerTransaction[],
  { amountNano, comment }: PaymentCriteria,
): string | null {
  const match = transactions.find(
    (tx) =>
      tx.in_msg?.message_content?.decoded?.comment === comment && tx.in_msg?.value === amountNano,
  );
  return match ? match.hash : null;
}

/**
 * Auth header for toncenter when an API key is configured (raises the rate limit so
 * confirmation is reliable). Empty when no key → the request still works against the unkeyed
 * public endpoint (graceful degradation). Auth only — does not touch the query or response.
 */
export function indexerHeaders(apiKey: string = TONCENTER_API_KEY): Record<string, string> {
  return apiKey ? { 'X-API-Key': apiKey } : {};
}

/**
 * Fetch a testnet account's recent transactions from the toncenter v3 indexer. The query
 * is scoped to `account`, so every returned `in_msg` is inbound to our recipient — we
 * don't re-check the destination (which would need address normalisation). Response is
 * zod-validated and fail-closed.
 */
export async function fetchRecentTransactions(
  account: string,
  signal?: AbortSignal,
): Promise<IndexerTransaction[]> {
  const url = `${TON_INDEXER_BASE}/transactions?account=${encodeURIComponent(account)}&limit=20&sort=desc`;
  const res = await fetch(url, { headers: indexerHeaders(), ...(signal ? { signal } : {}) });
  if (!res.ok) {
    throw new Error(`Indexer error: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  return parseIndexerResponse(data);
}

export interface WatchOptions extends PaymentCriteria {
  recipient: string;
  signal?: AbortSignal;
  /** Bounded so we never poll forever. */
  attempts?: number;
  intervalMs?: number;
}

/**
 * Poll the testnet indexer until the matching payment appears (returns its tx hash), or
 * the bounded attempt window runs out (returns null — the caller leaves the order
 * 'placed' and shows an "awaiting confirmation" terminal state, never dead-ends).
 */
export async function watchTonPayment(opts: WatchOptions): Promise<string | null> {
  const { recipient, amountNano, comment, signal } = opts;
  const attempts = opts.attempts ?? 20;
  const intervalMs = opts.intervalMs ?? 3000;
  for (let i = 0; i < attempts; i++) {
    if (signal?.aborted) return null;
    try {
      const txs = await fetchRecentTransactions(recipient, signal);
      const hash = matchPaymentTx(txs, { amountNano, comment });
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
