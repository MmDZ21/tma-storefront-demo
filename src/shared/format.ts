/** Price formatting helpers shared across the catalog, product, and cart screens. */

const tokenFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** Format a token amount, trimming trailing zeros: `1.5`, `12`, `1,000`. */
export function formatTokenAmount(value: number): string {
  return tokenFormatter.format(value);
}

/** Format a USD amount with two decimals: `$7.80`. */
export function formatUsd(value: number): string {
  return usdFormatter.format(value);
}
