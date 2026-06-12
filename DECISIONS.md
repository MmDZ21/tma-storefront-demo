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
