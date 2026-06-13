import { describe, it, expect } from 'vitest';
import { tonToNano, nanoToTon, NANO_PER_TON } from './ton';

describe('tonToNano', () => {
  it('converts whole and fractional TON to exact nanotons', () => {
    expect(tonToNano(0)).toBe(0n);
    expect(tonToNano(1)).toBe(NANO_PER_TON);
    expect(tonToNano(1.5)).toBe(1_500_000_000n);
    expect(tonToNano(1.3)).toBe(1_300_000_000n);
  });

  it('handles boundary precision down to a single nanoton', () => {
    expect(tonToNano('0.000000001')).toBe(1n);
    expect(tonToNano('0.123456789')).toBe(123_456_789n);
    expect(tonToNano(1000)).toBe(1_000_000_000_000n);
  });

  it('does no float math on money: 0.1 + 0.2 is exact in nanotons', () => {
    // The classic float trap (0.1 + 0.2 = 0.30000000000000004) cannot occur because
    // each amount becomes a bigint before any addition.
    expect(tonToNano(0.1) + tonToNano(0.2)).toBe(300_000_000n);
  });

  it('throws on negative, malformed, or sub-nanoton string input', () => {
    expect(() => tonToNano(-1)).toThrow();
    expect(() => tonToNano('-1')).toThrow();
    expect(() => tonToNano('1.2.3')).toThrow();
    expect(() => tonToNano('abc')).toThrow();
    expect(() => tonToNano(Number.NaN)).toThrow();
    expect(() => tonToNano('0.1234567891')).toThrow(); // 10 decimals = sub-nanoton
  });
});

describe('nanoToTon', () => {
  it('formats nanotons as a trimmed TON string', () => {
    expect(nanoToTon(0n)).toBe('0');
    expect(nanoToTon(NANO_PER_TON)).toBe('1');
    expect(nanoToTon(1_500_000_000n)).toBe('1.5');
    expect(nanoToTon(1n)).toBe('0.000000001');
    expect(nanoToTon('4300000000')).toBe('4.3');
  });

  it('round-trips with tonToNano', () => {
    expect(nanoToTon(tonToNano('2.5'))).toBe('2.5');
    expect(nanoToTon(tonToNano(3.2))).toBe('3.2');
  });

  it('throws on a negative amount', () => {
    expect(() => nanoToTon(-1n)).toThrow();
  });
});
