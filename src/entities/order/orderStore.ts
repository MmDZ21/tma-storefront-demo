import { create } from 'zustand';
import type { CartLine } from '@/entities/cart/cartStore';

export type OrderStatus = 'placed' | 'paid' | 'delivered';
export type PaymentMethod = 'ton' | 'simulated';

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  priceTon: number;
  qty: number;
}

/**
 * Minimal, mocked order model (SPEC §3.5). Deliberately adaptable: `paymentMethod`
 * and `txHash` are placeholders the ton-pay slice will populate once it inserts a
 * real TON transfer between checkout and "placed". The status timeline reads off
 * `status` (placed → paid → delivered).
 */
export interface Order {
  id: string;
  items: OrderItem[];
  totalTon: number;
  createdAt: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  /** Set by ton-pay (testnet tx hash); null for a simulated order. */
  txHash: string | null;
}

interface OrderState {
  orders: Record<string, Order>;
  placeOrder: (lines: CartLine[], paymentMethod?: PaymentMethod, txHash?: string | null) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
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

  placeOrder: (lines, paymentMethod = 'simulated', txHash = null) => {
    const order: Order = {
      id: crypto.randomUUID(),
      items: lines.map(lineToItem),
      totalTon: lines.reduce((sum, line) => sum + line.product.priceTon * line.qty, 0),
      createdAt: Date.now(),
      status: 'placed',
      paymentMethod,
      txHash,
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
}));
