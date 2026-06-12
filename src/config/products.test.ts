import { describe, it, expect } from 'vitest';
import { parseProducts, deriveCategories } from './products';

const validProduct = {
  id: 'ethiopia-light',
  name: 'Ethiopia Yirgacheffe',
  description: 'Bright and floral, with notes of citrus and jasmine.',
  priceTon: 1.5,
  image: '/img/products/ethiopia-light.svg',
  category: 'Filter',
};

const validFile = { products: [validProduct] };

describe('parseProducts', () => {
  it('accepts a well-formed products file and returns the array', () => {
    const products = parseProducts(validFile);
    expect(products).toHaveLength(1);
    expect(products[0]?.name).toBe('Ethiopia Yirgacheffe');
    expect(products[0]?.priceTon).toBe(1.5);
  });

  it('accepts an optional badge', () => {
    const products = parseProducts({ products: [{ ...validProduct, badge: 'Best seller' }] });
    expect(products[0]?.badge).toBe('Best seller');
  });

  it('rejects an empty catalog', () => {
    expect(() => parseProducts({ products: [] })).toThrow();
  });

  it('rejects a negative price', () => {
    expect(() => parseProducts({ products: [{ ...validProduct, priceTon: -1 }] })).toThrow();
  });

  it('rejects a missing required field', () => {
    const { name: _name, ...rest } = validProduct;
    expect(() => parseProducts({ products: [rest] })).toThrow();
  });

  it('rejects a hotlinked image (must be a local absolute path)', () => {
    expect(() =>
      parseProducts({ products: [{ ...validProduct, image: 'https://example.com/x.jpg' }] }),
    ).toThrow();
  });
});

describe('deriveCategories', () => {
  it('returns unique categories in first-seen order', () => {
    const products = parseProducts({
      products: [
        { ...validProduct, id: 'a', category: 'Espresso' },
        { ...validProduct, id: 'b', category: 'Filter' },
        { ...validProduct, id: 'c', category: 'Espresso' },
      ],
    });
    expect(deriveCategories(products)).toEqual(['Espresso', 'Filter']);
  });
});
