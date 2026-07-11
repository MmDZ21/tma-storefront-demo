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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-14 pt-4">
        {/* Skeleton (not DEFAULT_BRAND's line) until the active skin resolves — see Header. */}
        {brandReady ? (
          <section className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <div
              className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-primary/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="inline-flex items-center rounded-pill border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                Curated for Telegram
              </span>
              <h1 className="mt-3 max-w-[18rem] font-display text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.025em] text-balance text-foreground">
                {brand.welcomeLine}
              </h1>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {state.status === 'ready' ? state.products.length : 8}
                </span>
                <span>products</span>
                <span aria-hidden="true">·</span>
                <span>{brand.currency.label} checkout</span>
              </div>
            </div>
          </section>
        ) : (
          <Skeleton className="h-7 w-3/4" />
        )}

        {state.status === 'loading' && <CatalogSkeleton />}

        {state.status === 'error' && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Couldn’t load the catalog. Please try again.
          </p>
        )}

        {state.status === 'ready' && (
          <>
            <div className="mt-5">
              <CategoryChips categories={categories} active={category} onSelect={setCategory} />
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3.5">
              {visible.map((product, i) => (
                <li key={product.id}>
                  <Link
                    to={`/product/${product.id}`}
                    className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
