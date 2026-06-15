import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { stubFetchRoutes } from '@/test/stubFetch';
import type { Product } from '@/config/products';
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

function line(id: string, name: string, priceTon: number, qty: number) {
  const product: Product = {
    id,
    name,
    description: 'd',
    priceTon,
    image: `/img/${id}.svg`,
    category: 'C',
  };
  return { product, qty };
}

describe('<Status />', () => {
  beforeEach(() => {
    useOrderStore.setState({ orders: {} });
    stubFetchRoutes({ 'brand.json': brand });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders the placed → paid → delivered timeline', async () => {
    const order = useOrderStore.getState().placeOrder([line('a', 'Kenya AA', 1.6, 1)]);
    renderWithProviders(<App />, { route: `/status/${order.id}` });

    expect(await screen.findByText('Placed')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('auto-advances the order status over time', async () => {
    vi.useFakeTimers();
    const order = useOrderStore.getState().placeOrder([line('a', 'Kenya AA', 1.6, 1)]);
    renderWithProviders(<App />, { route: `/status/${order.id}` });

    expect(useOrderStore.getState().orders[order.id]?.status).toBe('placed');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800);
    });
    expect(useOrderStore.getState().orders[order.id]?.status).toBe('paid');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800);
    });
    expect(useOrderStore.getState().orders[order.id]?.status).toBe('delivered');
  });
});
