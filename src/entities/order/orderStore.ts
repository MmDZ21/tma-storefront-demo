import { create } from 'zustand';
import type { CartLine } from '@/entities/cart/cartStore';

export type OrderStatus = 'placed' | 'paid' | 'delivered';
export type PaymentMethod = 'ton' | 'simulated';

/** The order lifecycle, in order — drives the status timeline (SPEC §3.5). */
export const ORDER_STATUS_SEQUENCE: readonly OrderStatus[] = ['placed', 'paid', 'delivered'];

/** The next status after `status`, or null if it's the final one. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_SEQUENCE.indexOf(status);
  return ORDER_STATUS_SEQUENCE[index + 1] ?? null;
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  priceTon: number;
  qty: number;
}

/**
 * On-chain payment details captured by ton-pay (SPEC §3.4, slice 5). All optional,
 * so a simulated order omits them entirely. TON Connect's `sendTransaction` returns
 * a `boc` immediately, while the confirmed `txHash` is resolved later from an
 * indexer — hence both exist and are distinct. `amountNano` keeps the exact integer
 * amount (nanotons) that `totalTon` (a float) can't represent for on-chain matching.
 */
export interface PaymentDetails {
  /** Exact amount sent on-chain, in nanotons (string preserves integer precision). */
  amountNano?: string;
  /** TON Connect `sendTransaction` result (base64 BOC), before indexer confirmation. */
  boc?: string;
  /** Address of the wallet that paid. */
  payerAddress?: string;
  /** Unique per-order comment nonce attached to the transfer; binds the on-chain tx to
   *  this order so confirmation can't be mis-attributed (security review F1). */
  paymentNonce?: string;
}

/**
 * Minimal, mocked order model (SPEC §3.5). Deliberately adaptable: ton-pay (slice 5)
 * populates the payment fields once it inserts a real TON transfer at checkout. The
 * status timeline reads off `status` (placed → paid → delivered).
 */
export interface Order {
  id: string;
  items: OrderItem[];
  totalTon: number;
  createdAt: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  /** Set once the indexer confirms the transfer; null for a simulated/unconfirmed order. */
  txHash: string | null;
  /** Exact amount sent on-chain, in nanotons. Set by ton-pay; absent when simulated. */
  amountNano?: string;
  /** TON Connect `sendTransaction` result (BOC), pre-confirmation. Set by ton-pay. */
  boc?: string;
  /** Wallet address that paid. Set by ton-pay; absent when simulated. */
  payerAddress?: string;
  /** Per-order comment nonce attached to the transfer (binds confirmation to this order). */
  paymentNonce?: string;
}

interface OrderState {
  orders: Record<string, Order>;
  placeOrder: (
    lines: CartLine[],
    paymentMethod?: PaymentMethod,
    txHash?: string | null,
    payment?: PaymentDetails,
  ) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  /** Record an indexer-confirmed transfer: stores the tx hash and advances to 'paid'. */
  confirmPayment: (id: string, txHash: string) => void;
}

function lineToItem(line: CartLine): OrderItem {
  return {
    id: line.product.id,
    name: line.product.name,
    image: line.product.image,
    priceTon: line.product.priceTon,
    qty: line.qty,
  };
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: {},

  placeOrder: (lines, paymentMethod = 'simulated', txHash = null, payment = {}) => {
    const order: Order = {
      id: crypto.randomUUID(),
      items: lines.map(lineToItem),
      totalTon: lines.reduce((sum, line) => sum + line.product.priceTon * line.qty, 0),
      createdAt: Date.now(),
      status: 'placed',
      paymentMethod,
      txHash,
      // Spreads amountNano/boc/payerAddress when ton-pay provides them; a simulated
      // order passes none, so those keys stay absent.
      ...payment,
    };
    set((state) => ({ orders: { ...state.orders, [order.id]: order } }));
    return order;
  },

  setStatus: (id, status) =>
    set((state) => {
      const existing = state.orders[id];
      if (!existing) return state;
      return { orders: { ...state.orders, [id]: { ...existing, status } } };
    }),

  confirmPayment: (id, txHash) =>
    set((state) => {
      const existing = state.orders[id];
      if (!existing) return state;
      return { orders: { ...state.orders, [id]: { ...existing, txHash, status: 'paid' } } };
    }),
}));
