/**
 * Telegram `startapp` deep links ↔ app routes (slice 8).
 *
 * Telegram launches a Mini App with launch data in the URL **hash**
 * (`#tgWebAppData=…&tgWebAppStartParam=…`), which `HashRouter` would otherwise read as a
 * route. `main.tsx` replaces that hash with a real route BEFORE mounting the router — the
 * SDK has already cached the launch params in sessionStorage, so clearing the hash is safe.
 * These two pure helpers are the logic behind that (and are unit-tested in isolation).
 */

/**
 * Map a `tgWebAppStartParam` payload to a route. Telegram restricts the payload to
 * `[A-Za-z0-9_-]` (≤ 64 chars), so we use `"<kind>_<id>"` or a bare keyword:
 *   - `product_<id>` → `/product/<id>` (ids are kebab slugs, e.g. `product_ethiopia-blend`)
 *   - `cart`         → `/cart`
 *   - anything else / empty → `/` (an unknown payload never breaks the launch)
 */
export function startParamToRoute(startParam: string | null | undefined): string {
  if (!startParam) return '/';
  if (startParam === 'cart') return '/cart';

  const sep = startParam.indexOf('_');
  if (sep > 0) {
    const kind = startParam.slice(0, sep);
    const id = startParam.slice(sep + 1);
    if (kind === 'product' && id) return `/product/${id}`;
  }
  return '/';
}

/**
 * Decide the hash to install before mounting `HashRouter`, or `null` to leave the current
 * one alone. Only rewrites when the current hash is NOT already a route (i.e. it holds
 * Telegram launch params, or is empty) — so a normal reload / in-app navigation keeps its
 * route and stays refresh-safe.
 */
export function resolveInitialHash(
  currentHash: string,
  startParam: string | null | undefined,
): string | null {
  if (currentHash.startsWith('#/')) return null;
  return startParamToRoute(startParam);
}
