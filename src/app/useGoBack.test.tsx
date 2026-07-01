import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useGoBack } from './useGoBack';

function BackProbe() {
  const goBack = useGoBack();
  return (
    <button type="button" onClick={goBack}>
      back
    </button>
  );
}

function Pathname() {
  return <p data-testid="pathname">{useLocation().pathname}</p>;
}

function renderAt(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Pathname />
      <Routes>
        <Route path="/" element={null} />
        <Route path="/cart" element={<BackProbe />} />
        <Route path="/product/:id" element={<BackProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('useGoBack', () => {
  it('falls back to the catalog when the subpage is the first history entry (deep link)', async () => {
    renderAt(['/product/espresso-forte']);
    await userEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(screen.getByTestId('pathname')).toHaveTextContent('/');
  });

  it('goes back one entry on a normal in-app navigation stack', async () => {
    // catalog → cart → product; back from the product must return to the CART,
    // not the catalog — proving it uses history, not the home fallback.
    renderAt(['/', '/cart', '/product/espresso-forte']);
    await userEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(screen.getByTestId('pathname')).toHaveTextContent('/cart');
  });
});
