import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBrand, useBrandReady } from '@/features/theming';
import { haptics, useBackButton, useTelegram } from '@/features/telegram';
import { useProducts } from '@/app/catalog/useProducts';
import { useGoBack } from '@/app/useGoBack';
import { useCartStore } from '@/entities/cart/cartStore';
import { Price } from '@/shared/ui/Price';
import { Stepper } from '@/shared/ui/Stepper';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ArrowLeftIcon } from '@/shared/ui/Icons';

function BackChevron({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-background/75 text-foreground shadow-card backdrop-blur-xl transition-transform active:scale-95"
    >
      <ArrowLeftIcon />
    </button>
  );
}

/** Product detail page (SPEC §3.2): image, description, stepper, MainButton. */
export function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const brand = useBrand();
  const brandReady = useBrandReady();
  const { nativeControls } = useTelegram();
  // Defer until the brand resolves so we fetch the active skin's products once.
  const state = useProducts(brandReady ? brand.productsFile : null);
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);

  // Falls back to the catalog when deep-linked straight here (no history to pop).
  const goBack = useGoBack();
  useBackButton(goBack, nativeControls);

  if (state.status === 'loading') {
    return (
      <main className="mx-auto w-full max-w-md">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </main>
    );
  }

  const product =
    state.status === 'ready' ? state.products.find((item) => item.id === id) : undefined;

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">This product isn’t available.</p>
        <button
          type="button"
          onClick={goBack}
          className="rounded-control bg-primary px-5 py-2.5 font-medium text-primary-foreground"
        >
          Back to catalog
        </button>
      </main>
    );
  }

  const total = product.priceTon * qty;
  const handleAdd = () => {
    add(product, qty);
    haptics.notification('success');
    navigate('/cart');
  };

  return (
    <main className="mx-auto w-full max-w-md overflow-hidden pb-28">
      <div className="relative bg-muted">
        {!nativeControls && <BackChevron onClick={goBack} />}
        <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/55 to-transparent"
          aria-hidden="true"
        />
      </div>

      <section className="relative -mt-6 rounded-t-[1.75rem] border-t border-border bg-background px-5 pb-5 pt-6 shadow-pop">
        {product.badge && (
          <span className="inline-block rounded-pill bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
        <h1 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight tracking-[-0.025em] text-balance text-foreground">
          {product.name}
        </h1>
        <Price priceTon={product.priceTon} className="mt-2 block text-lg" />
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-6 flex items-center justify-between rounded-card border border-border bg-card p-3.5 shadow-card">
          <div>
            <span className="block text-sm font-semibold text-foreground">Quantity</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">Choose your amount</span>
          </div>
          <Stepper value={qty} onChange={setQty} />
        </div>

        {/* The line total lives here in the DOM, not on the native MainButton: mobile
            Telegram lags/coalesces the MainButton's setParams text, so a value that changes
            on every +/- can't ride it (BUG 2). A plain React element updates instantly on
            all platforms. The button stays a static "Add to cart". */}
        <div
          data-testid="product-total"
          className="mt-4 flex items-center justify-between px-1 pt-1"
        >
          <span className="text-sm font-medium text-foreground">Total</span>
          <Price priceTon={total} className="text-base font-semibold" />
        </div>
      </section>

      <PrimaryButton text="Add to cart" onClick={handleAdd} />
    </main>
  );
}
