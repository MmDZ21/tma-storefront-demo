import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBrand, useBrandReady } from '@/features/theming';
import { deriveCategories } from '@/config/products';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Header } from '@/app/Header';
import { useProducts } from './useProducts';
import { CategoryChips } from './CategoryChips';
import { ProductCard } from './ProductCard';

const ALL = 'All';

/** Catalog screen — category chips + a product grid, with skeletons on load. */
export function Catalog() {
  const brand = useBrand();
  const brandReady = useBrandReady();
  // Defer until the brand resolves so we fetch the active skin's products once.
  const state = useProducts(brandReady ? brand.productsFile : null);
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => (state.status === 'ready' ? [ALL, ...deriveCategories(state.products)] : [ALL]),
    [state],
  );

  const visible = useMemo(() => {
    if (state.status !== 'ready') return [];
    return category === ALL
      ? state.products
      : state.products.filter((product) => product.category === category);
  }, [state, category]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-12 pt-5">
        <h1 className="font-display text-xl font-semibold text-balance text-foreground">
          {brand.welcomeLine}
        </h1>

        {state.status === 'loading' && <CatalogSkeleton />}

        {state.status === 'error' && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Couldn’t load the catalog. Please try again.
          </p>
        )}

        {state.status === 'ready' && (
          <>
            <div className="mt-4">
              <CategoryChips categories={categories} active={category} onSelect={setCategory} />
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {visible.map((product, i) => (
                <li key={product.id}>
                  <Link
                    to={`/product/${product.id}`}
                    className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <ProductCard
                      product={product}
                      style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-pill" />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-card border border-border bg-card">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
