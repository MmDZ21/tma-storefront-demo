import { Buffer as BufferPolyfill } from 'buffer';

/**
 * `@ton/core` builds cells with the Node `Buffer` global (`Cell.toBoc()` etc.) but
 * declares no dependencies, so the browser must supply it. This side-effect import runs
 * (via `comment.ts` → `useTonPay`, the cart chunk) before any `@ton/core` call. It is a
 * no-op in Node / tests, where `Buffer` already exists.
 */
const globalRef = globalThis as { Buffer?: unknown };
if (typeof globalRef.Buffer === 'undefined') {
  globalRef.Buffer = BufferPolyfill;
}
