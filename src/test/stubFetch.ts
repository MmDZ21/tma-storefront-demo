import { vi } from 'vitest';

/**
 * Stub global `fetch`, routing requests to a JSON body by URL substring.
 * e.g. `stubFetchRoutes({ 'brand.json': brand, 'products': products })`.
 */
export function stubFetchRoutes(routes: Record<string, unknown>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      for (const [needle, body] of Object.entries(routes)) {
        if (url.includes(needle)) {
          return new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      return new Response('not found', { status: 404 });
    }),
  );
}
