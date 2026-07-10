# Telegram Mini App Storefront — Case Study

## Overview

This project is a production-shaped Telegram Mini App storefront demo for a small catalog.
It proves the complete customer journey inside Telegram: browse products, open a product,
add items to a cart, pay with TON testnet or use demo mode, and follow order status through
delivery.

**Live demo:** [tma-storefront-demo.pages.dev](https://tma-storefront-demo.pages.dev)  
**Telegram launch:** [@tma_demo_bot/store](https://t.me/tma_demo_bot/store)  
**Repository:** [github.com/MmDZ21/tma-storefront-demo](https://github.com/MmDZ21/tma-storefront-demo)

## The challenge

A normal web storefront does not automatically feel native inside Telegram. The demo needed
to handle Telegram theming, viewport behavior, native navigation controls, deep links, wallet
connectivity, and a browser fallback while staying lightweight and easy to rebrand.

The trust boundary also had to be honest: a client-only demo must not pretend that browser
code is a production payment authority.

## What was built

- A complete catalog → product → cart → checkout → order-status funnel.
- Telegram-native theme variables, viewport handling, haptics, MainButton, and BackButton.
- TON Connect checkout on testnet with exact nanoton arithmetic and a per-order comment nonce.
- A no-wallet demo path so a prospect can complete the funnel immediately.
- `startapp` deep-link routing for products and the cart.
- A branded outside-Telegram QR fallback.
- A one-file JSON personalization layer for brand, logo, currency, and product data.
- A small grammY launcher that can run separately from the static web app.

## Engineering decisions

The app uses Vite, React, TypeScript, Tailwind CSS v4, Zustand, Zod, and Vitest. HashRouter
keeps the app compatible with static hosting. TON Connect is lazy-loaded with the cart route,
keeping first paint at roughly 99 KB gzip while heavier wallet code loads only when needed.

The demo deliberately separates UX proof from production authority. The browser can show the
payment and confirmation experience, but a real deployment still needs a backend to own the
order and price, validate Telegram `initData`, and verify the on-chain receipt against a
trusted source.

## Verification

- 113 automated tests passing.
- TypeScript strict build passing.
- ESLint passing.
- Production Vite build passing.
- TON testnet payment round-trip verified on-device.
- Telegram deep-link and launch flow verified on-device.
- Cloudflare Pages deployment live.

## Client outcome

The result is not only a mockup. It is a live, testable sales asset that demonstrates how a
brand can turn an existing Telegram audience into a focused shopping flow. The same shell can
be adapted to a different catalog and visual identity without changing the core navigation,
cart, fallback, or payment UX.
