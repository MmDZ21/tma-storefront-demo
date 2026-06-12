# Build Spec — Telegram Mini App Storefront (Portfolio Demo)

> Paste this entire file into Claude Code as the project brief.
> Target: production-quality public demo, built in 3–4 days of focused work.

## 1. Purpose (read this before coding)

This is **not a client project**. It is two things at once:

1. A **public portfolio piece**: a polished Telegram Mini App (TMA) storefront with TON payments, deployed and linkable, proving senior-level Telegram platform engineering.
2. A **personalization template**: every brand element lives in config files, so the app can be re-skinned for a specific sales lead in under 20 minutes (their logo, their products, their accent color) to produce custom demo videos.

Optimize for: first-impression polish, native Telegram feel, clean readable code (the repo itself is marketing), and fast re-skinning. Do NOT optimize for: feature completeness, real commerce logic, backend robustness.

## 2. Hard decisions — already made, do not revisit

| Area | Decision | Why |
|---|---|---|
| Framework | Vite + React 18 + TypeScript (strict) | TMA is a pure SPA. No SEO, no SSR. Smaller bundle, instant deploys. |
| Styling | Tailwind CSS + CSS variables bound to Telegram themeParams | Native look in both dark/light without duplicate styles |
| TMA SDK | `@telegram-apps/sdk-react` | Current standard, typed, hook-based |
| Payments | TON Connect via `@tonconnect/ui-react`, **testnet only** | Real wallet UX, zero financial risk |
| Bot wrapper | grammY (Node 20), single small file | Only exists to launch the Mini App via menu/inline button |
| State | Zustand for cart; React Query not needed | No backend; keep it light |
| Data | Static JSON in `/public/config/` | The whole personalization play |
| Deploy | Cloudflare Pages (app) + existing VPS with pm2 (bot) | CF Pages: free, HTTPS, accessible, fast globally |
| i18n | EN + RU, tiny dictionary files, auto-detect from `language_code` | RU = CIS market signal; no i18n framework needed |
| License / repo | MIT, public, English README | Repo doubles as the resume |

## 3. Screens & features — MUST build

1. **Catalog** — 8 mock products from `products.json` (name, image, price in TON + approx USD hint, optional badge like "Best seller"). Category chips for filtering. Skeleton loaders on first paint.
2. **Product page** — image, description, quantity stepper, "Add to cart" via Telegram **MainButton** with haptic feedback.
3. **Cart & checkout** — line items, totals, then TON Connect flow: connect wallet → send a 0.01 TON **testnet** transfer to the demo address → success state showing tx hash linked to testnet explorer.
4. **No-wallet path** — a visible "Demo mode: simulate payment" button so viewers without a wallet still complete the flow. Never dead-end the demo.
5. **Order status screen** — mocked timeline: Placed → Paid → Delivered, with subtle animation between states.
6. **Native Telegram behavior** — BackButton on subpages, MainButton as the single primary CTA per screen, haptics on key actions, `expand()` on load, closing-confirmation when cart is non-empty, header/background colors from themeParams, correct handling of viewport changes (keyboard).
7. **Theming** — automatic dark/light from Telegram themeParams. All colors via CSS variables only; zero hardcoded hex in components.
8. **Personalization layer (the killer feature)** — ALL branding in `/public/config/brand.json`: shop name, logo URL, accent color, currency display, welcome line, product file pointer. Swapping one JSON re-skins the entire app. Ship **two** example brand files (e.g. a coffee shop and a sneaker store) to prove it.
9. **Outside-Telegram fallback** — if opened in a normal browser, render a slim page: "This app lives inside Telegram" + QR code + deep link to the bot.

## 4. Explicitly OUT of scope — do not build

- Real backend, database, auth, user accounts
- Mainnet payments, fiat, Telegram Stars
- Admin panel, order history persistence
- Search, reviews, wishlists, promo codes

## 5. Telegram-specific correctness (this is what buyers check)

- `initData` **cannot** be validated without a server. Do not fake it. Instead: add `/server-notes.md` containing a ~20-line Express snippet showing the correct HMAC-SHA256 validation, with a comment in the client marking where the check belongs. This signals you know the security model.
- MainButton text/state must drive the funnel: "Add to cart" → "Checkout · X TON" → "Pay with TON".
- `tonconnect-manifest.json` served from the deployed domain (TON Connect requires it over HTTPS).
- Test on Telegram iOS, Android, and Desktop before calling it done.

## 6. Project structure

```
src/
  app/            # routes: Catalog, Product, Cart, Status
  shared/ui/      # Button, Card, Price, Skeleton, Stepper
  entities/       # product types, cart store (zustand)
  features/       # ton-pay/, theming/, locale/
  config/         # brand.json + products.json loaders (typed, zod-validated)
bot/
  index.ts        # grammY: /start → inline keyboard with web_app button
docs/
  PERSONALIZE.md  # re-skin checklist, target ≤ 20 minutes
server-notes.md   # initData validation snippet (see §5)
DECISIONS.md      # log every assumption you make while building
```

## 7. Quality bar (acceptance criteria)

- Lighthouse mobile: Performance ≥ 90; initial JS < 250 KB gzipped
- TypeScript strict, ESLint clean, zero `any` in src/
- 60fps transitions; skeletons instead of spinners
- README (English) with: hero GIF, 3 screenshots, architecture sketch, "Personalize in 20 minutes" section, live links (bot + fallback page)
- Works on iOS / Android / Desktop Telegram clients

## 8. Deliverables

1. Public GitHub repo (MIT, English README as described)
2. Live app on Cloudflare Pages + live bot (token via `.env`, run with pm2 on the VPS)
3. `docs/PERSONALIZE.md`
4. **90-second demo recording** — shot list:
   - 0–10s: open from bot, instant load, dark theme
   - 10–30s: browse catalog, add to cart, show haptic + MainButton flow
   - 30–55s: TON Connect, testnet payment, success + tx hash
   - 55–70s: order status timeline animating
   - 70–90s: side-by-side — same app running two different `brand.json` skins

## 9. Working style for Claude Code

Build in vertical slices, in this order: scaffold + theming → catalog → product → cart → TON pay → status → fallback page → bot → polish → README. Commit per slice. Make reasonable assumptions instead of asking; log each one in `DECISIONS.md`.
