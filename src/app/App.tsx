import { Header } from './Header';
import { Catalog } from './catalog/Catalog';

/** App shell: the brand header above the active screen (the catalog, for now). */
export function App() {
  return (
    <>
      <Header />
      <Catalog />
    </>
  );
}
