import { Route, Routes } from 'react-router-dom';
import { Catalog } from './catalog/Catalog';
import { Product } from './product/Product';

/** Route table. The Router itself is provided by main.tsx (HashRouter) / tests. */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/product/:id" element={<Product />} />
    </Routes>
  );
}
