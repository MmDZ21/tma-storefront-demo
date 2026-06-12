import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/features/theming';
import { App } from './App';

const coffeeBrand = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee, delivered on-chain.',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

const soleBrand = {
  name: 'SOLE',
  welcomeLine: 'Fresh drops. Flex in TON.',
  logoUrl: '/brand/sole.svg',
  logoEmoji: '👟',
  accentColor: '#ff4d2e',
  currency: { label: 'TON' },
  productsFile: '/config/products.sneakers.json',
};

function stubBrandFetch(brand: object): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(brand), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    ),
  );
}

describe('<App />', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mounts inside the ThemeProvider and renders the storefront shell', async () => {
    stubBrandFetch(coffeeBrand);
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    // Static chrome renders immediately (proves mount + context wiring).
    expect(screen.getByRole('button', { name: /browse the catalog/i })).toBeInTheDocument();
    expect(screen.getByText('Telegram Mini App')).toBeInTheDocument();

    // The fetched brand flows through context into the header.
    expect(await screen.findByText('Roast & Ritual')).toBeInTheDocument();
    // Emoji logo path: no <img> is rendered.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies the brand accent variable to the document root', async () => {
    stubBrandFetch(coffeeBrand);
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    await screen.findByText('Roast & Ritual');
    expect(document.documentElement.style.getPropertyValue('--brand-accent')).toBe('#9a5b34');
  });

  it('renders an image logo when the brand sets logoUrl', async () => {
    stubBrandFetch(soleBrand);
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    const logo = await screen.findByRole('img', { name: /sole logo/i });
    expect(logo).toHaveAttribute('src', '/brand/sole.svg');
  });
});
