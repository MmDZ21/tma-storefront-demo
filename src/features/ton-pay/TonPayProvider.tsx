import type { ReactNode } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { manifestUrl } from './config';

/**
 * The single mount point for TON Connect (SPEC §3.3). `manifestUrl` is derived from
 * the live origin, so it works on whatever HTTPS origin the app is deployed to and on
 * localhost in dev. Lazy-loaded at the cart route (see App) so the SDK never ships in
 * the catalog/product first-paint bundle.
 */
export function TonPayProvider({ children }: { children: ReactNode }) {
  return <TonConnectUIProvider manifestUrl={manifestUrl()}>{children}</TonConnectUIProvider>;
}
