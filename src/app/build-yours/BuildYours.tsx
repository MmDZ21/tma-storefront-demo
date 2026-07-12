import { APP } from '@/config/app';
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from '@/shared/ui/Icons';

const previewBenefits = [
  'Your brand colors, logo, and storefront shell',
  'Up to 6 products with a focused catalog layout',
  'Live Telegram link ready to share',
  'TON testnet checkout demo',
  'One revision included in the 48-hour window',
];

export function BuildYours() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-32 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-10rem] top-24 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />

        <header className="border-b border-border/80 bg-header/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
            <a
              href="#/"
              className="font-display text-sm font-semibold tracking-[-0.02em] text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              MmD / Telegram Apps
            </a>
            <nav aria-label="Sales page navigation" className="flex items-center gap-4 text-sm">
              <a
                href="#/"
                className="hidden text-subtitle transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline"
              >
                View demo
              </a>
              <a
                href={APP.contactUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-pill bg-primary px-4 py-2 font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:translate-y-0"
              >
                Talk about yours
              </a>
            </nav>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
          <section className="grid items-center gap-12 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-pill border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-primary">
                <SparklesIcon className="h-3.5 w-3.5" />
                48-HOUR BUILD SPRINT
              </p>
              <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-balance text-foreground">
                A branded storefront your customers can open inside Telegram.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-subtitle sm:text-lg">
                A focused, paid preview for teams that need to test a catalog, cart, and TON
                checkout before committing to a full build.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-subtitle">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  Clear scope, fast handoff
                </span>
                <span>Built for Telegram Mini Apps</span>
              </div>
            </div>

            <div className="animate-rise [animation-delay:120ms]">
              <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card p-2 shadow-pop sm:p-3">
                <img
                  src="/sales/hero.gif"
                  alt="Storefront preview"
                  className="aspect-[16/10] w-full rounded-[1.2rem] object-cover object-top"
                />
                <div className="mt-2 overflow-hidden rounded-[1.2rem] border border-border bg-background sm:mt-3">
                  <video
                    aria-label="Storefront walkthrough"
                    className="aspect-video w-full"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    src="/sales/walkthrough.mp4"
                  >
                    Your browser does not support the storefront walkthrough video.
                  </video>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Coffee and sneaker storefronts are included as working examples.
              </p>
            </div>
          </section>

          <section className="mt-16 grid gap-5 lg:mt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-primary">THE ENTRY OFFER</p>
              <h2 className="mt-3 max-w-md font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-4xl">
                48-hour branded storefront preview
              </h2>
              <p className="mt-4 max-w-md leading-7 text-subtitle">
                Enough of the real customer flow to show your team, collect feedback, and decide
                with evidence.
              </p>
            </div>

            <div className="rounded-card border border-primary/35 bg-card p-6 shadow-pop sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                  <p className="text-sm font-semibold text-subtitle">Preview sprint</p>
                  <p className="mt-2 font-display text-5xl font-semibold tracking-[-0.06em] text-foreground">
                    $149
                  </p>
                </div>
                <p className="max-w-[13rem] text-right text-sm leading-6 text-subtitle">
                  50% to start · credited to the $450 five-day pilot
                </p>
              </div>

              <ul className="grid gap-3 py-6 sm:grid-cols-2" aria-label="Preview scope">
                {previewBenefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm leading-6 text-foreground">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <a
                href={APP.contactUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-control bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:translate-y-0"
              >
                Start a preview
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                Payments shown in the demo use TON testnet only.
              </p>
            </div>
          </section>

          <section className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-24">
            <div className="rounded-card border border-border bg-card p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.16em] text-primary">WHAT COMES NEXT</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.035em] text-foreground">
                If the preview fits, ship the pilot.
              </h2>
              <p className="mt-4 leading-7 text-subtitle">
                The next step is a five-business-day pilot at <strong className="text-foreground">$450</strong>:
                more products, tighter brand polish, and a customer-ready handoff plan.
              </p>
            </div>
            <div className="rounded-card border border-border bg-muted/50 p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.16em] text-primary">NO SURPRISES</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.035em] text-foreground">
                A small decision before a large one.
              </h2>
              <p className="mt-4 leading-7 text-subtitle">
                No backend or mainnet claims are hidden here: this preview is designed to prove
                the customer flow quickly.
              </p>
            </div>
          </section>

          <footer className="mt-16 flex flex-col gap-3 border-t border-border pt-6 text-xs leading-5 text-muted-foreground sm:mt-24 sm:flex-row sm:items-center sm:justify-between">
            <span>MmD / Telegram Apps</span>
            <span>Iran-based studio · direct TON/USDT settlement discussed before contract or payment</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
