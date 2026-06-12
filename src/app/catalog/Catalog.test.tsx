import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/features/theming';
import { stubFetchRoutes } from '@/test/stubFetch';
import { Catalog } from './Catalog';

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
      id: 'ethiopia',
      name: 'Ethiopia Yirgacheffe',
      description: 'Bright and floral.',
      priceTon: 1.5,
      image: '/img/products/coffee-ethiopia.svg',
      category: 'Filter',
      badge: 'Best seller',
    },
    {
      id: 'espresso-forte',
      name: 'Espresso Forte',
      description: 'Dark chocolate and hazelnut.',
      priceTon: 1.4,
      image: '/img/products/coffee-espresso-forte.svg',
      category: 'Espresso',
    },
  ],
};

function renderCatalog() {
  return render(
    <ThemeProvider>
      <Catalog />
    </ThemeProvider>,
  );
}

describe('<Catalog />', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows skeleton loaders first, then the products', async () => {
    stubFetchRoutes({ 'brand.json': brand, products });
    const { container } = renderCatalog();

    // Skeletons on first paint (SPEC §3.1 / §7).
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);

    expect(await screen.findByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton')).toHaveLength(0);
  });

  it('filters the grid by category', async () => {
    stubFetchRoutes({ 'brand.json': brand, products });
    renderCatalog();

    await screen.findByText('Ethiopia Yirgacheffe');
    expect(screen.getByText('Espresso Forte')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Filter' }));

    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(screen.queryByText('Espresso Forte')).not.toBeInTheDocument();
  });
});
