import { describe, it, expect } from 'vitest';
import type { Brand } from '@/config/brand';
import { buildBrandThemeVars, applyBrandTheme } from './brandTheme';

const coffee: Brand = {
  name: 'Roast & Ritual',
  welcomeLine: 'Small-batch coffee, delivered on-chain.',
  logoEmoji: '☕',
  accentColor: '#9a5b34',
  currency: { label: 'TON', usdRate: 5.2 },
  productsFile: '/config/products.coffee.json',
};

const sneakers: Brand = {
  ...coffee,
  name: 'SOLE',
  accentColor: '#ff4d2e',
};

describe('buildBrandThemeVars', () => {
  it('maps the accent color and a readable foreground onto --brand-* vars', () => {
    expect(buildBrandThemeVars(coffee)).toEqual({
      '--brand-accent': '#9a5b34',
      '--brand-accent-foreground': '#ffffff',
    });
  });

  it('picks the WCAG-correct foreground for a bright accent', () => {
    // #ff4d2e is bright enough that black text has the higher contrast ratio.
    expect(buildBrandThemeVars(sneakers)['--brand-accent-foreground']).toBe('#000000');
  });
});

describe('applyBrandTheme', () => {
  it('writes the brand variables onto the given element', () => {
    const el = document.createElement('div');
    applyBrandTheme(coffee, el);
    expect(el.style.getPropertyValue('--brand-accent')).toBe('#9a5b34');
    expect(el.style.getPropertyValue('--brand-accent-foreground')).toBe('#ffffff');
  });
});
