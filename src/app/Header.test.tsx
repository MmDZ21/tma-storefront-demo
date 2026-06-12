import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { stubFetchRoutes } from '@/test/stubFetch';
import type { Product } from '@/config/products';
import { useCartStore } from '@/entities/cart/cartStore';
import { Header } from './Header';

const brand = {
  name: 'Roast & Ritual',
  welcomeLine: 'x',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

function product(id: string, priceTon: number): Product {
  return { id, name: id, description: 'd', priceTon, image: `/img/${id}.svg`, category: 'C' };
}

describe('<Header />', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: {} });
    stubFetchRoutes({ 'brand.json': brand });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the shop name and links to the cart', async () => {
    renderWithProviders(<Header />);
    expect(await screen.findByText('Roast & Ritual')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart');
  });

  it('shows the cart item count badge', () => {
    useCartStore.getState().add(product('a', 1.5), 3);
    renderWithProviders(<Header />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
