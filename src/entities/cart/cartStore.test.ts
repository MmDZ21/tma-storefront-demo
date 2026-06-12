import { describe, it, expect, beforeEach } from 'vitest';
import type { Product } from '@/config/products';
import { useCartStore, cartCount, cartTotalTon } from './cartStore';

function product(id: string, priceTon: number): Product {
  return {
    id,
    name: id,
    description: 'desc',
    priceTon,
    image: `/img/products/${id}.svg`,
    category: 'Test',
  };
}

const a = product('a', 1.5);
const b = product('b', 1.3);

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: {} });
  });

  it('adds an item with a default quantity of 1', () => {
    useCartStore.getState().add(a);
    expect(useCartStore.getState().lines['a']?.qty).toBe(1);
  });

  it('merges quantity when the same product is added again', () => {
    useCartStore.getState().add(a, 2);
    useCartStore.getState().add(a, 3);
    expect(useCartStore.getState().lines['a']?.qty).toBe(5);
  });

  it('sets an explicit quantity', () => {
    useCartStore.getState().add(a);
    useCartStore.getState().setQty('a', 4);
    expect(useCartStore.getState().lines['a']?.qty).toBe(4);
  });

  it('removes a line when its quantity is set to zero', () => {
    useCartStore.getState().add(a);
    useCartStore.getState().setQty('a', 0);
    expect(useCartStore.getState().lines['a']).toBeUndefined();
  });

  it('removes an item', () => {
    useCartStore.getState().add(a);
    useCartStore.getState().remove('a');
    expect(useCartStore.getState().lines['a']).toBeUndefined();
  });

  it('clears the cart', () => {
    useCartStore.getState().add(a);
    useCartStore.getState().add(b);
    useCartStore.getState().clear();
    expect(Object.keys(useCartStore.getState().lines)).toHaveLength(0);
  });
});

describe('cart selectors', () => {
  it('counts total quantity across lines', () => {
    useCartStore.setState({ lines: {} });
    useCartStore.getState().add(a, 2);
    useCartStore.getState().add(b, 1);
    expect(cartCount(useCartStore.getState().lines)).toBe(3);
  });

  it('sums the TON total across lines', () => {
    useCartStore.setState({ lines: {} });
    useCartStore.getState().add(a, 2); // 3.0
    useCartStore.getState().add(b, 1); // 1.3
    expect(cartTotalTon(useCartStore.getState().lines)).toBeCloseTo(4.3, 5);
  });
});
