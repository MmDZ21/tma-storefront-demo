import { useBrand } from '@/features/theming';

/** Sticky brand header — logo (image or emoji), shop name, and a testnet pill. */
export function Header() {
  const brand = useBrand();

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
        <span className="rounded-pill border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          TON · testnet
        </span>
      </div>
    </header>
  );
}
