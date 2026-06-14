import { describe, it, expect } from 'vitest';
import { startParamToRoute, resolveInitialHash } from './startParam';

describe('startParamToRoute', () => {
  it('maps product_<id> to the product route (incl. kebab slugs)', () => {
    expect(startParamToRoute('product_42')).toBe('/product/42');
    expect(startParamToRoute('product_ethiopia-yirgacheffe')).toBe('/product/ethiopia-yirgacheffe');
  });

  it('maps the cart keyword', () => {
    expect(startParamToRoute('cart')).toBe('/cart');
  });

  it('falls back to the catalog for empty / unknown / malformed payloads', () => {
    expect(startParamToRoute(undefined)).toBe('/');
    expect(startParamToRoute(null)).toBe('/');
    expect(startParamToRoute('')).toBe('/');
    expect(startParamToRoute('wat')).toBe('/');
    expect(startParamToRoute('product_')).toBe('/'); // no id
    expect(startParamToRoute('_orphan')).toBe('/'); // no kind
  });
});

describe('resolveInitialHash', () => {
  it('installs the startapp route when the hash holds Telegram launch params', () => {
    expect(
      resolveInitialHash('#tgWebAppData=abc&tgWebAppStartParam=product_42', 'product_42'),
    ).toBe('/product/42');
  });

  it('installs the route for an empty hash (no existing route)', () => {
    expect(resolveInitialHash('', 'cart')).toBe('/cart');
    expect(resolveInitialHash('', undefined)).toBe('/');
  });

  it('leaves an existing route hash untouched (refresh-safe)', () => {
    expect(resolveInitialHash('#/cart', 'product_42')).toBeNull();
    expect(resolveInitialHash('#/product/9', undefined)).toBeNull();
    expect(resolveInitialHash('#/', 'cart')).toBeNull();
  });
});
