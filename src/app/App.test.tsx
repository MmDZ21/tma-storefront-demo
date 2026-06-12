import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/features/theming';
import { stubFetchRoutes } from '@/test/stubFetch';
import { App } from './App';

const brand = {
  name: 'SOLE',
  welcomeLine: 'Fresh drops. Flex in TON.',
  logoUrl: '/brand/sole.svg',
  logoEmoji: '👟',
  accentColor: '#ff4d2e',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.sneakers.json',
};

const products = {
  products: [
    {
      id: 'velocity-runner',
      name: 'Velocity Runner',
      description: 'A featherweight daily trainer.',
      priceTon: 3.2,
      image: '/img/products/sneaker-velocity-runner.svg',
      category: 'Runners',
      badge: 'Best seller',
    },
    {
      id: 'court-classic',
      name: 'Court Classic',
      description: 'Timeless court lines.',
      priceTon: 2.5,
      image: '/img/products/sneaker-court-classic.svg',
      category: 'Lifestyle',
    },
  ],
};

describe('<App />', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the brand header and the catalog for the active brand', async () => {
    stubFetchRoutes({ 'brand.json': brand, products });
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    // Header
    expect(await screen.findByText('SOLE')).toBeInTheDocument();
    expect(screen.getByText('Telegram Mini App')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /sole logo/i })).toHaveAttribute(
      'src',
      '/brand/sole.svg',
    );

    // Catalog
    expect(await screen.findByText('Velocity Runner')).toBeInTheDocument();
    expect(screen.getByText('Court Classic')).toBeInTheDocument();
  });

  it('applies the brand accent variable to the document root', async () => {
    stubFetchRoutes({ 'brand.json': brand, products });
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    await screen.findByText('SOLE');
    expect(document.documentElement.style.getPropertyValue('--brand-accent')).toBe('#ff4d2e');
  });
});
