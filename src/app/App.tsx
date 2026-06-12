import { Route, Routes } from 'react-router-dom';
import { cartCount, useCartStore } from '@/entities/cart/cartStore';
import { useClosingConfirmation, useTelegram } from '@/features/telegram';
import { Catalog } from './catalog/Catalog';
import { Product } from './product/Product';
import { Cart } from './cart/Cart';
import { Status } from './status/Status';

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
      <Route path="/cart" element={<Cart />} />
      <Route path="/status/:id" element={<Status />} />
    </Routes>
  );
}
