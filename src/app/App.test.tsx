import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/features/theming';
import { App } from './App';

const brandJson = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee, delivered on-chain.',
  logo: { emoji: '☕' },
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

describe('<App />', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify(brandJson), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mounts inside the ThemeProvider and renders the storefront shell', async () => {
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
  });

  it('applies the brand accent variable to the document root', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    await screen.findByText('Roast & Ritual');
    expect(document.documentElement.style.getPropertyValue('--brand-accent')).toBe('#9a5b34');
  });
});
