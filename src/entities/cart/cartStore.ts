import { create } from 'zustand';
import type { Product } from '@/config/products';
import { tonToNano } from '@/shared/ton';

/** A single cart line: a product and how many of it. */
export interface CartLine {
  product: Product;
  qty: number;
}

interface CartState {
  /** Lines keyed by product id. */
  lines: Record<string, CartLine>;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

/** Cart state (SPEC §2: Zustand). No backend — this is the whole "order" model. */
export const useCartStore = create<CartState>((set) => ({
  lines: {},

  add: (product, qty = 1) =>
    set((state) => {
      const current = state.lines[product.id]?.qty ?? 0;
      return { lines: { ...state.lines, [product.id]: { product, qty: current + qty } } };
    }),

  setQty: (productId, qty) =>
    set((state) => {
      const existing = state.lines[productId];
      if (!existing) return state;
      if (qty <= 0) {
        const { [productId]: _removed, ...rest } = state.lines;
        return { lines: rest };
      }
      return { lines: { ...state.lines, [productId]: { ...existing, qty } } };
    }),

  remove: (productId) =>
    set((state) => {
      const { [productId]: _removed, ...rest } = state.lines;
      return { lines: rest };
    }),

  clear: () => set({ lines: {} }),
}));

/** Total number of items across all lines. */
export function cartCount(lines: Record<string, CartLine>): number {
  return Object.values(lines).reduce((total, line) => total + line.qty, 0);
}

/** Total price in TON across all lines (float — display only, never the sent amount). */
export function cartTotalTon(lines: Record<string, CartLine>): number {
  return Object.values(lines).reduce((sum, line) => sum + line.product.priceTon * line.qty, 0);
}

/**
 * Total price across all lines, in exact nanotons. This is the source of truth for the
 * amount charged (SPEC slice 5): each price is converted to nanotons and summed as
 * bigints, so no float arithmetic ever touches money.
 */
export function cartTotalNano(lines: Record<string, CartLine>): bigint {
  return Object.values(lines).reduce(
    (sum, line) => sum + tonToNano(line.product.priceTon) * BigInt(line.qty),
    0n,
  );
}
