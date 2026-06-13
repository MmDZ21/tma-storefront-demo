import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { cartCount, useCartStore } from '@/entities/cart/cartStore';
import { useClosingConfirmation, useTelegram } from '@/features/telegram';
import { Catalog } from './catalog/Catalog';
import { Product } from './product/Product';
import { Status } from './status/Status';

// The cart route carries the TON Connect SDK; lazy-load it so `@tonconnect/ui-react`
// is code-split out of the catalog/product first paint (SPEC §7 budget).
const CartRoute = lazy(() => import('./cart/CartRoute'));

/** Route table. The Router itself is provided by main.tsx (HashRouter) / tests. */
export function App() {
  const { inTelegram } = useTelegram();
  const cartNotEmpty = useCartStore((s) => cartCount(s.lines) > 0);

  // Confirm before closing while an order is in progress (SPEC §3.6).
  useClosingConfirmation(cartNotEmpty, inTelegram);

  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/product/:id" element={<Product />} />
      <Route
        path="/cart"
        element={
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <CartRoute />
          </Suspense>
        }
      />
      <Route path="/status/:id" element={<Status />} />
    </Routes>
  );
}
