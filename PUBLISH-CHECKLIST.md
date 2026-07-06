# Publish checklist

The client app is feature-complete and verified (tsc · eslint · 113 tests · build ·
format:check all green). This tracks everything required **before the repo goes public**
— items are checked off (✅ DONE) as they land; what's left is either a final push check
or an explicitly documented client-only limitation.

## 1. On-device / real-wallet QA (needs Tonkeeper testnet + a proxy/tunnel)

- [x] **TON payment round-trip** — ✅ **DONE** (on-device, inside Telegram). Both paths
      verified: happy path (Tonkeeper testnet → comment-nonce match → reached **delivered**)
      AND the indexer-slow fallback ("couldn't confirm / Check again" → verified on the explorer).
- [x] **Bot / Mini App launch** — ✅ **DONE**: the BotFather named Mini App
      (`@tma_demo_bot/store`) launches the app on-device. The long-polling grammY `/start`
      process is optional for this public demo, not a publish blocker.
- [x] **Deep-link round-trip** — ✅ **DONE** (real client, `@tma_demo_bot/store` via BotFather
      `/newapp`): `?startapp=product_<id>` → that product, plain launch → catalog,
      `?startapp=cart` → cart all route correctly (`tgWebAppStartParam` → `resolveInitialHash`
      → route, before HashRouter mounts). Reload/refresh-safety: confirm with one reload if not
      already done.
- [x] Test on **iOS, Android, and Desktop** Telegram (SPEC §7) — ✅ **DONE**.

## 2. Media — captured after QA. Do NOT fabricate.

- [x] **Hero GIF** + **3 screenshots** + **short walkthrough video** — ✅ **DONE**:
      `docs/media/hero.gif`, `docs/media/screenshot-catalog.jpg`,
      `docs/media/screenshot-checkout.jpg`, `docs/media/screenshot-status.jpg`, and
      `docs/media/walkthrough.mp4`. The walkthrough is ~45s instead of the original 90s
      SPEC shot list; accepted for publish because it shows the full funnel plus re-skin
      in a tighter portfolio-friendly cut.
- [x] Drop them into the README **Demo** section.

## 3. Deploy + wire live links

- [x] **Cloudflare Pages** deploy — ✅ **DONE** (live at `tma-storefront-demo.pages.dev`,
      verified by the on-device payment QA in §1). Deployed via `wrangler pages deploy dist`
      (direct upload): `dist` is built locally, so the build-time env comes from the local
      `.env` (`VITE_TON_RECIPIENT_TESTNET`, `VITE_BOT_URL`, `VITE_TONCENTER_API_KEY`). If
      CI-side builds are ever adopted, mirror those in the Pages project settings.
- [x] **`public/tonconnect-manifest.json`** — ✅ **DONE**: `url` + `iconUrl` point at the
      real deployed origin (`tma-storefront-demo.pages.dev`), and `iconUrl` is now a **PNG**
      (`/icon-180.png`) per the TON Connect manifest spec (SVG icons are not supported).
- [x] **Bot process / VPS decision** — ✅ **DONE**: no VPS is required for the core demo.
      Cloudflare Pages hosts the Mini App, and BotFather's named Mini App link
      (`@tma_demo_bot/store`) is the launch path. The included grammY long-polling `/start`
      process remains optional follow-up polish.
- [x] Confirm the **CI badge slug** matches the real GitHub path — ✅ **DONE**:
      `MmDZ21/tma-storefront-demo` is public on GitHub, the README badge points at that
      path, and the first Actions run passed. The README **Live** links are filled ✅
      (app + bot deep link).

## 4. Server-side hardening — the four HONEST-TODOs (see `server-notes.md`)

These are inherent to a client-only demo and **cannot** be closed client-side:

- [ ] **Payment verification + price authority** — a backend owns the order/price and
      verifies the on-chain receipt against a trusted node (key); the client confirmation is
      advisory only. (`server-notes.md` §2)
- [ ] **Telegram `initData` validation** — server-side HMAC-SHA256 before honoring any
      authenticated request. (`server-notes.md` §1)
- [ ] **Dependency advisories** — current audit (2026-07-06) reports only the `valibot`
      ReDoS via `@telegram-apps/*` (upstream; monitor). No `npm audit fix --force`.
      (`server-notes.md` §3)
- [ ] **Indexer trust** — confirmation still asks a public indexer and believes the answer;
      real-money confirmation authority belongs to a server holding its own key. (`server-notes.md` §2)
  - ✅ **PRE-VIDEO STEP — DONE:** the toncenter confirmation now uses a **keyed endpoint** via
        `VITE_TONCENTER_API_KEY` (`X-API-Key` header; unkeyed public fallback when absent),
        removing the rate-limit that stalled "Confirming…" so the video's payment-success moment
        is reliable. NOTE: the key only raises the rate limit — it is client-side/public and is
        NOT confirmation authority; server-side verification remains the open item above.

## 5. Git identity — corrupted authorship

✅ **DONE:** public identity is `MmDZ21 <mmohamadzz294@gmail.com>`. The global and local git
config both point at that identity, and `master` history was rewritten before publish so no
commit author/committer email contains the pasted `git config …` text anymore. A local
rollback bundle exists at `.git/pre-publish-history-backup-20260706-084814.bundle`; it is
inside `.git`, not tracked, and should not be pushed.

- [x] **Decide the public email** — `MmDZ21 <mmohamadzz294@gmail.com>`.
- [x] **Fix the global config** — `user.name` and `user.email` are clean globally and locally.
- [x] **Rewrite history** to the chosen identity before pushing. All commit SHAs changed,
      which is fine for a never-pushed repo.

## 6. Final pre-push

- [x] Confirm `.env` is absent from git (gitignored ✓) and `.env.example` holds only
      placeholders ✓.
- [x] Re-run the full gate green: `typecheck`, `lint`, `test`, `build`, and `format:check`
      pass. `npm audit` still reports the documented upstream `valibot` advisory via
      `@telegram-apps/*`; no `audit fix --force`.
- [x] Push to GitHub and confirm the CI badge after the first Actions run.
