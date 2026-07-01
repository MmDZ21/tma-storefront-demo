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

function BackChevron({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-background/70 text-xl text-foreground backdrop-blur-md"
    >
      ←
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
    <main className="mx-auto w-full max-w-md pb-28">
      <div className="relative">
        {!nativeControls && <BackChevron onClick={goBack} />}
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full bg-muted object-cover"
        />
      </div>

      <div className="p-4">
        {product.badge && (
          <span className="inline-block rounded-pill bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
        <h1 className="mt-2 font-display text-2xl font-semibold text-balance text-foreground">
          {product.name}
        </h1>
        <Price priceTon={product.priceTon} className="mt-2 block text-lg" />
        <p className="mt-3 leading-relaxed text-muted-foreground">{product.description}</p>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Quantity</span>
          <Stepper value={qty} onChange={setQty} />
        </div>

        {/* The line total lives here in the DOM, not on the native MainButton: mobile
            Telegram lags/coalesces the MainButton's setParams text, so a value that changes
            on every +/- can't ride it (BUG 2). A plain React element updates instantly on
            all platforms. The button stays a static "Add to cart". */}
        <div
          data-testid="product-total"
          className="mt-4 flex items-center justify-between border-t border-border pt-4"
        >
          <span className="text-sm font-medium text-foreground">Total</span>
          <Price priceTon={total} className="text-base font-semibold" />
        </div>
      </div>

      <PrimaryButton text="Add to cart" onClick={handleAdd} />
    </main>
  );
}
