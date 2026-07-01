import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { cartCount, useCartStore } from '@/entities/cart/cartStore';
import { useClosingConfirmation, useTelegram } from '@/features/telegram';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Catalog } from './catalog/Catalog';
import { Product } from './product/Product';
import { Status } from './status/Status';

// The cart route carries the TON Connect SDK; lazy-load it so `@tonconnect/ui-react`
// is code-split out of the catalog/product first paint (SPEC §7 budget).
const importCartRoute = () => import('./cart/CartRoute');
const CartRoute = lazy(importCartRoute);

/** Idle delay before warming the cart chunk, clear of the brand/products fetches (ms). */
const CART_PREFETCH_DELAY_MS = 1500;

/** Route table. The Router itself is provided by main.tsx (HashRouter) / tests. */
export function App() {
  const { inTelegram } = useTelegram();
  const cartNotEmpty = useCartStore((s) => cartCount(s.lines) > 0);

  // Confirm before closing while an order is in progress (SPEC §3.6).
  useClosingConfirmation(cartNotEmpty, inTelegram);

  // Warm the lazy cart chunk (the TON Connect SDK, ~215 KB gzip) shortly after first
  // paint, so the first tap on the cart doesn't stall on a network fetch mid-funnel.
  // A failed prefetch must stay silent (it would otherwise be an unhandled rejection);
  // the tap-time React.lazy import keeps its own failure behavior.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      importCartRoute().catch(() => {});
    }, CART_PREFETCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/product/:id" element={<Product />} />
      <Route
        path="/cart"
        element={
          <Suspense fallback={<CartFallback />}>
            <CartRoute />
          </Suspense>
        }
      />
      <Route path="/status/:id" element={<Status />} />
    </Routes>
  );
}

/** Cart-shaped skeleton shown while the lazy cart chunk loads — never a blank screen. */
function CartFallback() {
  return (
    <div aria-busy="true">
      <div className="sticky top-0 z-10 border-b border-border bg-header/80 px-4 py-3 backdrop-blur-md">
        <Skeleton className="h-7 w-20" />
      </div>
      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}
