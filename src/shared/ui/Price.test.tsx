import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/features/theming';
import { stubFetchRoutes } from '@/test/stubFetch';
import { Price } from './Price';

const base = {
  name: 'Shop',
  welcomeLine: 'x',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  productsFile: '/config/products.coffee.json',
};

describe('<Price />', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the TON amount and an approximate USD hint', async () => {
    stubFetchRoutes({ 'brand.json': { ...base, currency: { label: 'TON', usdRate: 5.2 } } });
    render(
      <ThemeProvider>
        <Price priceTon={2} />
      </ThemeProvider>,
    );
    expect(await screen.findByText(/\$10\.40/)).toBeInTheDocument();
    expect(screen.getByText(/2 TON/)).toBeInTheDocument();
  });

  it('omits the USD hint when no rate is configured', async () => {
    stubFetchRoutes({ 'brand.json': { ...base, currency: { label: 'TON' } } });
    render(
      <ThemeProvider>
        <Price priceTon={2} />
      </ThemeProvider>,
    );
    expect(await screen.findByText(/2 TON/)).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });
});
