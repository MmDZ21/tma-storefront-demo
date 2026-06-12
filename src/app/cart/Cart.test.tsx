import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { stubFetchRoutes } from '@/test/stubFetch';
import type { Product } from '@/config/products';
import { useCartStore } from '@/entities/cart/cartStore';
import { useOrderStore } from '@/entities/order/orderStore';
import { App } from '@/app/App';

const brand = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee.',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

function product(id: string, name: string, priceTon: number): Product {
  return { id, name, description: 'd', priceTon, image: `/img/${id}.svg`, category: 'C' };
}

describe('<Cart />', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: {} });
    useOrderStore.setState({ orders: {} });
    useCartStore.getState().add(product('a', 'Ethiopia', 1.5), 2);
    useCartStore.getState().add(product('b', 'Brazil', 1.3), 1);
    stubFetchRoutes({ 'brand.json': brand });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists cart items with a subtotal', async () => {
    renderWithProviders(<App />, { route: '/cart' });
    expect(await screen.findByText('Ethiopia')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    // 1.5*2 + 1.3 = 4.3 — the checkout button carries the running total (SPEC §5).
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /checkout.*4\.3 TON/i })).toBeInTheDocument();
  });

  it('removes a line item', async () => {
    renderWithProviders(<App />, { route: '/cart' });
    await screen.findByText('Ethiopia');
    await userEvent.click(screen.getByRole('button', { name: /remove brazil/i }));
    expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
  });

  it('checks out into a placed order and clears the cart', async () => {
    renderWithProviders(<App />, { route: '/cart' });
    await screen.findByText('Ethiopia');

    await userEvent.click(screen.getByRole('button', { name: /checkout/i }));

    const orders = Object.values(useOrderStore.getState().orders);
    expect(orders).toHaveLength(1);
    expect(orders[0]?.status).toBe('placed');
    expect(Object.keys(useCartStore.getState().lines)).toHaveLength(0);
    expect(await screen.findByText(/order placed/i)).toBeInTheDocument();
  });

  it('shows an empty state when there are no items', async () => {
    useCartStore.setState({ lines: {} });
    renderWithProviders(<App />, { route: '/cart' });
    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });
});
