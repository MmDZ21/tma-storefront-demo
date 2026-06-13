import { useEffect, useRef } from 'react';
import type { Order } from '@/entities/order/orderStore';
import { TON_RECIPIENT_TESTNET } from './config';
import { watchTonPayment } from './confirm';

/**
 * For a TON order still in 'placed', watch the testnet indexer for the matching
 * incoming payment and call `onConfirmed(txHash)` when it lands — so the **real flow**
 * drives the timeline's 'paid' step (SPEC §3.5), not the demo timer. No-op for a
 * simulated order or a null order.
 *
 * SDK-free (fetch only): the Status screen never imports the wallet SDK through this.
 */
export function useTonConfirmation(
  order: Order | null,
  onConfirmed: (txHash: string) => void,
): void {
  // Keep the latest handler in a ref so the effect re-runs only on order identity,
  // not on every render that passes a fresh inline callback.
  const onConfirmedRef = useRef(onConfirmed);
  onConfirmedRef.current = onConfirmed;

  const watch = order?.paymentMethod === 'ton' && order.status === 'placed';
  const orderId = order?.id;
  const amountNano = order?.amountNano;
  const sinceUnix = order ? Math.floor(order.createdAt / 1000) : 0;

  useEffect(() => {
    if (!watch || !orderId || !amountNano) return;
    const controller = new AbortController();
    void watchTonPayment({
      recipient: TON_RECIPIENT_TESTNET,
      amountNano,
      sinceUnix,
      signal: controller.signal,
    }).then((txHash) => {
      if (txHash && !controller.signal.aborted) onConfirmedRef.current(txHash);
    });
    return () => controller.abort();
  }, [watch, orderId, amountNano, sinceUnix]);
}
