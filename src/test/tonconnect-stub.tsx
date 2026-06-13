import type { ReactNode } from 'react';

/**
 * Test stub for `@tonconnect/ui-react` (aliased in vite.config `test.alias`).
 *
 * Keeps the heavy real SDK out of jsdom and makes the wallet flow deterministic: the
 * stub presents a connected testnet wallet whose `sendTransaction` resolves with a
 * fixed BOC, so the Cart "pay with TON" path is exercisable without a real wallet.
 * The production build uses the real package (no alias outside tests).
 */

export const CHAIN = { MAINNET: '-239', TESTNET: '-3' } as const;

/** A connected, user-friendly testnet address — so `connected` is true in tests. */
export const STUB_ADDRESS = '0QStubTestnetFriendlyAddressAAAAAAAAAAAAAAAAAAAA';
/** The BOC the stubbed wallet "returns" from sendTransaction. */
export const STUB_BOC = 'te6cckStubBocForTests==';

const tonConnectUI = {
  account: { address: '0:stubrawaddress', chain: CHAIN.TESTNET },
  async sendTransaction() {
    return { boc: STUB_BOC };
  },
  async openModal() {
    /* no-op */
  },
  async disconnect() {
    /* no-op */
  },
};

export function useTonConnectUI() {
  return [tonConnectUI, () => {}] as const;
}

export function useTonAddress(): string {
  return STUB_ADDRESS;
}

export function TonConnectUIProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
