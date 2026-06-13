/**
 * TON ⇄ nanoton conversion (SPEC slice 5 — "no float math on money").
 *
 * On-chain, TON amounts are integers of nanoton (1 TON = 1e9 nanoton). All money
 * arithmetic runs in nanoton `bigint`s; floats appear only when formatting a value for
 * display. This is the single conversion helper for the app.
 */

export const NANO_PER_TON = 1_000_000_000n;
const DECIMALS = 9;

/**
 * Convert a TON amount to an exact nanoton `bigint`.
 *
 * - A **string** is treated as exact: more than 9 decimal places throws (sub-nanoton
 *   precision can't be represented), as does any non-decimal input.
 * - A **number** (e.g. a `priceTon` float from products.json) is snapped to nanoton
 *   precision via `toFixed(9)` — exact for the coarse decimals real prices use. Prefer
 *   a string when you need guaranteed exactness.
 *
 * Throws on negative or non-finite input so money errors surface loudly.
 */
export function tonToNano(ton: number | string): bigint {
  const text = typeof ton === 'number' ? numberToDecimalString(ton) : ton.trim();
  if (!/^\d+(\.\d+)?$/.test(text)) {
    throw new RangeError(`Invalid TON amount: ${String(ton)}`);
  }
  const parts = text.split('.');
  const whole = parts[0] ?? '0'; // regex guarantees a whole part; fallback satisfies TS
  const fraction = parts[1] ?? '';
  if (fraction.length > DECIMALS) {
    throw new RangeError(`TON amount has sub-nanoton precision: ${String(ton)}`);
  }
  return BigInt(whole) * NANO_PER_TON + BigInt(fraction.padEnd(DECIMALS, '0'));
}

/** Format a nanoton amount as a trimmed decimal TON string: `1_500_000_000n` → `"1.5"`. */
export function nanoToTon(nano: bigint | string): string {
  const value = typeof nano === 'bigint' ? nano : BigInt(nano);
  if (value < 0n) throw new RangeError(`Negative nanoton amount: ${String(nano)}`);
  const whole = value / NANO_PER_TON;
  const fraction = value % NANO_PER_TON;
  if (fraction === 0n) return whole.toString();
  const fractionText = fraction.toString().padStart(DECIMALS, '0').replace(/0+$/, '');
  return `${whole.toString()}.${fractionText}`;
}

/** Render a JS number as a plain (non-exponential) decimal string for parsing. */
function numberToDecimalString(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`Non-finite TON amount: ${value}`);
  if (value < 0) throw new RangeError(`Negative TON amount: ${value}`);
  return value.toFixed(DECIMALS);
}
