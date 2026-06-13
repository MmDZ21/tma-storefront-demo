import { describe, it, expect } from 'vitest';
import { matchPaymentTx, type IndexerTransaction } from './confirm';

function tx(hash: string, value: string | null, now: number): IndexerTransaction {
  return { hash, now, in_msg: { value, source: '0:sender' } };
}

describe('matchPaymentTx', () => {
  const criteria = { amountNano: '4300000000', sinceUnix: 1000 };

  it('returns the hash of an incoming tx that matches amount and time', () => {
    const txs = [tx('h1', '4300000000', 1500)];
    expect(matchPaymentTx(txs, criteria)).toBe('h1');
  });

  it('ignores transactions with a different amount', () => {
    const txs = [tx('h1', '4200000000', 1500), tx('h2', '1000000000', 2000)];
    expect(matchPaymentTx(txs, criteria)).toBeNull();
  });

  it('ignores a matching amount that predates the order', () => {
    const txs = [tx('old', '4300000000', 999)];
    expect(matchPaymentTx(txs, criteria)).toBeNull();
  });

  it('tolerates transactions with no inbound message', () => {
    const txs: IndexerTransaction[] = [
      { hash: 'out', now: 1500, in_msg: null },
      tx('h1', '4300000000', 1600),
    ];
    expect(matchPaymentTx(txs, criteria)).toBe('h1');
  });

  it('returns null for an empty list', () => {
    expect(matchPaymentTx([], criteria)).toBeNull();
  });
});
