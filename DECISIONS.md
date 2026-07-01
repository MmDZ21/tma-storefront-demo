# Decisions & Assumptions

A running log of every non-obvious choice made while building this project (per
CLAUDE.md). SPEC §2 decisions are fixed and not relitigated here; this records
the judgment calls the spec left open.

---

## Slice 1 — Scaffold + Theming (2026-06-12)

### Toolchain

- **Tailwind CSS v4** (not v3). SPEC §2 fixes "Tailwind CSS" but not a version.
  v4's CSS-first `@theme` + native CSS-variable model pairs directly with
  Telegram's runtime `--tg-theme-*` variables, so the whole theming layer is
  plain CSS with no JS color plumbing. Uses `@tailwindcss/vite` (no PostCSS).
- **Test stack: Vitest + Testing Library + jsdom.** The SPEC doesn't mandate
  tests, but the pure logic (color math, config validation) is TDD'd because the
  repo is itself a portfolio artifact. Vitest was upgraded **2 → 3** so it
  depends on Vite 6 like the app; v2 bundled Vite 5, causing a config type clash.
- **ESLint 9 flat config** + `typescript-eslint` (non-type-checked) with
  `@typescript-eslint/no-explicit-any: error` to enforce SPEC §7 "zero `any`".
  Type-checked linting was skipped to keep the config robust; `tsc --strict`
  already provides deep type safety.
- **TypeScript:** strict + `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`,
  `noImplicitOverride`. Path alias `@/* → src/*`. React pinned to **18.3.1**
  (SPEC §2 says React 18 — deliberately not 19).

### Theming architecture

- **Use the SDK's native `bindCssVars()`** (`themeParams`, `viewport`) to publish
  `--tg-theme-*` / `--tg-viewport-*`, then layer a **shadcn-style semantic token
  set** (`--background`, `--foreground`, `--primary`, `--border`, …) that maps
  Telegram → app tokens, each with an **outside-Telegram light fallback**.
  Tailwind utilities are wired to these via `@theme inline`. Rationale: matches
  SPEC §2/§3.7, is the idiomatic approach buyers check for (§5), and keeps the
  SDK confined to one adapter module.
- **Accent foreground is computed, not configured.** `readableTextColor()` picks
  black/white by **WCAG max-contrast** against the brand accent, so dropping in
  *any* accent color still yields a readable primary button — essential for the
  "re-skin in 20 min" promise (§3.8). Consequence: a bright accent (e.g. the
  sneaker `#ff4d2e`) gets black label text, which is the higher-contrast choice.
- **Dark mode is class-based**, driven by Telegram's `miniApp.isDark` signal (not
  `prefers-color-scheme`), because a Telegram client's scheme can differ from the
  OS. `@custom-variant dark` + a `.dark` class + `color-scheme` on `<html>`.

### Typography & perf

- **System font stack** for the native Telegram feel and a **zero web-font
  payload** (protects the SPEC §7 perf budget). `--font-display` defaults to the
  sans stack with a `--brand-font-display` override hook for future per-brand
  display faces. Assumption: for a TMA, native feel + performance outrank a
  distinctive web font; design character comes from layout, motion, and accent.

### Brand config (`/public/config/brand.json`)

- Schema (zod-validated): `name`, `welcomeLine`, `logo {emoji? | url?}` (≥1),
  `accentColor` (hex), `currency {label=TON, usdRate?}`, `productsFile` (abs path).
- **Emoji logos** are allowed so example brands need zero image assets and stay
  trivially swappable (`☕`, `👟`). Real image logos are supported via `logo.url`.
- **USD hint uses a static `currency.usdRate`** (set to 5.2). There is no live
  price feed — a backend/price oracle is out of scope (§4). The hint is clearly
  approximate.
- Brand strings are **English only** for now; RU localization is handled by the
  app's locale dictionaries in a later slice, not by per-brand translations.
- A built-in **`DEFAULT_BRAND`** is used if `brand.json` is missing or invalid, so
  the app never white-screens during a demo.
- `brand.json` ships as the coffee brand; `brand.coffee.json` and
  `brand.sneakers.json` are the two example skins (§3.8). The `productsFile` each
  references is created in slice 2 (catalog); brand loads independently of it.

### Telegram SDK init (`@telegram-apps/sdk-react` 3.3.9)

- Flow: `isTMA()` guard → `init()` → mount `themeParams`/`miniApp` (sync) and
  `viewport` (async) → `bindCssVars()` + `expand()` (§3.6) + `ready()`. Every SDK
  call is guarded by `.isAvailable()` or wrapped to swallow unsupported-method
  errors, so an older client degrades instead of crashing (§5).
- **Outside Telegram**, `initTelegram()` returns `{ inTelegram: false }` and the
  UI relies on the token fallbacks. The full "this app lives inside Telegram"
  fallback page is slice 7.
- A **dev-only `mockTelegramEnv`** (Telegram "Night" palette + sample init data)
  lets `npm run dev` render the themed UI in a normal browser. It's imported
  behind `import.meta.env.DEV`, so it's tree-shaken from production builds, and
  it passes launch params as a raw query string (the on-the-wire format) to stay
  fully typed.

### Scope held for later slices

- Slice 1 ships a minimal branded **home shell** (header + hero + accent CTA +
  value cards) purely to demonstrate the theming end-to-end. The **Catalog
  replaces it in slice 2**.
- The shared UI kit (`shared/ui`: Button, Card, Price, Skeleton, Stepper) is
  **not** pre-built; each primitive lands with the screen that first needs it.
- `animate-rise` (staggered page-load entrance) is added as a motion foundation;
  `prefers-reduced-motion` neutralizes it.

### Verification (slice 1)

`tsc -b` clean · `eslint .` clean · **22 tests pass** · `vite build` clean,
initial JS **78.7 KB gzip** / CSS **3.8 KB gzip** (SPEC §7 budget: < 250 KB gzip).

---

## Review fixes — applied before slice 2 (2026-06-13)

Addressing the slice-1 review:

1. **Live theme switching is reactive + tested.** The dark class now derives from
   `themeParams.isDark` (was `miniApp.isDark`) — the signal Telegram updates on
   its `theme_changed` event, and the one consistent with the colors
   `bindCssVars()` applies. `themeReactivity.test.tsx` mounts the provider with a
   dark palette, emits `theme_changed` with a light palette, and asserts the
   `.dark` class + `color-scheme` flip mid-session.
2. **Logo schema supports real images.** Brand config flattened to `logoUrl`
   (image, primary) + `logoEmoji` (fallback). One example skin uses an image
   (`brand.sneakers.json` → a hand-authored, locally bundled `/public/brand/sole.svg`),
   the other an emoji (`brand.coffee.json` → ☕), proving both render paths
   (covered by tests). Logo images are bundled locally — never hotlinked.
3. **Dev mock fully excluded from production.** `mockEnv` is loaded via a dynamic
   `import()` inside the `import.meta.env.DEV` guard in main.tsx, so it is
   dead-code-eliminated — verified by grepping `dist/` (no mock module, palette,
   or function name present).
4. **Browser floor documented (Tailwind v4 tradeoff).** Safari 16.4+ /
   Chrome·Edge 111+ / Firefox 128+, due to v4's use of cascade layers,
   `@property`, and `color-mix()`. Accepted because the Telegram in-app WebView
   comfortably exceeds it. Stated in the README and here.
5. **CI added.** `.github/workflows/ci.yml` runs typecheck → lint → test → build
   on every push/PR (Node 22), with a status badge in the README.

Supporting assumptions:

- **CI badge / repo slug** assumes `github.com/MmDZ21/tma-storefront-demo` (no git
  remote is configured yet). Update the badge URL if the slug differs.
- **LICENSE** copyright holder is `MmDZ21` (from the git user); adjust to a legal
  name if preferred.
- **npm registry pinned to the official registry** via a committed `.npmrc`, and
  `package-lock.json` was regenerated so it carries no mirror-specific URLs —
  clean, reproducible installs on CI and for anyone who forks the repo.

---

## Slice 2 — Catalog (2026-06-13)

### Products config

- `products.json` is zod-validated exactly like brand.json (`config/products.ts`):
  a `ProductSchema` (id, name, description, priceTon, image, category, badge?)
  wrapped in `{ products: [...] }`. The `image` field is regex-validated to a
  **local absolute path**, which structurally rejects hotlinked/remote URLs (per
  the directive: no external image dependencies).
- `brand.productsFile` points at the active brand's products file, so a re-skin
  swaps the catalog along with the branding. Coffee + sneaker sets ship with
  **8 products each** (SPEC §3.1).

### Product imagery

- Product images are **authored locally as flat-SVG illustrations**, emitted by
  `scripts/generate-product-images.mjs` (`npm run gen:images`; outputs are
  committed). Rationale: the demo must ship license-free imagery with zero
  external dependencies — authored SVGs guarantee that, stay tiny (16 images ≈
  68 KB total), scale crisply, and re-skin trivially. Swap in real photos later
  by replacing the files the `image` paths point at. Coffee uses a coffee-bag
  motif, sneakers a flat low-top, each recolored per product from a palette table.

### Catalog UI

- `Catalog` loads the active brand's products, shows **skeleton loaders** on first
  paint (SPEC §3.1/§7 — never spinners), then a 2-column grid with **category
  chips** (derived from the products, with "All" prepended) for client-side
  filtering.
- New shared primitives: `Skeleton` (shimmer via a `.skeleton` component class +
  a `color-mix` highlight) and `Price` (TON amount + approximate USD hint from
  `brand.currency.usdRate`). `formatTokenAmount` / `formatUsd` are TDD'd pure
  helpers. App now composes `Header` + `Catalog` (the slice-1 home shell is gone).

### Init resilience (found during visual QA)

- Visual QA caught a **blank-screen-on-reload** bug. In dev, `mockTelegramEnv`
  installs a *per-load* postMessage interception, but `mockTelegramEnvForDev` was
  short-circuiting on `isTMA()` (which stays true across reloads via persisted
  launch params), so `init()` threw `UnknownEnvError` and React never mounted.
  Fix: the dev mock now always re-applies, **and** `initTelegram` wraps its SDK
  calls in try/catch so any hard SDK failure falls back to token theming instead
  of blanking the app. Added a static `favicon.svg` (removes the dev 404; a
  brand-aware favicon is a candidate polish item).

### Budget

- Initial JS **79.5 KB gzip** / CSS **4.4 KB gzip** — the catalog added ~0.8 KB JS
  (images are separate static assets). Comfortably under the 250 KB gzip budget,
  so **no per-route code-splitting yet**; revisit when the product/cart/status
  routes and a router land.

### Verification (slice 2)

`tsc -b` clean · `eslint .` clean · **39 tests pass** · `vite build` clean · both
skins (coffee + sneakers) visually verified in a 390px mobile viewport with the
dark Telegram theme — logo, accent, products, categories all re-skin from one
JSON swap.

---

## Slice 3 — Product page (2026-06-13, overnight)

### Router

- **`react-router-dom` v7 with `HashRouter`** (the one new top-level dep allowed
  tonight). Hash routing because the app is a pure SPA with no server: it's
  refresh-safe on static hosting (Cloudflare Pages) with no SPA-fallback config,
  and the URL is invisible inside Telegram anyway. Routes: `/` (Catalog),
  `/product/:id` (Product). The `<Router>` lives in main.tsx so tests can supply
  a `MemoryRouter`.

### State

- **Zustand cart store** (`entities/cart/cartStore.ts`). This is "anything else"
  per the overnight dep rule, but it's pre-decided by SPEC §2 ("Zustand for
  cart") and slice 3's Add-to-cart needs it — rationale logged as required. Lines
  are keyed by product id; `cartCount` / `cartTotalTon` are pure selectors.

### Telegram native UI (`features/telegram`)

- New module for cross-cutting native controls: `useMainButton`, `useBackButton`,
  `haptics`, and a `TelegramProvider` exposing `{ inTelegram, platform,
  nativeControls }`. Every SDK call is guarded/try-caught so it degrades quietly.
- **`inTelegram` vs `nativeControls`** — an important distinction surfaced by
  visual QA. `inTelegram` means "Telegram launch data is present" (real client
  *or* the dev mock) and gates the slice-7 fallback page. `nativeControls` means
  "a real client is painting native chrome" — only then do we drive the native
  MainButton/BackButton; otherwise we render in-app equivalents, because the dev
  mock supplies data but can't paint Telegram's own UI. Computed as
  `inTelegram && !import.meta.env.DEV` (the mock only runs in DEV, so DEV is a
  reliable "is-mocked" proxy).
- **`PrimaryButton`** renders nothing in a real client (the native MainButton is
  the CTA, SPEC §3.6/§5) and a sticky in-app button everywhere else, so the funnel
  is visible in dev/preview/tests and never dead-ends. The product page's back
  affordance follows the same rule (native BackButton in-client; an in-app
  chevron otherwise).

### Product page

- Loads products independently via the existing `useProducts(brand.productsFile)`
  and finds by `:id` (no shared products provider — the file is tiny and
  HTTP-cached, so a second fetch is cheaper than the refactor). Image, badge,
  name, `Price`, description, `Stepper` (selection haptics), and the MainButton
  CTA "Add to cart · {qty×price} {label}".
- **Add to cart** adds to the store, fires a success haptic, and (for slice 3)
  returns to the catalog. Slice 4 will route it to `/cart`. The header gained a
  cart-count badge (display-only this slice; slice 4 makes it a link).

### For human review

- `nativeControls` uses `!import.meta.env.DEV` as the "not mocked" proxy. Side
  effect: running `vite dev` *inside* a real Telegram client (via a tunnel) would
  show in-app controls instead of native ones. Fine for the demo (prod build in
  Telegram → native); flag if on-device dev testing needs native controls.
- The native MainButton/BackButton wiring is typechecked but only exercisable in
  a real Telegram client (not the dev mock or jsdom) — **queued for on-device QA**.

### Verification (slice 3)

`tsc -b` clean · `eslint .` clean · **54 tests pass** · `vite build` clean ·
initial JS **94.6 KB gzip** (+~15 KB for router+zustand; budget 250) · product
page visually verified (image, stepper, sticky CTA) in a mobile viewport.

---

## Slice 4 — Cart & checkout (2026-06-13, overnight)

### Cart

- `/cart` screen: line items (thumbnail, name, unit `Price`, `Stepper` to change
  qty, Remove), a subtotal, an empty state, and the `Checkout · {total}`
  MainButton (the §5 funnel text). The header cart badge is now a `<Link>` to
  `/cart`; the product page's "Add to cart" routes here.

### Order model (`entities/order/orderStore.ts`)

- A **minimal, mocked `Order`** (per the slice-6 note), deliberately adaptable:
  `{ id, items[], totalTon, createdAt, status: 'placed'|'paid'|'delivered',
  paymentMethod: 'ton'|'simulated', txHash: string|null }`. `paymentMethod` /
  `txHash` are the seams ton-pay will populate. `placeOrder(lines)` snapshots the
  cart into an order; `setStatus` drives the timeline. Ids via
  `crypto.randomUUID()`, `createdAt` via `Date.now()` (app runtime).

### Checkout — simulated (ton-pay is gated)

- Slice 5 (ton-pay) is a hard stop, so checkout **places a simulated order**
  (`paymentMethod: 'simulated'`, no tx), clears the cart, fires a success haptic,
  and routes to `/status/:id`. When ton-pay lands it will insert the real TON
  transfer *before* `placeOrder` and pass `'ton'` + the tx hash — the only change
  needed. The §3.4 "simulate payment" path is effectively already the default
  until then.

### Status (placeholder)

- `/status/:id` ships as an order summary + "Order placed" this slice; **slice 6
  replaces the body with the animated placed → paid → delivered timeline**. It
  reads the order from the store by id.

### Closing confirmation (§3.6)

- `useClosingConfirmation(cartNotEmpty, inTelegram)` enables Telegram's close
  confirmation while the cart is non-empty. Gated on `inTelegram` so it makes no
  SDK calls (and logs no warnings) in tests / outside Telegram.

### For human review

- Checkout simulates payment until ton-pay (slice 5). Confirm the `Order` shape
  above carries everything ton-pay + the status timeline need before that slice.

### Verification (slice 4)

`tsc -b` clean · `eslint .` clean · **62 tests pass** (stabilized — see below) ·
`vite build` clean · initial JS **95.7 KB gzip** (budget 250) · full funnel
visually verified: catalog → product → add → cart (rows/stepper/remove/subtotal)
→ checkout → order-placed status.

- **Test-flake fix:** the brand → products double-fetch occasionally tripped the
  default 1s `findBy` timeout under heavy parallel jsdom load (intermittent, file
  order-dependent). Raised Testing Library's `asyncUtilTimeout` to 3000 ms in the
  test setup; full suite then green 3×/3 consecutive runs.

---

## Slice 6 — Order status timeline (2026-06-13, overnight)

### Timeline

- `/status/:id` now renders an animated **placed → paid → delivered** timeline
  (SPEC §3.5): node dots transition color/scale as steps complete, a vertical
  connector fills via a `height` transition, and the active node pulses. The
  active step carries `aria-current="step"`.
- **Auto-advance:** a `setTimeout` (1800 ms/step) driven by the pure `nextStatus`
  helper walks the order forward for the demo. Because it's keyed on the current
  status, each advance re-arms the next — and the CSS transitions animate on each
  change. When **ton-pay lands, the `paid` step will be triggered by the real TON
  transfer** instead of the timer (the order already carries `paymentMethod` /
  `txHash` for this).
- `ORDER_STATUS_SEQUENCE` + `nextStatus` live in the order store (pure, TDD'd);
  the `Order` type itself is unchanged from slice 4.

### Note

- The "Paid → Payment confirmed on TON testnet" copy is illustrative while
  checkout is simulated; ton-pay makes it literal. Acceptable for the demo.

### Verification (slice 6)

`tsc -b` clean · `eslint .` clean · **65 tests pass** (incl. a fake-timer
auto-advance test) · `vite build` clean · initial JS **96.3 KB gzip** (budget
250) · timeline visually verified: full funnel → animated placed→paid→delivered.

---

## Slice 7 — Outside-Telegram fallback (2026-06-13, overnight)

### Fallback page

- Opened outside Telegram (`!inTelegram`), the app renders a slim, branded page
  (SPEC §3.9): shop logo + name, "This app lives inside Telegram", a **QR code**,
  and an "Open in Telegram" deep-link button. The decision happens in main.tsx
  before the router mounts. A DEV-only `?fallback` query previews it.

### New dependency — `qrcode.react` (with rationale)

- §3.9 explicitly requires a QR code, and there's no reliable zero-dep way to
  render one. Added `qrcode.react` (tiny, zero transitive deps). **Lazy-loaded**
  via `React.lazy`, so it builds into its own chunk (≈6.9 KB gzip) fetched *only*
  outside Telegram — the in-Telegram initial bundle is unchanged. This also
  exercises the slice-2 directive "code-split per route if needed."

### Bot deep link

- `src/config/app.ts` → `APP.botUrl` is a **placeholder** (`https://t.me/
  your_storefront_bot`) used by the QR + button. **Must be set to the real bot
  link in slice 8** (bot). Flagged for review.

### For human review

- `APP.botUrl` placeholder — finalize when the bot ships (slice 8).

### Verification (slice 7)

`tsc -b` clean · `eslint .` clean · **67 tests pass** · `vite build` clean ·
initial JS **96.9 KB gzip** (budget 250); fallback + QR isolated to a **6.9 KB
gzip lazy chunk** · fallback visually verified (branded page, real QR, deep link)
via the dev `?fallback` preview.

---

## Pre-ton-pay prep (2026-06-13, after review) — order seam · single fetch · slice-8 routing TODO

Three prep tasks accepted from the consolidated diff review, **before** ton-pay
(slice 5) — which stays gated pending a separate security-review frame.

### A. Order model — on-chain payment seam (additive, non-breaking)

- Added three **optional** fields to `Order` so ton-pay (slice 5) lands without a
  schema migration: `amountNano?: string` (exact nanoton amount — `totalTon` is a
  float and can't be reconciled against on-chain integers), `boc?: string` (TON
  Connect `sendTransaction` result, available immediately), and
  `payerAddress?: string`. `txHash: string | null` is **kept** and stays null until
  an indexer confirms the transfer — so `boc` (submitted) and `txHash` (confirmed)
  are deliberately distinct.
- `placeOrder` gained an optional 4th arg `payment?: PaymentDetails`, spread onto the
  order. Existing calls (`placeOrder(items)`, `placeOrder(lines, 'ton', hash)`) are
  unchanged; a simulated order omits all three keys entirely. The ton path is
  `placeOrder(lines, 'ton', null, { amountNano, boc, payerAddress })`.
- Tests added: "carries on-chain payment details for a TON order before confirmation"
  (ton path) and "omits on-chain payment details for a simulated order" (simulated
  path). All fields optional → the prior suite stays green.
- **Assumption:** ton-pay confirms payment by later setting `txHash` (+ advancing
  status to `paid`); that confirmation method is slice 5's job, not built now.

### B. Single product fetch — kill the skin-mismatch double-fetch

- **Cause (not the test timeout):** `ThemeProvider` rendered children with
  `DEFAULT_BRAND` immediately, so `useProducts(brand.productsFile)` fired against the
  *default* skin's file, then re-fired when the real brand resolved to a *different*
  file — two fetches and a products loading→ready flicker on any re-skin.
- **Fix:** `BrandContext` now exposes `ready` (true once `loadBrand` settles —
  resolved *or* fell back to default) via a new `useBrandReady()` hook.
  `useProducts(productsFile: string | null)` treats `null` as "not ready, stay in
  loading (skeleton), fetch nothing". Catalog + Product call
  `useProducts(ready ? brand.productsFile : null)`, so the catalog fetches the
  **resolved** skin's products **exactly once**. The brand context value is memoized
  so unrelated theme (`isDark`) re-renders don't churn brand consumers.
- **Tradeoff:** products now fetch strictly after the (tiny, same-origin) brand fetch
  rather than racing it from a default — correct, imperceptible for the demo, and it
  removes the flicker, which matters for a re-skinnable template.
- Regression test added: "fetches the active skin's products exactly once (no
  default-skin pre-fetch)" — a sneakers brand whose `productsFile` differs from the
  default; asserts a single product fetch, to the resolved path. (Fails on the old
  code, which fetched both coffee and sneakers.)

### C. ⚠️ BLOCKING for slice 8 — HashRouter vs `tgWebAppStartParam` deep links

- **Conflict:** Telegram delivers launch data in the URL **hash**
  (`#tgWebAppData=…&tgWebAppStartParam=PAYLOAD`). `HashRouter` also owns the hash, so
  on a real-client deep link (`t.me/<bot>/<app>?startapp=PAYLOAD`) the initial hash is
  the Telegram params — not a route — and HashRouter matches nothing while the
  `startapp` payload is dropped. This passes every local gate because the **dev mock
  injects launch params via the SDK store, not the URL hash**, so local/jsdom never
  reproduces it. It is **not broken yet** only because nothing consumes
  `tgWebAppStartParam` until slice 8.
- **Agreed fix (deferred to slice 8 + on-device QA via a proxy/tunnel — NOT
  implemented now):** keep `HashRouter` (refresh-safe on static hosting); in
  `main.tsx`, after `initTelegram()` caches launch params to `sessionStorage`, read
  `retrieveLaunchParams().tgWebAppStartParam`, map it to a route, and set
  `window.location.hash` to that route **before** mounting `<HashRouter>`. Recorded
  as a comment at the mount site in `src/main.tsx`.

### Verification (prep)

`tsc -b` clean · `eslint .` clean · **76 tests pass** (was 73: +2 order, +1 catalog) ·
`vite build` clean · initial JS **97.0 KB gzip** (budget 250); fallback chunk **6.9 KB
gzip**. ton-pay (slice 5) not started — gated.

---

## Slice 5 — TON pay (testnet) — BUILD pass (2026-06-13)

Real TON Connect payment on **testnet only** (SPEC §3.3; §4 forbids mainnet/fiat/Stars).
This is the **build** pass — a separate security review follows, so the
security-sensitive pieces below are flagged, not certified.

### Dependency — `@tonconnect/ui-react` v3 (authorized)

- The one new top-level dep for this slice (the user named it). Wallet connect +
  `sendTransaction` UI for TON Connect.
- **`npm audit` reports 11 high-severity advisories** in its transitive tree. Left
  **un-fixed on purpose** — `audit fix --force` pulls breaking majors; triaging these
  belongs to the security pass. Flagged below.

### Testnet enforcement (§4)

- `sendTransaction` pins `network: CHAIN.TESTNET`, so a mainnet-connected wallet is
  rejected rather than silently charged. No mainnet/fiat/Stars path exists.

### Money in nanotons — one conversion helper (`src/shared/ton.ts`)

- `tonToNano` / `nanoToTon` (1 TON = 1e9 nanoton). All money arithmetic is in nanoton
  **bigints**; `cartTotalNano` sums `tonToNano(price) * qty` so **no float math ever
  touches money**. Floats appear only in final display formatting.
- **String** inputs are exact (>9 decimals throws). **Number** inputs (the `priceTon`
  floats from products.json) are snapped to nanoton via `toFixed(9)` — exact for the
  coarse decimals real prices use. Unit-tested with boundary values incl. the classic
  `0.1 + 0.2` float trap (passes in nanoton space).
- **Deviation from SPEC §3.3** ("0.01 TON transfer"): per the slice-5 instruction the
  amount is the **cart total** (testnet TON is valueless, so the 0.01 safety rationale
  doesn't apply).

### Order seam (slice-4 prep) — used as designed

- TON checkout calls `placeOrder(items, 'ton', null, { boc, amountNano, payerAddress })`.
  `txHash` stays **null** until the indexer confirms; status stays **'placed'**.
- New store method `confirmPayment(id, txHash)` records the hash + advances to 'paid'.

### Cart — two paths, MainButton drives the funnel (§3.3/§3.4/§5)

- **Pay with TON**: the MainButton reads "Connect wallet to pay" → (once connected)
  "Pay with TON · {total}" → "Confirm in your wallet…", matching §5's funnel text.
  First tap opens the wallet picker; the next pays.
- **Demo mode: simulate payment** (§3.4): always-visible secondary button so a viewer
  with no wallet still completes the funnel — never dead-ends. Simulated orders keep
  `paymentMethod: 'simulated'` and carry **no** on-chain fields.
- Wallet rejection is caught (error haptic, stay on cart) — no dead-end.

### Confirmation — real flow drives 'paid' (§3.5)  ⚠️ security-pass scrutiny

- A TON order in 'placed' polls the **toncenter v3 testnet indexer** for the matching
  incoming payment (`useTonConfirmation`, fetch-only, bounded ~20×3s, abortable). On a
  match it records the real tx hash and advances to 'paid' — so the **real chain**, not
  the demo timer, drives the 'paid' step. The timer is gated off for such orders; it
  still animates simulated orders and the paid→delivered (mocked fulfilment) step.
- **`matchPaymentTx` matches on amount + time only** — it does NOT verify the sender or
  bind to our specific external message. Hardening (message-hash matching via @ton/core,
  or a per-order comment nonce) is a **deliberate follow-up for the security pass**.
  If the indexer is unreachable / no match in the window, the order stays 'placed' with
  an "awaiting confirmation" hint + explorer link (never dead-ends).
- Status shows a testnet **explorer link** (`testnet.tonviewer.com`) once `txHash` is set.

### Manifest + config (§5)

- `public/tonconnect-manifest.json` — `manifestUrl()` derives the URL from the live
  origin (works on any Cloudflare Pages origin, and on `http://localhost` in dev which
  TON Connect permits). **Must be served over HTTPS in production (§5).** The manifest's
  own `url`/`iconUrl` are a **placeholder** origin (`tma-storefront-demo.pages.dev`) —
  set to the real deploy origin. `TON_RECIPIENT_TESTNET` is a **placeholder** testnet
  address — set to the demo's real testnet receiver before on-device QA (like
  `APP.botUrl`).

### Bundle — SDK code-split out of first paint (§7)

- `@tonconnect/ui-react` is ~132 KB gzip. The cart route is **lazy-loaded**
  (`App` → `Suspense` → `CartRoute` → `TonPayProvider`), so the SDK ships in the **cart
  chunk**, fetched only when the cart opens. First-paint (catalog/product) stays at
  **97.8 KB gzip**.
- The `features/ton-pay` **barrel is kept SDK-free** (confirmation + explorer only).
  The SDK isn't marked side-effect-free, so a barrel that re-exported the wallet pieces
  dragged it into the main chunk (measured: 229 KB) when Status imported the barrel.
  Fix: Status imports the SDK-free barrel; the lazy cart route imports
  `TonPayProvider` / `useTonPay` from their modules directly.

### SDK isolation (§6) — verified

- Zero raw `@tonconnect/*` imports in `src/app/**` (only comments + the test stub).
  Screens go through the adapter: Cart→`useTonPay`, CartRoute→`TonPayProvider`,
  Status→`useTonConfirmation`/`explorerTxUrl`.

### Tests

- `@tonconnect/ui-react` is **aliased to a deterministic stub** in `vite.config`
  `test.alias` (connected testnet wallet, fixed BOC) — no heavy SDK in jsdom, real
  adapter code exercised. `tonToNano`/`nanoToTon` (7) and `matchPaymentTx` (5) unit
  tests; the two Cart **payment paths** (simulated vs TON, asserting the exact nanoton
  amount and on-chain fields). 76 → **89 tests**.

### For the security pass (do not self-certify)

1. **`matchPaymentTx` heuristic** (amount + time only) — sender/message not bound.
2. **Indexer trust boundary** — toncenter response is `unknown`-cast; no schema check,
   no API key, public rate limits.
3. **`npm audit`: 11 high-severity** advisories in the TON Connect tree — triage.
4. **Placeholders**: manifest origin + `TON_RECIPIENT_TESTNET` must be set for the live
   flow; manifest must be HTTPS.
5. **initData is still not server-validated** (SPEC §5 wants `/server-notes.md` with the
   HMAC snippet) — separate from payments, not in this slice.
6. Real-wallet path is **typechecked + stub-tested only**; needs on-device QA via a
   proxy/tunnel (no wallet in this env).

### Visual QA

Mobile viewport (390×844), dev mock: catalog → product → **Add to cart → /cart** lazily
mounts the **real** `TonConnectUIProvider` with **0 console errors**; cart shows
"Connect wallet to pay" + "Demo mode: simulate payment"; simulate → status timeline
animates placed→paid→delivered. (The only warning is the pre-existing DEV StrictMode
brand-abort, unrelated.)

### Verification (slice 5)

`tsc -b` clean · `eslint .` clean · **89 tests pass** (was 76: +7 nanoton, +5 confirm
matching, +1 Cart path) · `vite build` clean · first-paint JS **97.8 KB gzip**
(budget 250); TON Connect SDK isolated to a lazy **132 KB gzip** cart chunk. Real-wallet
flow not exercised (no wallet in env) — on-device QA pending. Security review **not**
done — gated.

---

## Slice 5 — security review (FIX-NOW pass) (2026-06-13)

Independent adversarial review of the ton-pay code, then the signed-off FIX-NOW fixes.

### Correction to the build-pass note

The build-pass claim "11 npm advisories in the TON Connect tree" was **wrong**. `npm
audit` shows **0 advisories in `@tonconnect`** (clean). The 11 are: **6 dev/build-only**
(esbuild→vite/vitest/plugin-react — not shipped) and **5 in the Telegram SDK** (the
`valibot` `EMOJI_REGEX` ReDoS via `@telegram-apps/*`, runtime-reachable on launch-param
parsing; upstream-controlled). All pre-date slice 5. Details in `server-notes.md` §3.

### Findings (ranked) and disposition

- **F1 (HIGH) — attribution by amount+time** → equal-amount collision / riding another
  buyer's payment confirms a non-paying order. **FIXED:** a unique per-order **comment
  nonce** is attached to the transfer (`commentPayload` via `@ton/core`) and stored on
  the order; `matchPaymentTx` now requires `comment === nonce` (plus amount + time).
- **F2 (MED) — recipient unvalidated; placeholder footgun.** **FIXED:** recipient moves
  to `VITE_TON_RECIPIENT_TESTNET` (deploy env); `isRecipientConfigured()` gates the Pay
  button (disabled + "use Demo mode") and `pay()` throws if unset — fails loud, Demo mode
  still works. Verified in-browser.
- **F3 (HIGH) — indexer fully trusted/unschema'd.** **FIXED (client part):** toncenter
  responses are **zod-validated, fail-closed** (`parseIndexerResponse`) — malformed ⇒ `[]`,
  never a false confirm; account-scoped query removes the destination-normalisation need.
  *Residual (HONEST-TODO):* a well-formed lying indexer can still fabricate a match →
  needs server-side verification (`server-notes.md` §2).
- **F4 (HIGH, inherent) — client owns all state/price.** **HONEST-TODO:** documented in
  `server-notes.md` §2. (The on-chain amount is already authoritative — no float leak.)
- **F5 (LOW) — cancel/reject → paid?** Confirmed **closed** by design. Hardened the two
  LOW sub-issues: **terminal "couldn't confirm" state** + **Check again** (no eternal
  "confirming…") via `useTonConfirmation` phase/retry; **double-submit guard** (ref) on
  Pay.
- **F6 (MED, accuracy)** — corrected above + `server-notes.md` §3.

### New dependencies (rationale)

- **`@ton/core`** — build the TON text-comment cell for the F1 nonce. Write-side only;
  imported via `comment.ts` → `useTonPay`, so it lands in the **lazy cart chunk**, never
  first paint. It uses the Node `Buffer` global and declares no deps, so **`buffer`** is
  added as a browser polyfill (`buffer-polyfill.ts`, cart chunk). The BOC output is
  deterministic — unit-tested and **verified identical in a real browser** (Playwright
  `import()` of `comment.ts` → exact base64; `globalThis.Buffer` defined).

### initData (SPEC §5)

`server-notes.md` §1 now carries the Express HMAC-SHA256 validation snippet; a client
marker comment was added at `initTelegram.ts` (where the launch params are read) stating
the check belongs server-side and the client trusts initData for nothing.

### Verification (security pass)

`tsc -b` clean · `eslint .` clean · **98 tests pass** (was 89: +2 comment, +3 recipient,
+4 confirm/parse) · `vite build` clean. First-paint JS **97.7 KB gzip** (budget 250,
unchanged — `@ton/core`/`buffer` stay in the lazy cart chunk, now **215 KB gzip**).
In-browser: comment-payload BOC correct, recipient-unconfigured Pay button disabled with
Demo mode working, 0 console errors. Real-wallet round-trip + the HONEST-TODO server
controls still pending (no wallet/backend in scope).

---

## Slice 8 — Telegram bot + deferred deep-link wiring (2026-06-14)

### The bot (`bot/index.ts`) — a pure launcher

- **grammY** (Node 20), one small file (SPEC §6/§8). `/start` → an inline keyboard with a
  **`web_app` button** that opens the Mini App; also sets the persistent chat **menu
  button** to launch it. Runs via **long-polling** (`bot.start()`) — no public HTTP
  endpoint.
- **No authenticated endpoint, no `initData` consumption, no payment/on-chain logic.**
  Per the payments HONEST-TODO: because the bot is a pure launcher with no endpoint, it
  needs **no `initData` validation here**. The check belongs at the server boundary if a
  backend is ever added — documented in `server-notes.md` §1 (and the client marker in
  `initTelegram.ts`). The on-chain trust boundary stays in `server-notes.md` §2; **no
  payment logic was added to the bot.**
- Config via env, never committed: `BOT_TOKEN`, `WEB_APP_URL` (see `.env.example`;
  `.env*` is gitignored). Run with `npm run bot` (tsx); deploy with pm2 on the VPS (SPEC
  §8) — pm2 config is deploy-specific, kept out of git (repo-hygiene).

### HashRouter ↔ `startapp` deep links (the deferred blocking item)

- **Implemented the agreed fix** in `main.tsx`: after `initTelegram()` (which calls
  `retrieveLaunchParams()` and **caches launch params to `sessionStorage`** — verified in
  the SDK source: `@telegram-apps/bridge` reads URL → `window.name` → `getStorageValue
  ('launchParams')` and writes back on each success), we read `tgWebAppStartParam`, map it
  to a route, and `history.replaceState` the hash **before** mounting `<HashRouter>`.
  Clearing the Telegram-params hash is therefore safe — later SDK reads come from
  sessionStorage.
- **Refresh-safe:** the rewrite only happens when the current hash is **not** already a
  route (`resolveInitialHash` returns `null` for a `#/…` hash), so a normal reload / in-app
  navigation keeps its route.
- **Pure + tested:** `startParamToRoute` (payload → route) and `resolveInitialHash`
  (`src/app/startParam.ts`) are pure and unit-tested. Payload convention (Telegram allows
  `[A-Za-z0-9_-]`): `product_<id>` → `/product/<id>`, `cart` → `/cart`, anything else → `/`.
- **Verified in-browser:** loading directly at `#/product/…` is left intact (refresh-safe),
  the route renders, and the shipped mapping integrates. **NOT self-certified:** the real
  Telegram deep-link round-trip (a client opening `t.me/<bot>/<app>?startapp=…` so the SDK
  populates `tgWebAppStartParam` from the URL hash) needs **on-device QA via a proxy/tunnel**
  — the dev mock injects launch params via the SDK store, not the URL, so it can't
  reproduce that leg.

### `APP.botUrl` → env (the second deferred item)

- `src/config/app.ts` now reads `import.meta.env.VITE_BOT_URL` (placeholder fallback), set
  per-deploy. The outside-Telegram fallback (slice 7) consumes it unchanged — its test
  compares against the imported `APP.botUrl`, so it stays green.

### New dependencies (rationale)

- **`grammy`** (dep) — the bot framework (SPEC §6 names grammY). Imported only by `bot/`,
  so it is **not in the app bundle** (build confirms first paint unchanged, no grammy
  chunk). **`tsx`** (devDep) — runs the strict-TS bot file on Node 20 (`npm run bot`).
- `bot/` is typechecked via `tsconfig.node.json` (`include: ["vite.config.ts", "bot"]`);
  `eslint` already had a `bot/**/*.ts` node-globals override.

### Verification (slice 8)

`tsc -b` clean (app + node + bot) · `eslint .` clean · **104 tests pass** (was 98: +6
startapp mapping) · `vite build` clean. First-paint JS **97.8 KB gzip** (budget 250);
grammY not bundled. In-browser: clean load, refresh-safety, and startapp→route mapping
verified; 0 console errors. **On-device QA pending** (real deep-link round-trip; bot
`/start` + menu button on a real client) — not self-certified, needs a real device (proxy/tunnel).

---

## Record-and-deploy polish (2026-07-02)

Pre-recording review pass over the whole codebase (all-green gate). Every fix below
targets a moment the on-camera funnel could look broken; all are UX-only — **no
payment/amount logic was touched**.

### Cart chunk: skeleton fallback + idle prefetch

- The lazy cart route carries the TON Connect SDK (~724 KB min / ~215 KB gzip). Its
  Suspense fallback was a blank `min-h-[60vh]` div — on a phone connection the first
  tap on the cart could show a visibly empty screen mid-funnel. Now: a cart-shaped
  skeleton (`CartFallback` in `App.tsx`), plus an idle **prefetch** of the chunk 1.5 s
  after first paint (clear of the brand/products fetches), so the chunk is warm before
  anyone can reach the cart. `React.lazy` and the prefetch share one importer function,
  so the module is fetched at most once.

### BackButton on deep-linked subpages

- `navigate(-1)` silently no-ops when the subpage is the FIRST history entry (a
  `?startapp=product_<id>` / `?startapp=cart` deep link, or a reload) — leaving the
  native BackButton visibly dead. New `useGoBack()` (`src/app/useGoBack.ts`) falls back
  to `/` (replace) in that case, detected via React Router's convention of keying a
  session's first location `'default'`. Unit-tested both ways (deep-link fallback, and a
  3-deep stack popping to the middle entry to prove real history use).

### No default-brand flash on first paint

- The header, catalog welcome line, and outside-Telegram fallback rendered
  `DEFAULT_BRAND` ("TON Storefront") until `brand.json` resolved — a brief wrong-brand
  flash at the exact "open from bot" moment a demo records. They now render neutral
  skeletons until `useBrandReady()`; the cart-count badge stays live throughout.
  Products were already gated on brand readiness; this closes the header/title gap.

### TON Connect manifest icon must be PNG

- `iconUrl` pointed at `favicon.svg`, but the TON Connect manifest spec does **not**
  support SVG icons — wallets could show a broken icon on the connect/approve sheet, on
  camera during the payment beat. Shipped `public/icon-180.png` (180×180 PNG32
  rasterized from favicon.svg with ImageMagick at `-density 360`) and pointed the
  manifest, a new `apple-touch-icon`, and `og:image` at it. ASSUMPTION: regenerated
  manually if favicon.svg ever changes (one-off; not worth a build step).

### Link-preview meta tags

- `index.html` had no description/OG/Twitter tags, so the deployed URL pasted into a
  Telegram chat unfurled with nothing. Added brand-neutral static copy (crawlers can't
  run the runtime brand fetch) plus `theme-color`. `og:url`/`og:image` are absolute per
  the OG spec and pin the demo origin — same per-deploy nature as
  `tonconnect-manifest.json`; both are now called out in PERSONALIZE.md.

### i18n (EN + RU) — descope made explicit

- SPEC §2 lists "EN + RU"; the RU dictionaries were deferred during the slices and never
  built. Rather than leave the spec/code mismatch silent, the descope is now logged here
  and in the README's "Known limitations". Closing it later is a tiny-dictionary task
  (no i18n framework, per SPEC §2).

### Repo hygiene

- `videos/` (local phone recordings, ~13 MB) is now gitignored — never committed.
- `chunkSizeWarningLimit: 750` silences Vite's 500 KB warning for the known, deliberate
  cart chunk so build logs stay clean; anything larger still warns.

### Verification

`tsc -b` · `eslint .` · **113 tests** (was 110: +2 useGoBack, +1 header skeleton) ·
`vite build` all green; first-paint JS budget unchanged (~98.5 KB gzip vs 250 budget).
