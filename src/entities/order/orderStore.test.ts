import { describe, it, expect, beforeEach } from 'vitest';
import type { Product } from '@/config/products';
import type { CartLine } from '@/entities/cart/cartStore';
import { useOrderStore } from './orderStore';

function line(id: string, priceTon: number, qty: number): CartLine {
  const product: Product = {
    id,
    name: id.toUpperCase(),
    description: 'desc',
    priceTon,
    image: `/img/products/${id}.svg`,
    category: 'Test',
  };
  return { product, qty };
}

describe('orderStore', () => {
  beforeEach(() => {
    useOrderStore.setState({ orders: {} });
  });

  it('places an order from cart lines', () => {
    const order = useOrderStore.getState().placeOrder([line('a', 1.5, 2), line('b', 1.3, 1)]);
    expect(order.status).toBe('placed');
    expect(order.items).toHaveLength(2);
    expect(order.totalTon).toBeCloseTo(4.3, 5);
    expect(order.paymentMethod).toBe('simulated');
    expect(order.txHash).toBeNull();
    expect(order.id).toBeTruthy();
    expect(useOrderStore.getState().orders[order.id]).toEqual(order);
  });

  it('captures each item with its product details', () => {
    const order = useOrderStore.getState().placeOrder([line('a', 1.5, 2)]);
    expect(order.items[0]).toMatchObject({ id: 'a', priceTon: 1.5, qty: 2 });
  });

  it('advances order status', () => {
    const order = useOrderStore.getState().placeOrder([line('a', 1.5, 1)]);
    useOrderStore.getState().setStatus(order.id, 'delivered');
    expect(useOrderStore.getState().orders[order.id]?.status).toBe('delivered');
  });

  it('records a TON payment with a tx hash (ton-pay slots in here later)', () => {
    const order = useOrderStore.getState().placeOrder([line('a', 1.5, 1)], 'ton', '0xabc');
    expect(order.paymentMethod).toBe('ton');
    expect(order.txHash).toBe('0xabc');
  });
});
