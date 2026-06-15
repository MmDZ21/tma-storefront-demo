import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { stubFetchRoutes } from '@/test/stubFetch';
import { useCartStore } from '@/entities/cart/cartStore';
import { App } from '@/app/App';

const brand = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee, delivered on-chain.',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

const products = {
  products: [
    {
      id: 'ethiopia-light',
      name: 'Ethiopia Yirgacheffe',
      description: 'Bright and floral, with notes of citrus and jasmine.',
      priceTon: 1.5,
      image: '/img/products/coffee-ethiopia-light.svg',
      category: 'Filter',
      badge: 'Best seller',
    },
  ],
};

describe('<Product />', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: {} });
    stubFetchRoutes({ 'brand.json': brand, products });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows product details for the routed id', async () => {
    renderWithProviders(<App />, { route: '/product/ethiopia-light' });

    expect(
      await screen.findByRole('heading', { name: 'Ethiopia Yirgacheffe' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Bright and floral, with notes of citrus and jasmine.'),
    ).toBeInTheDocument();
  });

  it('adds the chosen quantity to the cart', async () => {
    renderWithProviders(<App />, { route: '/product/ethiopia-light' });

    await screen.findByRole('heading', { name: 'Ethiopia Yirgacheffe' });
    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    const line = useCartStore.getState().lines['ethiopia-light'];
    expect(line?.qty).toBe(2);
  });

  it('keeps the Add-to-cart button label in sync with quantity × price (BUG 2 guard)', async () => {
    renderWithProviders(<App />, { route: '/product/ethiopia-light' });
    await screen.findByRole('heading', { name: 'Ethiopia Yirgacheffe' });

    // price 1.5 TON — the button label must always reflect the CURRENT quantity, not lag it.
    expect(screen.getByRole('button', { name: /add to cart.*1\.5 TON/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(screen.getByRole('button', { name: /add to cart.*3 TON/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(screen.getByRole('button', { name: /add to cart.*4\.5 TON/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(screen.getByRole('button', { name: /add to cart.*3 TON/i })).toBeInTheDocument();
  });
});
