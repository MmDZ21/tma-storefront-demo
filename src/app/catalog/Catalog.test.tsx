import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
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

describe('<Catalog />', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows skeleton loaders first, then the products', async () => {
    stubFetchRoutes({ 'brand.json': brand, products });
    const { container } = renderWithProviders(<Catalog />);

    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);

    expect(await screen.findByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton')).toHaveLength(0);
  });

  it('links each product to its detail page', async () => {
    stubFetchRoutes({ 'brand.json': brand, products });
    renderWithProviders(<Catalog />);

    const link = await screen.findByRole('link', { name: /ethiopia yirgacheffe/i });
    expect(link).toHaveAttribute('href', '/product/ethiopia');
  });

  it('filters the grid by category', async () => {
    stubFetchRoutes({ 'brand.json': brand, products });
    renderWithProviders(<Catalog />);

    await screen.findByText('Ethiopia Yirgacheffe');
    expect(screen.getByText('Espresso Forte')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Filter' }));

    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(screen.queryByText('Espresso Forte')).not.toBeInTheDocument();
  });

  it('fetches the active skin’s products exactly once (no default-skin pre-fetch)', async () => {
    // A skin whose products file differs from DEFAULT_BRAND.productsFile
    // (/config/products.coffee.json) — the case that used to double-fetch.
    const sneakerBrand = { ...brand, productsFile: '/config/products.sneakers.json' };
    const sneakerProducts = {
      products: [
        {
          id: 'cloud-runner',
          name: 'Cloud Runner',
          description: 'Featherweight daily trainer.',
          priceTon: 2.2,
          image: '/img/products/sneaker-cloud-runner.svg',
          category: 'Road',
        },
      ],
    };
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input); // loaders always pass string paths in this test
      if (url.includes('brand.json')) {
        return new Response(JSON.stringify(sneakerBrand), { status: 200 });
      }
      if (url.includes('products.sneakers.json')) {
        return new Response(JSON.stringify(sneakerProducts), { status: 200 });
      }
      return new Response('not found', { status: 404 });
    });
    vi.stubGlobal('fetch', fetchSpy);

    renderWithProviders(<Catalog />);
    await screen.findByText('Cloud Runner');

    const productFetches = fetchSpy.mock.calls.filter(([input]) =>
      String(input).includes('/config/products.'),
    );
    expect(productFetches).toHaveLength(1);
    expect(String(productFetches[0]?.[0])).toContain('products.sneakers.json');
  });
});
