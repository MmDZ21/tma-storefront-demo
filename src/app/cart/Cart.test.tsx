import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { stubFetchRoutes } from '@/test/stubFetch';
import { STUB_ADDRESS, STUB_BOC } from '@/test/tonconnect-stub';
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

  it('shows the order total in the DOM with a static pay CTA (amount off the native button)', async () => {
    renderWithProviders(<App />, { route: '/cart' });
    expect(await screen.findByText('Ethiopia')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    // 1.5*2 + 1.3 = 4.3 — the amount lives in the DOM order-total card, NOT on the native
    // MainButton (mobile Telegram lags its setParams text; BUG 2).
    expect(screen.getByText('Order total')).toBeInTheDocument();
    expect(screen.getByText(/4\.3 TON/)).toBeInTheDocument();
    const cta = screen.getByRole('button', { name: 'Pay with TON' });
    expect(cta).not.toHaveTextContent(/4\.3/);
  });

  it('removes a line item', async () => {
    renderWithProviders(<App />, { route: '/cart' });
    await screen.findByText('Ethiopia');
    await userEvent.click(screen.getByRole('button', { name: /remove brazil/i }));
    expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
  });

  it('simulates payment into a placed order with no on-chain fields (no-wallet path)', async () => {
    renderWithProviders(<App />, { route: '/cart' });
    await screen.findByText('Ethiopia');

    await userEvent.click(screen.getByRole('button', { name: /simulate/i }));

    await waitFor(() => expect(Object.keys(useCartStore.getState().lines)).toHaveLength(0));
    const orders = Object.values(useOrderStore.getState().orders);
    expect(orders).toHaveLength(1);
    expect(orders[0]?.paymentMethod).toBe('simulated');
    expect(orders[0]?.status).toBe('placed');
    expect(orders[0]?.amountNano).toBeUndefined();
    expect(orders[0]?.boc).toBeUndefined();
  });

  it('pays with TON into a placed order carrying the on-chain fields', async () => {
    renderWithProviders(<App />, { route: '/cart' });
    await screen.findByText('Ethiopia');

    await userEvent.click(screen.getByRole('button', { name: /pay with TON/i }));

    // Navigated to the status screen for a TON order awaiting confirmation.
    expect(await screen.findByText(/confirming payment on TON testnet/i)).toBeInTheDocument();

    const order = Object.values(useOrderStore.getState().orders)[0];
    expect(order?.paymentMethod).toBe('ton');
    expect(order?.status).toBe('placed'); // stays placed until the indexer confirms
    expect(order?.txHash).toBeNull();
    expect(order?.amountNano).toBe('4300000000'); // exact nanotons, no float
    expect(order?.boc).toBe(STUB_BOC);
    expect(order?.payerAddress).toBe(STUB_ADDRESS);
    expect(order?.paymentNonce).toBeTruthy(); // unique per-order nonce binds confirmation (F1)
    expect(Object.keys(useCartStore.getState().lines)).toHaveLength(0);
  });

  it('shows an empty state when there are no items', async () => {
    useCartStore.setState({ lines: {} });
    renderWithProviders(<App />, { route: '/cart' });
    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });
});
