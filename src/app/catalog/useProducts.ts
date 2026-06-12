import { useEffect, useState } from 'react';
import { loadProducts, type Product } from '@/config/products';

export type ProductsState =
  | { status: 'loading' }
  | { status: 'ready'; products: Product[] }
  | { status: 'error' };

/** Loads + validates the active brand's products file, abortably. */
export function useProducts(productsFile: string): ProductsState {
  const [state, setState] = useState<ProductsState>({ status: 'loading' });

  useEffect(() => {
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
