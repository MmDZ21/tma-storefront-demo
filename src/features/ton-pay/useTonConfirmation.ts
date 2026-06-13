import { useEffect, useRef, useState } from 'react';
import type { Order } from '@/entities/order/orderStore';
import { TON_RECIPIENT_TESTNET, isRecipientConfigured } from './config';
import { watchTonPayment } from './confirm';

export type ConfirmPhase = 'idle' | 'watching' | 'unconfirmed';

/**
 * For a TON order still in 'placed', watch the testnet indexer for the matching incoming
 * payment (bound by the order's comment nonce) and call `onConfirmed(txHash)` when it
 * lands — so the **real flow** drives the timeline's 'paid' step (SPEC §3.5), not the demo
 * timer. No-op for a simulated/null order or when no recipient is configured.
 *
 * Returns the watch `phase` and a `retry()` to re-arm after the bounded window gives up,
 * so the UI can show a terminal "couldn't confirm" state instead of "confirming…" forever
 * (security review F5). SDK-free (fetch only): the Status screen never imports the SDK.
 */
export function useTonConfirmation(
  order: Order | null,
  onConfirmed: (txHash: string) => void,
): { phase: ConfirmPhase; retry: () => void } {
  // Keep the latest handler in a ref so the effect re-runs only on order identity, not on
  // every render that passes a fresh inline callback.
  const onConfirmedRef = useRef(onConfirmed);
  onConfirmedRef.current = onConfirmed;

  const [phase, setPhase] = useState<ConfirmPhase>('idle');
  const [attempt, setAttempt] = useState(0);

  const watch = order?.paymentMethod === 'ton' && order.status === 'placed';
  const orderId = order?.id;
  const amountNano = order?.amountNano;
  const comment = order?.paymentNonce;
  const sinceUnix = order ? Math.floor(order.createdAt / 1000) : 0;

  useEffect(() => {
    if (!watch || !orderId || !amountNano || !comment || !isRecipientConfigured()) {
      setPhase('idle');
      return;
    }
    setPhase('watching');
    const controller = new AbortController();
    void watchTonPayment({
      recipient: TON_RECIPIENT_TESTNET,
      amountNano,
      sinceUnix,
      comment,
      signal: controller.signal,
    }).then((txHash) => {
      if (controller.signal.aborted) return;
      if (txHash) onConfirmedRef.current(txHash);
      else setPhase('unconfirmed');
    });
    return () => controller.abort();
  }, [watch, orderId, amountNano, comment, sinceUnix, attempt]);

  const retry = () => setAttempt((n) => n + 1);
  return { phase, retry };
}
