# Publish checklist

The client app is feature-complete and verified (tsc · eslint · 113 tests · build ·
format:check all green). This tracks everything required **before the repo goes public**
— items are checked off (✅ DONE) as they land; what's left needs a device, a real
wallet, or an explicit decision.

## 1. On-device / real-wallet QA (needs Tonkeeper testnet + a proxy/tunnel)

- [x] **TON payment round-trip** — ✅ **DONE** (on-device, inside Telegram). Both paths
      verified: happy path (Tonkeeper testnet → comment-nonce match → reached **delivered**)
      AND the indexer-slow fallback ("couldn't confirm / Check again" → verified on the explorer).
- [ ] **Bot** — chat **menu button** + named **Mini App** (`/newapp`) launch the app on-device
      ✅; `/start` via the running bot process (`npm run bot`, real `BOT_TOKEN`) still to verify.
- [x] **Deep-link round-trip** — ✅ **DONE** (real client, `@tma_demo_bot/store` via BotFather
      `/newapp`): `?startapp=product_<id>` → that product, plain launch → catalog,
      `?startapp=cart` → cart all route correctly (`tgWebAppStartParam` → `resolveInitialHash`
      → route, before HashRouter mounts). Reload/refresh-safety: confirm with one reload if not
      already done.
- [ ] Test on **iOS, Android, and Desktop** Telegram (SPEC §7).

## 2. Media — capture after QA (SPEC §8 shot list). Do NOT fabricate.

- [ ] **Hero GIF** + **3 screenshots** + **90-second demo video**:
  - 0–10s: open from bot, instant load, dark theme
  - 10–30s: browse catalog, add to cart, haptics + MainButton flow
  - 30–55s: TON Connect, testnet payment, success + tx hash
  - 55–70s: order-status timeline animating
  - 70–90s: side-by-side — the same app in two `brand.json` skins
- [ ] Drop them into the README **Demo** placeholders.

## 3. Deploy + wire live links

- [x] **Cloudflare Pages** deploy — ✅ **DONE** (live at `tma-storefront-demo.pages.dev`,
      verified by the on-device payment QA in §1). Deployed via `wrangler pages deploy dist`
      (direct upload): `dist` is built locally, so the build-time env comes from the local
      `.env` (`VITE_TON_RECIPIENT_TESTNET`, `VITE_BOT_URL`, `VITE_TONCENTER_API_KEY`). If
      CI-side builds are ever adopted, mirror those in the Pages project settings.
- [x] **`public/tonconnect-manifest.json`** — ✅ **DONE**: `url` + `iconUrl` point at the
      real deployed origin (`tma-storefront-demo.pages.dev`), and `iconUrl` is now a **PNG**
      (`/icon-180.png`) per the TON Connect manifest spec (SVG icons are not supported).
- [ ] **Bot process** on the VPS via pm2 (`BOT_TOKEN`, `WEB_APP_URL`). The Mini App is
      registered in BotFather (`@tma_demo_bot/store` ✅, see §1) and `VITE_BOT_URL` points
      at the real deep link ✅ — only the long-polling `/start` process still needs hosting.
- [ ] Confirm the **CI badge slug** matches the real GitHub path on first push (currently
      assumes `MmDZ21/tma-storefront-demo`). The README **Live** links are filled ✅
      (app + bot deep link).

## 4. Server-side hardening — the four HONEST-TODOs (see `server-notes.md`)

These are inherent to a client-only demo and **cannot** be closed client-side:

- [ ] **Payment verification + price authority** — a backend owns the order/price and
      verifies the on-chain receipt against a trusted node (key); the client confirmation is
      advisory only. (`server-notes.md` §2)
- [ ] **Telegram `initData` validation** — server-side HMAC-SHA256 before honoring any
      authenticated request. (`server-notes.md` §1)
- [ ] **Dependency advisories** — `valibot` ReDoS via `@telegram-apps/*` (upstream; monitor)
      and the dev-only `esbuild`/`vite` advisories (not shipped). No `npm audit fix --force`.
      (`server-notes.md` §3)
- [ ] **Indexer trust** — confirmation still asks a public indexer and believes the answer;
      real-money confirmation authority belongs to a server holding its own key. (`server-notes.md` §2)
  - ✅ **PRE-VIDEO STEP — DONE:** the toncenter confirmation now uses a **keyed endpoint** via
        `VITE_TONCENTER_API_KEY` (`X-API-Key` header; unkeyed public fallback when absent),
        removing the rate-limit that stalled "Confirming…" so the video's payment-success moment
        is reliable. NOTE: the key only raises the rate limit — it is client-side/public and is
        NOT confirmation authority; server-side verification remains the open item above.

## 5. Git identity — corrupted authorship (publish-blocker)

The **global** `.gitconfig` `user.email` was pasted with embedded newlines + shell commands,
so **every commit's author email is malformed** (`mmohamadzz294@gmail.com` + literal
`git config …` text). This repo now has a clean **local** identity for new commits, but the
existing history is still corrupted.

- [ ] **Decide the public email** — git history uses `mmohamadzz294@gmail.com`; the working
      account is `mmdzkr20@gmail.com`. Pick one for the public repo.
- [ ] **Fix the global config**: `git config --global user.email "<chosen>"` (and re-set
      `user.name`) so other repos stop producing corrupted authors.
- [ ] **Rewrite history** to the chosen identity before pushing (safe — nothing is pushed):
      ```bash
      git filter-repo --mailmap mailmap.txt   # or filter-branch env-filter
      ```
      All commit SHAs change; fine for a never-pushed repo.

## 6. Final pre-push

- [ ] Confirm `.env` is absent from git (gitignored ✓) and `.env.example` holds only
      placeholders ✓.
- [ ] Re-run the full gate green; squash/curate history if desired; push.
