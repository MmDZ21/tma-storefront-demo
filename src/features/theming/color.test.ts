import { describe, it, expect } from 'vitest';
import { readableTextColor, relativeLuminance } from './color';

describe('relativeLuminance', () => {
  it('is 0 for black', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('is 1 for white', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('expands 3-digit shorthand hex', () => {
    expect(relativeLuminance('#fff')).toBeCloseTo(1, 5);
  });
});

describe('readableTextColor', () => {
  it('returns white text on a dark background', () => {
    expect(readableTextColor('#000000')).toBe('#ffffff');
  });

  it('returns black text on a light background', () => {
    expect(readableTextColor('#ffffff')).toBe('#000000');
  });

  it('returns white text on the coffee brand brown', () => {
    expect(readableTextColor('#9a5b34')).toBe('#ffffff');
  });

  it('returns black text on a pale tint', () => {
    expect(readableTextColor('#ffe9d6')).toBe('#000000');
  });

  it('is case-insensitive and accepts shorthand hex', () => {
    expect(readableTextColor('#FFF')).toBe('#000000');
    expect(readableTextColor('#000')).toBe('#ffffff');
  });

  it('throws on a malformed color', () => {
    expect(() => readableTextColor('not-a-color')).toThrow();
  });
});
