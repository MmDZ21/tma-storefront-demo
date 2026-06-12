import { describe, it, expect } from 'vitest';
import { parseBrand } from './brand';

const validBrand = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee, delivered on-chain.',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

describe('parseBrand', () => {
  it('accepts a well-formed brand and returns a typed value', () => {
    const brand = parseBrand(validBrand);
    expect(brand.name).toBe('Roast & Ritual');
    expect(brand.accentColor).toBe('#9a5b34');
    expect(brand.currency.usdRate).toBe(5.2);
    expect(brand.productsFile).toBe('/config/products.coffee.json');
  });

  it('defaults the currency label to TON when omitted', () => {
    const brand = parseBrand({ ...validBrand, currency: {} });
    expect(brand.currency.label).toBe('TON');
    expect(brand.currency.usdRate).toBeUndefined();
  });

  it('accepts an image logo via logoUrl (no emoji needed)', () => {
    const brand = parseBrand({ ...validBrand, logoEmoji: undefined, logoUrl: '/brand/sole.svg' });
    expect(brand.logoUrl).toBe('/brand/sole.svg');
    expect(brand.logoEmoji).toBeUndefined();
  });

  it('accepts an image logo with an emoji fallback', () => {
    const brand = parseBrand({ ...validBrand, logoUrl: '/brand/sole.svg' });
    expect(brand.logoUrl).toBe('/brand/sole.svg');
    expect(brand.logoEmoji).toBe('☕');
  });

  it('rejects a brand with neither logoUrl nor logoEmoji', () => {
    const { logoEmoji: _logoEmoji, ...rest } = validBrand;
    expect(() => parseBrand(rest)).toThrow();
  });

  it('rejects a missing name', () => {
    const { name: _name, ...rest } = validBrand;
    expect(() => parseBrand(rest)).toThrow();
  });

  it('rejects an accent color that is not a hex value', () => {
    expect(() => parseBrand({ ...validBrand, accentColor: 'coffee' })).toThrow();
    expect(() => parseBrand({ ...validBrand, accentColor: '#12g' })).toThrow();
  });

  it('rejects a products file that is not an absolute path', () => {
    expect(() => parseBrand({ ...validBrand, productsFile: 'products.json' })).toThrow();
  });

  it('rejects a negative usd rate', () => {
    expect(() => parseBrand({ ...validBrand, currency: { usdRate: -1 } })).toThrow();
  });
});
