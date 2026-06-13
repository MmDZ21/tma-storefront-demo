import { CHAIN, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { TON_RECIPIENT_TESTNET } from './config';

export interface TonPaymentResult {
  /** TON Connect `sendTransaction` result — a signed external message (base64 BOC). */
  boc: string;
  /** The exact amount sent, in nanotons. */
  amountNano: string;
  /** The connected wallet (user-friendly testnet address). */
  payerAddress: string;
}

/** How long a transaction request stays valid for the wallet to sign (seconds). */
const TX_VALID_FOR_SECONDS = 360;

/**
 * Wallet adapter (SPEC §3.3, §6) — the ONLY place a screen reaches the TON Connect
 * SDK. `connect()` opens the wallet picker; `pay(amountNano)` sends the cart total to
 * the demo testnet recipient on **testnet** and returns the BOC + payer for the Order
 * seam. The amount is a nanoton `bigint` (no float ever reaches the chain).
 */
export function useTonPay() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const connected = address !== '';

  const connect = (): void => {
    void tonConnectUI.openModal();
  };

  const pay = async (amountNano: bigint): Promise<TonPaymentResult> => {
    const result = await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + TX_VALID_FOR_SECONDS,
      // Pin the chain so a mainnet-connected wallet is rejected, not silently charged.
      network: CHAIN.TESTNET,
      messages: [{ address: TON_RECIPIENT_TESTNET, amount: amountNano.toString() }],
    });
    return { boc: result.boc, amountNano: amountNano.toString(), payerAddress: address };
  };

  return { connected, address, connect, pay };
}
