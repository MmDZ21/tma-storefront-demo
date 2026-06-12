import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/features/theming';
import { stubFetchRoutes } from '@/test/stubFetch';
import { APP } from '@/config/app';
import { OutsideTelegram } from './OutsideTelegram';

const brand = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee.',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

function renderFallback() {
  return render(
    <ThemeProvider>
      <OutsideTelegram />
    </ThemeProvider>,
  );
}

describe('<OutsideTelegram />', () => {
  beforeEach(() => {
    stubFetchRoutes({ 'brand.json': brand });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('explains the app lives inside Telegram and links to the bot', async () => {
    renderFallback();
    expect(await screen.findByText(/lives inside telegram/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /open in telegram/i });
    expect(link).toHaveAttribute('href', APP.botUrl);
  });

  it('renders a QR code', () => {
    const { container } = renderFallback();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
