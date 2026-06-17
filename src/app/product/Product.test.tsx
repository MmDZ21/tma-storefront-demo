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

  it('shows the total in the DOM tracking quantity × price; the CTA stays a static label (BUG 2)', async () => {
    renderWithProviders(<App />, { route: '/product/ethiopia-light' });
    await screen.findByRole('heading', { name: 'Ethiopia Yirgacheffe' });

    // The amount is NOT on the native/CTA button — mobile Telegram lags the MainButton's
    // setParams text, so the moving value lives in the DOM "Total" line instead.
    const cta = screen.getByRole('button', { name: 'Add to cart' });
    expect(cta).not.toHaveTextContent(/TON/);

    const total = screen.getByTestId('product-total');
    expect(total).toHaveTextContent(/1\.5 TON/); // qty 1 × 1.5
    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(total).toHaveTextContent(/3 TON/); // qty 2
    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(total).toHaveTextContent(/4\.5 TON/); // qty 3
    await userEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(total).toHaveTextContent(/3 TON/); // back to qty 2
  });
});
