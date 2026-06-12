# Telegram Mini App Storefront

[![CI](https://github.com/MmDZ21/tma-storefront-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/MmDZ21/tma-storefront-demo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-informational.svg)](./LICENSE)

A polished **Telegram Mini App (TMA) storefront** with **TON (testnet) payments** —
built as a portfolio piece and a re-skinnable demo template. Native Telegram feel,
automatic dark/light theming, and a one-file personalization layer.

> **⚠️ DRAFT** — this README is a working draft. The hero GIF, screenshots, live
> links, and demo video land with the polish/README slice. Everything in the
> _Architecture_, _Personalization_, and _Getting started_ sections is current.

> **Build status:** vertical slices. **Done:** scaffold + theming · catalog ·
> product · cart & checkout · order status · outside-Telegram fallback.
> **Pending:** TON payment (testnet) · bot wrapper · polish · final README.

## Highlights

- **Native Telegram UX** — theme, viewport, haptics, and the MainButton/BackButton
  via [`@telegram-apps/sdk-react`](https://docs.telegram-mini-apps.com), with
  in-app equivalents so the funnel works in any browser too.
- **Automatic theming** — every color flows from Telegram's `themeParams` into a
  semantic token layer; dark/light switches live, mid-session. Zero hardcoded color.
- **Full funnel** — catalog → product → cart → checkout → animated order status.
- **Re-skin in ~20 minutes** — all branding lives in one validated JSON file.

## Architecture

```
        Telegram client (themeParams · viewport · launch data · native buttons · haptics)
                                   │
                                   ▼
   features/theming + features/telegram   ← the only layers that touch the SDK
     • themeParams.bindCssVars() → --tg-theme-* → semantic tokens (with fallbacks)
     • brand.json (zod-validated) → --brand-* CSS variables
     • { inTelegram, nativeControls } context → native vs in-app controls
                                   │
                                   ▼
            app/ routes  (HashRouter: Catalog · Product · Cart · Status · Fallback)
              • shared/ui  — Button-like CTAs, Price, Skeleton, Stepper
              • entities/  — cart + order stores (Zustand)
                                   │
                                   ▼
            public/config/*.json   ← brand + products = the personalization layer
```

Design notes and every judgment call are logged in [`DECISIONS.md`](./DECISIONS.md).

## Personalization (the killer feature)

All branding lives in [`public/config/brand.json`](./public/config/brand.json):
shop name, logo (image **or** emoji), accent color, currency, and the product list
pointer. Swap that one file to re-skin the whole app — logo, colors, products. Two
example skins ship in [`public/config/`](./public/config):

| Skin | Logo | Accent |
| --- | --- | --- |
| `brand.coffee.json` | emoji (`☕`) | warm espresso `#9a5b34` |
| `brand.sneakers.json` | bundled SVG image | vivid `#ff4d2e` |

```bash
# Re-skin to the sneaker store, then reload:
cp public/config/brand.sneakers.json public/config/brand.json
```

Product imagery is generated locally as license-free flat-SVG illustrations
(`npm run gen:images`) — no external image dependencies.

## Tech stack

- **Vite 6** + **React 18** + **TypeScript** (strict, zero `any`)
- **Tailwind CSS v4** (CSS-first, bound to Telegram theme variables)
- **Zustand** (cart/order) · **Zod** (config validation) · **react-router** (HashRouter)
- **qrcode.react** (fallback QR, lazy-loaded) · **TON Connect** (payments — upcoming)
- **Vitest** + **Testing Library** · **ESLint 9** + **Prettier**

## Getting started

```bash
npm install
npm run dev        # dev server; renders a mocked Telegram (dark) env in any browser
npm run build      # production build
npm run test       # unit + integration tests
npm run lint       # ESLint
npm run typecheck  # tsc
```

Dev tips: append `?fallback` to preview the outside-Telegram page; the in-app CTA
stands in for Telegram's native MainButton outside a real client.

## Browser support

Targets **Tailwind CSS v4**, which relies on modern CSS (cascade layers,
`@property`, `color-mix()`):

> **Safari 16.4+ · Chrome/Edge 111+ · Firefox 128+**

An accepted tradeoff — the Telegram in-app WebView comfortably exceeds this floor.

## Project layout

```
src/
  app/         # screens: catalog/ product/ cart/ status/ fallback/ + Header
  shared/ui/   # Price, Skeleton, Stepper, PrimaryButton
  shared/      # formatting helpers
  entities/    # cart + order stores (Zustand)
  features/    # theming/ (brand + tokens) · telegram/ (native controls)
  config/      # zod-validated brand + products loaders, app config
public/config/ # brand.json (+ example skins) and product data
public/img/    # generated product illustrations
scripts/       # build-time asset generators
```

## Demo

<!-- DRAFT: hero GIF, 3 screenshots, 90-second demo video, and live links
     (Cloudflare Pages app + bot) land with the polish/README slice. -->

_Coming with the polish slice._

## License

[MIT](./LICENSE) — the repo is meant to be read, forked, and re-skinned.
