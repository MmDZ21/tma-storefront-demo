# Telegram Mini App Storefront

[![CI](https://github.com/MmDZ21/tma-storefront-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/MmDZ21/tma-storefront-demo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-informational.svg)](./LICENSE)

A polished **Telegram Mini App (TMA) storefront** with **TON (testnet) payments** —
built as a portfolio piece and a re-skinnable demo template. Native Telegram feel,
automatic dark/light theming, and a one-file personalization layer.

> **Status:** built in vertical slices. **Done:** scaffold + theming.
> **Next:** catalog → product → cart → TON pay → order status → fallback → bot → polish.

## Highlights

- **Native Telegram UX** — theme, viewport, haptics, and the MainButton/BackButton
  driven by [`@telegram-apps/sdk-react`](https://docs.telegram-mini-apps.com).
- **Automatic theming** — every color flows from Telegram's `themeParams` into a
  semantic token layer; dark/light switches live, mid-session. Zero hardcoded color.
- **TON payments (testnet)** — connect a wallet and pay, with a no-wallet
  "simulate payment" path so the demo never dead-ends. *(upcoming slice)*
- **Re-skin in ~20 minutes** — all branding lives in one validated JSON file.

## Personalization (the killer feature)

All branding lives in [`public/config/brand.json`](./public/config/brand.json):
shop name, logo (image **or** emoji fallback), accent color, currency, and the
product list pointer. Swap that one file to re-skin the whole app — logo, colors,
products. Two example skins ship in [`public/config/`](./public/config):

| Skin | Logo | Accent |
| --- | --- | --- |
| `brand.coffee.json` | emoji (`☕`) | warm espresso `#9a5b34` |
| `brand.sneakers.json` | bundled SVG image | vivid `#ff4d2e` |

```bash
# Re-skin to the sneaker store, then reload:
cp public/config/brand.sneakers.json public/config/brand.json
```

## Tech stack

- **Vite 6** + **React 18** + **TypeScript** (strict, zero `any`)
- **Tailwind CSS v4** (CSS-first, bound to Telegram theme variables)
- **Zustand** (cart) · **Zod** (config validation) · **TON Connect** (payments)
- **Vitest** + **Testing Library** · **ESLint 9** + **Prettier**

## Getting started

```bash
npm install
npm run dev        # dev server; renders a mocked Telegram (dark) env in any browser
npm run build      # production build
npm run test       # unit + integration tests
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

To run inside real Telegram, expose the dev server over HTTPS (e.g. a tunnel) and
point a bot's Mini App URL at it. The bot wrapper lands in a later slice.

## Browser support

This project targets **Tailwind CSS v4**, which relies on modern CSS (cascade
layers, `@property`, `color-mix()`). That sets a deliberate browser floor:

> **Safari 16.4+ · Chrome/Edge 111+ · Firefox 128+**

This is an accepted tradeoff: Telegram Mini Apps run inside the Telegram in-app
browser — a recent WebView on iOS, Android, and desktop — which comfortably
exceeds this floor. See [`DECISIONS.md`](./DECISIONS.md) for the rationale.

## Project layout

```
src/
  app/         # screens (Catalog, Product, Cart, Status)
  shared/ui/   # Button, Card, Price, Skeleton, Stepper
  entities/    # product types, cart store
  features/    # theming/, ton-pay/, locale/
  config/      # zod-validated brand + products loaders
public/config/ # brand.json (+ example skins) and product data
```

## License

[MIT](./LICENSE) — the repo is meant to be read, forked, and re-skinned.
