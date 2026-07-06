# Server notes — the trust boundary this demo cannot cross

This is a **client-only** Mini App (SPEC §2/§4 forbid a backend). Two things therefore
**cannot be made trustworthy in the client** and must move server-side for real money /
real users. This file documents exactly where those checks belong. The client marks the
spot in `src/features/theming/initTelegram.ts` (initData) and
`src/features/ton-pay/confirm.ts` (payment confirmation).

---

## 1. Telegram `initData` validation (SPEC §5)

`initData` (the user id, `auth_date`, and `hash` Telegram passes in the launch params)
is **attacker-spoofable** and **cannot be validated in the browser** — only a server
holding the bot token can verify the HMAC. This app trusts `initData` for **nothing**
security-relevant. When a backend exists, validate it at the boundary before honoring any
request:

```ts
import crypto from 'node:crypto';

/** Verify Telegram Mini App initData (Bot API). Returns true only if the HMAC matches. */
function checkInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;
  params.delete('hash');

  // data_check_string = "key=value" lines, sorted, joined by '\n'
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  // secret_key = HMAC_SHA256("WebAppData", bot_token); then HMAC the data_check_string
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // constant-time compare; also reject stale auth_date (e.g. > 1 day old)
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Express: gate every authenticated route on it.
app.post('/api/order', express.json(), (req, res) => {
  if (!checkInitData(req.body.initData, process.env.BOT_TOKEN!)) {
    return res.status(401).json({ error: 'invalid initData' });
  }
  // …the user identity in initData is now trustworthy…
});
```

---

## 2. Payment verification (security review F3 / F4)

The client **cannot** establish that a payment really happened or that it was for the
right amount — it can only ask a public indexer and believe the answer, and a user can
tamper any client-side state (price, `amountNano`, order `status`). In this demo the
on-chain confirmation in `useTonConfirmation` is **advisory / UX only**.

For real money the server must own the truth:

1. **Own the order and the price.** The client must not decide what an order costs; the
   server computes `amountNano` from its own catalog. Never trust a client-sent amount.
2. **Verify receipt independently.** After the client reports a payment (BOC + the
   per-order comment nonce), the server queries a **trusted node / indexer with an API
   key** for the recipient's inbound transaction matching **that nonce** and **exact
   amount** — or derives the external-message hash from the BOC and looks it up. Only then
   mark the order paid.
3. **Bind to the order.** The per-order comment nonce (already attached client-side in
   `useTonPay` → `commentPayload`) is what lets the server match a specific payment to a
   specific order without amount collisions.
4. **Idempotency / replay.** Mark each tx hash as consumed so one payment can confirm at
   most one order.

The client's `matchPaymentTx` (amount + comment + time) is the same shape of check, but
run somewhere an attacker controls — so it is a UX nicety, not an authorization.

**On the client-held toncenter API key** (`VITE_TONCENTER_API_KEY`): the demo sets it to
raise the indexer rate limit so confirmation is reliable for the video. It is build-time
inlined and therefore **public** (readable from the bundle / network) — it buys rate limit,
**not trust**. A client key querying an indexer is still "ask someone and believe the answer",
so it changes nothing above. Production confirmation authority belongs to a **server** holding
its own key and verifying receipt per (1)–(4).

---

## 3. Dependency advisories (security review F6)

As of 2026-07-06, `npm audit --audit-level=moderate` reports **5 high-severity
advisories** — **none in `@tonconnect`** (the payment dep is clean). The current findings
are all the Telegram SDK path:

- **Telegram SDK (5):** the `valibot` `EMOJI_REGEX` ReDoS, via `@telegram-apps/*`. Runs on
  launch/theme-param parsing every load (a crafted launch URL could hang the victim's own
  webview — client-side DoS, no data/fund impact). **Upstream-controlled** (we can't bump
  `valibot` directly); monitor for a patched `@telegram-apps` release. Do **not** run
  `npm audit fix --force` (it downgrades/pulls breaking majors).

Earlier dev/build-tool advisories in the Vite/Vitest/esbuild tree are not present in the
current audit output.
