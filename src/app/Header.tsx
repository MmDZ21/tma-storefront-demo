import { useBrand } from '@/features/theming';
import { cartCount, useCartStore } from '@/entities/cart/cartStore';

/** Sticky brand header — logo (image or emoji), shop name, and a cart indicator. */
export function Header() {
  const brand = useBrand();
  const count = useCartStore((state) => cartCount(state.lines));

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-header/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-control bg-primary/12">
          {brand.logoUrl ? (
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
          <p className="truncate font-display text-base font-semibold text-foreground">
            {brand.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">Telegram Mini App</p>
        </div>
        <div className="relative" aria-label={`Cart: ${count} item${count === 1 ? '' : 's'}`}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-lg" aria-hidden>
            🛍️
          </span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
