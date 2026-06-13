import { useEffect, useState } from 'react';
import { loadProducts, type Product } from '@/config/products';

export type ProductsState =
  | { status: 'loading' }
  | { status: 'ready'; products: Product[] }
  | { status: 'error' };

/**
 * Loads + validates the active brand's products file, abortably. Pass `null` while
 * the brand is still resolving — the hook stays in `loading` and fetches nothing, so
 * the catalog fetches the resolved skin's products exactly once (no default-skin
 * pre-fetch). See `useBrandReady`.
 */
export function useProducts(productsFile: string | null): ProductsState {
  const [state, setState] = useState<ProductsState>({ status: 'loading' });

  useEffect(() => {
    if (productsFile === null) return; // brand not resolved yet — stay in loading
    const controller = new AbortController();
    setState({ status: 'loading' });
    loadProducts(productsFile, controller.signal)
      .then((products) => {
        setState({ status: 'ready', products });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (import.meta.env.DEV) {
          console.warn('[products] failed to load:', error);
        }
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [productsFile]);

  return state;
}
