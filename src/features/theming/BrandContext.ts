import { createContext, useContext } from 'react';
import type { Brand } from '@/config/brand';

/** Holds the active, validated brand for the whole app (see ThemeProvider). */
export const BrandContext = createContext<Brand | null>(null);

/** Access the active brand. Throws if used outside <ThemeProvider>. */
export function useBrand(): Brand {
  const brand = useContext(BrandContext);
  if (!brand) {
    throw new Error('useBrand must be used within a <ThemeProvider>');
  }
  return brand;
}
