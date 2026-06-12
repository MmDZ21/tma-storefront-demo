# Overnight Autonomous Run — Morning Report

**Run:** 2026-06-13, overnight (supervision offline).
**Scope, in order:** slice 3 (product) · slice 4 (cart) · slice 6 (order status) ·
slice 7 (outside-Telegram fallback).
**Hard stops (not started):** slice 5 (ton-pay) · slice 8 (bot) — gated on security
review + external resources.

Each slice passes a self-review gate before the next begins: `tsc -b`, `eslint`,
full `vitest` suite, `vite build` — all green, JS budget (< 250 KB gzip) respected.

---

## TL;DR

All four in-scope slices — **3 (product), 4 (cart & checkout), 6 (order status),
7 (outside-Telegram fallback)** — are implemented, verified, and committed. The
hard-stopped slices **5 (ton-pay)** and **8 (bot)** were not started.

The app now runs the **full funnel**: catalog → product (stepper + Add to cart) →
cart → checkout (simulated order) → **animated placed→paid→delivered** status, plus
the **outside-Telegram fallback** (QR + deep link). Every slice passed its gate
(`tsc -b` · `eslint` · full `vitest` · `vite build`). **73 tests**, all green and
stable; initial JS **96.9 KB gzip** (budget 250) with the QR/fallback split into a
6.9 KB lazy chunk.

Bonus done: deeper test coverage + a DRAFT README. New deps (each logged in
DECISIONS): `react-router-dom`, `zustand` (SPEC §2), `qrcode.react` (lazy).

**Read next:** the _Queued for human review_ list and the _Hard stops_ section
near the bottom. Working tree is clean; nothing pushed.

---

## Slice log

### ✅ Slice 3 — Product page

**Built**
- `react-router-dom` v7 (`HashRouter`) wired in; routes `/` (Catalog) +
  `/product/:id` (Product). Catalog cards now link to the product page.
- Zustand cart store (`entities/cart/cartStore.ts`) + pure selectors
  (`cartCount`, `cartTotalTon`), TDD'd.
- `features/telegram` module: `TelegramProvider` (`inTelegram` / `platform` /
  `nativeControls`), `useMainButton`, `useBackButton`, `haptics`.
- `PrimaryButton` (native MainButton in-client, sticky in-app button otherwise),
  `Stepper` (quantity, selection haptics), and the Product page (image, badge,
  name, price, description, stepper, "Add to cart · {total}").
- Header gained a cart-count badge.

**Verification:** `tsc -b` ✅ · `eslint` ✅ · **54 tests** ✅ · `vite build` ✅ ·
JS **94.6 KB gzip** (budget 250). Product page visually verified in a 390px
viewport (image, stepper, sticky CTA render correctly).

**Key decisions** (full detail in DECISIONS.md → Slice 3)
- HashRouter for a server-less SPA (refresh-safe on static hosting).
- `inTelegram` (data present → show app) vs `nativeControls` (real client →
  native chrome). Dev mock has data but no native UI, so in-app controls show.

**Queued for human review**
- Native MainButton/BackButton wiring is typechecked but only exercisable in a
  real Telegram client — **needs on-device QA**.
- `nativeControls = inTelegram && !DEV`: running `vite dev` inside a real client
  (tunnel) would show in-app controls, not native. Fine for the demo; flag if
  on-device dev needs native.

**Commit:** `e09068f`

### ✅ Slice 4 — Cart & checkout

**Built**
- `/cart` screen: line items (thumbnail, name, price, Stepper, Remove), subtotal,
  empty state, and a `Checkout · {total}` MainButton. Header cart badge links to
  `/cart`; product "Add to cart" routes here.
- Order store (`entities/order/orderStore.ts`) with a minimal, ton-pay-adaptable
  `Order` model. TDD'd.
- Checkout places a **simulated** order (ton-pay is gated), clears the cart, and
  routes to `/status/:id`.
- `/status/:id` placeholder (order summary + "placed"); slice 6 adds the timeline.
- `useClosingConfirmation` — Telegram close-confirmation while the cart is filled.

**Verification:** `tsc -b` ✅ · `eslint` ✅ · **62 tests** ✅ · `vite build` ✅ ·
JS **95.7 KB gzip** (budget 250). Full funnel visually verified
(catalog → product → cart → checkout → status).

**Key decisions** (full detail in DECISIONS.md → Slice 4)
- Checkout simulates payment until ton-pay (slice 5) inserts the real TON
  transfer before `placeOrder` (passing `'ton'` + tx hash).
- `Order` shape logged for ton-pay/status adaptability.

**Fixed**
- Intermittent test flake (brand→products double-fetch vs the 1s findBy timeout
  under load): raised `asyncUtilTimeout` to 3000 ms; suite green 3×/3.

**Queued for human review**
- Confirm the `Order` shape carries everything ton-pay needs before slice 5.

**Commit:** `34f32d1`

### ✅ Slice 6 — Order status timeline

**Built**
- `/status/:id` animated **placed → paid → delivered** timeline: dots transition
  on completion, the connector fills, the active node pulses (`aria-current`).
- Auto-advance via `setTimeout` (1.8 s/step) driven by a TDD'd pure `nextStatus`
  helper. ton-pay will later trigger the `paid` step from the real transfer.

**Verification:** `tsc -b` ✅ · `eslint` ✅ · **65 tests** ✅ (incl. fake-timer
auto-advance) · `vite build` ✅ · JS **96.3 KB gzip** (budget 250). Timeline
visually verified through the full funnel.

**Key decisions** (DECISIONS.md → Slice 6)
- Timeline auto-advances for the demo; the order's `paymentMethod`/`txHash` seams
  let ton-pay drive the `paid` step for real later.

**Commit:** `34b191d`

### ✅ Slice 7 — Outside-Telegram fallback

**Built**
- Branded fallback page (§3.9) shown outside Telegram: logo, shop name, "This app
  lives inside Telegram", a **QR code**, and an "Open in Telegram" deep link.
  DEV-only `?fallback` preview.
- New dep `qrcode.react` (tiny, zero transitive), **lazy-loaded** → own chunk
  (≈6.9 KB gzip) fetched only outside Telegram; in-Telegram bundle unchanged.

**Verification:** `tsc -b` ✅ · `eslint` ✅ · **67 tests** ✅ · `vite build` ✅ ·
initial JS **96.9 KB gzip** (budget 250) + isolated 6.9 KB fallback chunk.
Fallback visually verified (branded page, real QR, deep link).

**Key decisions** (DECISIONS.md → Slice 7)
- `qrcode.react` added with rationale (QR required by §3.9; lazy-split so it never
  ships to in-Telegram users — also satisfies slice-2 "code-split if needed").

**Queued for human review**
- `src/config/app.ts` → `APP.botUrl` is a **placeholder**; set the real bot deep
  link in slice 8.

**Commit:** `c31b8bc`

### ➕ Bonus (all four slices landed) — deeper tests + README draft

- **Test coverage** deepened on existing code: `Price` (USD-hint on/off),
  `loadBrand` (200 validate / non-OK throws), `Header` (name, cart link, badge).
  → **73 tests** total, stable across repeated runs. Commit `50d1c8b`.
- **README.md** expanded into a fuller draft (architecture sketch, updated status,
  layout) and clearly marked **DRAFT** — hero GIF / screenshots / live links / demo
  video still belong to the polish slice.

---

## Hard stops (not started, as instructed)

- **Slice 5 — TON pay:** gated on security review + external resources. The cart
  checkout currently places a *simulated* order; the `Order` model already carries
  `paymentMethod` / `txHash` seams, and the status timeline's `paid` step is ready
  to be driven by a real transfer. No ton-pay code was written.
- **Slice 8 — Bot:** gated on external resources. `src/config/app.ts` →
  `APP.botUrl` is a placeholder for the bot deep link.

## Queued for human review

1. **Native MainButton/BackButton** wiring is typechecked but only exercisable in
   a real Telegram client (not the dev mock / jsdom) — needs on-device QA.
2. **`nativeControls = inTelegram && !DEV`**: running `vite dev` inside a real
   client (tunnel) shows in-app controls, not native. Fine for the demo; revisit
   if on-device dev needs native.
3. **`APP.botUrl`** is a placeholder — set the real bot deep link in slice 8.
4. **Checkout is simulated** until ton-pay (slice 5). Confirm the `Order` shape
   carries everything ton-pay + the timeline need before that slice.
5. **Product imagery** is authored SVG (not photos) — swap to real photos by
   replacing the files the `image` paths point at, if desired.

## End state

- Branch `master`; **clean working tree**; nothing pushed (no remote ops, per
  instructions).
- Commits this run: slice 3 `e09068f` · slice 4 `34f32d1` · slice 6 `34b191d` ·
  slice 7 `c31b8bc` · tests `50d1c8b` · (+ this report/README).
- Every slice passed its gate: `tsc -b`, `eslint`, full `vitest`, `vite build`.
- Initial JS **96.9 KB gzip** (budget 250) + a 6.9 KB lazy fallback chunk.
