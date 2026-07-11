import { Link } from 'react-router-dom';
import { useBrand, useBrandReady } from '@/features/theming';
import { cartCount, useCartStore } from '@/entities/cart/cartStore';
import { Skeleton } from '@/shared/ui/Skeleton';
import { CartIcon } from '@/shared/ui/Icons';

/** Sticky brand header — logo (image or emoji), shop name, and a cart indicator. */
export function Header() {
  const brand = useBrand();
  // Until brand.json resolves, show neutral skeletons instead of the DEFAULT_BRAND
  // fallback — a re-skinned deploy must never flash "TON Storefront" on first paint.
  const ready = useBrandReady();
  const count = useCartStore((state) => cartCount(state.lines));

  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-header/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] border border-border bg-card shadow-card">
          {!ready ? (
            <Skeleton className="h-full w-full rounded-none" />
          ) : brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={`${brand.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl" aria-hidden>
              {brand.logoEmoji ?? '🛍️'}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          {ready ? (
            <p className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {brand.name}
            </p>
          ) : (
            <Skeleton className="h-5 w-28" />
          )}
          <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Telegram storefront
          </p>
        </div>
        <Link
          to="/cart"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition-transform duration-150 ease-spring active:scale-95"
          aria-label={`Cart: ${count} item${count === 1 ? '' : 's'}`}
        >
          <CartIcon />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
