import { describe, it, expect } from 'vitest';
import { parseBrand } from './brand';

const validBrand = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee, delivered on-chain.',
  logo: { emoji: '☕' },
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

  it('accepts a logo with only a url', () => {
    const brand = parseBrand({ ...validBrand, logo: { url: '/brand/logo.svg' } });
    expect(brand.logo.url).toBe('/brand/logo.svg');
  });

  it('rejects a logo with neither emoji nor url', () => {
    expect(() => parseBrand({ ...validBrand, logo: {} })).toThrow();
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
