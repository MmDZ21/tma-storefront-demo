import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { BuildYours } from './BuildYours';

describe('<BuildYours />', () => {
  it('explains the paid 48-hour preview offer and its scope', () => {
    renderWithProviders(<BuildYours />);

    expect(
      screen.getByRole('heading', { name: /48-hour branded storefront preview/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('$149')).toBeInTheDocument();
    expect(screen.getByText(/up to 6 products/i)).toBeInTheDocument();
    expect(screen.getByText(/one revision/i)).toBeInTheDocument();
  });

  it('routes the primary CTA to the inbound Telegram contact and shows proof', () => {
    renderWithProviders(<BuildYours />);

    expect(screen.getByRole('link', { name: /start a preview/i })).toHaveAttribute(
      'href',
      'https://t.me/MmDTelegramApps',
    );
    expect(screen.getByRole('img', { name: /storefront preview/i })).toHaveAttribute(
      'src',
      '/sales/hero.gif',
    );
    expect(screen.getByLabelText(/storefront walkthrough/i)).toHaveAttribute(
      'src',
      '/sales/walkthrough.mp4',
    );
    expect(screen.getByText(/payments shown.*ton testnet/i)).toBeInTheDocument();
  });
});
