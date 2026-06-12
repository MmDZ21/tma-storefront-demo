import { useBrand } from '@/features/theming';

const FEATURES = [
  {
    icon: '🛍️',
    title: 'Native catalog',
    desc: 'Eight products, category chips, and skeleton loaders on first paint.',
  },
  {
    icon: '💎',
    title: 'TON checkout',
    desc: 'Connect a wallet and pay on testnet — or simulate it, never a dead end.',
  },
  {
    icon: '🎨',
    title: 'Re-skin in 20 min',
    desc: 'Swap one brand.json: logo, accent color, and product list.',
  },
] as const;

/**
 * Slice 1 home — a branded landing that proves the theming system end to end:
 * surfaces, text, borders, and the brand accent all flow from Telegram's
 * themeParams + brand.json, with zero hardcoded color. The catalog replaces
 * this in slice 2.
 */
export function App() {
  const brand = useBrand();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-header/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary/12">
            {brand.logo.emoji ? (
              <span className="text-xl" aria-hidden>
                {brand.logo.emoji}
              </span>
            ) : brand.logo.url ? (
              <img src={brand.logo.url} alt="" className="h-6 w-6 object-contain" />
            ) : (
              <span className="text-xl" aria-hidden>
                🛍️
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

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-8">
        <h1
          className="animate-rise font-display text-[1.7rem] font-semibold leading-tight text-balance text-foreground"
          style={{ animationDelay: '40ms' }}
        >
          {brand.welcomeLine}
        </h1>
        <p
          className="animate-rise mt-2 text-[15px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: '100ms' }}
        >
          Browse, add to cart, and pay in TON — all without leaving Telegram.
        </p>

        <button
          type="button"
          className="animate-rise mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-5 font-medium text-primary-foreground shadow-card transition-transform duration-150 ease-spring active:scale-[0.98]"
          style={{ animationDelay: '160ms' }}
        >
          Browse the catalog
          <span aria-hidden>→</span>
        </button>

        <ul className="mt-8 grid gap-3">
          {FEATURES.map((feature, i) => (
            <li
              key={feature.title}
              className="animate-rise flex items-start gap-3 rounded-card border border-border bg-card p-4 shadow-card"
              style={{ animationDelay: `${220 + i * 70}ms` }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-muted text-lg"
                aria-hidden
              >
                {feature.icon}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-card-foreground">{feature.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <footer className="mt-auto pt-8 text-center text-[11px] text-muted-foreground">
          {brand.name} · TON testnet demo
        </footer>
      </main>
    </>
  );
}
