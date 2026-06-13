import { createContext, useContext } from 'react';
import type { Brand } from '@/config/brand';

/** The brand context value: the active brand plus whether it has finished loading. */
export interface BrandContextValue {
  /** The active, validated brand (the neutral default until brand.json resolves). */
  brand: Brand;
  /**
   * True once `loadBrand` has settled — resolved to the real brand *or* fallen back
   * to the default. Screens gate their first products fetch on this, so the catalog
   * loads the resolved skin's products exactly once (no default-skin pre-fetch /
   * loading→ready flicker on a re-skin). See ThemeProvider + useProducts.
   */
  ready: boolean;
}

/** Holds the active brand + readiness for the whole app (see ThemeProvider). */
export const BrandContext = createContext<BrandContextValue | null>(null);

function useBrandContext(): BrandContextValue {
  const value = useContext(BrandContext);
  if (!value) {
    throw new Error('useBrand must be used within a <ThemeProvider>');
  }
  return value;
}

/** Access the active brand. Throws if used outside <ThemeProvider>. */
export function useBrand(): Brand {
  return useBrandContext().brand;
}

/**
 * Whether the brand has finished resolving. Screens pass this to `useProducts`
 * to defer the products fetch until the active skin is known.
 */
export function useBrandReady(): boolean {
  return useBrandContext().ready;
}
