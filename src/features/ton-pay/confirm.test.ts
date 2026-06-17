import { describe, it, expect } from 'vitest';
import {
  matchPaymentTx,
  parseIndexerResponse,
  indexerHeaders,
  type IndexerTransaction,
} from './confirm';

function tx(
  hash: string,
  value: string | null,
  now: number,
  comment: string | null,
): IndexerTransaction {
  return {
    hash,
    now,
    in_msg: { value, source: '0:sender', message_content: { decoded: { comment } } },
  };
}

describe('matchPaymentTx', () => {
  const criteria = { amountNano: '4300000000', sinceUnix: 1000, comment: 'nonce-1' };

  it('matches an inbound tx with the right comment, amount, and time', () => {
    expect(matchPaymentTx([tx('h1', '4300000000', 1500, 'nonce-1')], criteria)).toBe('h1');
  });

  it('does NOT match another order’s comment, even with equal amount + time (F1)', () => {
    expect(matchPaymentTx([tx('h1', '4300000000', 1500, 'nonce-OTHER')], criteria)).toBeNull();
  });

  it('does NOT match a missing / undecoded comment (fail-closed)', () => {
    const noComment: IndexerTransaction = { hash: 'h', now: 1500, in_msg: { value: '4300000000' } };
    expect(matchPaymentTx([noComment], criteria)).toBeNull();
  });

  it('rejects the right comment with the wrong amount (underpayment guard)', () => {
    expect(matchPaymentTx([tx('h1', '1', 1500, 'nonce-1')], criteria)).toBeNull();
  });

  it('rejects a matching comment that predates the order', () => {
    expect(matchPaymentTx([tx('old', '4300000000', 999, 'nonce-1')], criteria)).toBeNull();
  });

  it('returns null for an empty list', () => {
    expect(matchPaymentTx([], criteria)).toBeNull();
  });
});

describe('parseIndexerResponse (F3 — fail-closed)', () => {
  it('parses a well-formed response and keeps the fields we read', () => {
    const data = {
      transactions: [
        {
          hash: 'h1',
          now: 1500,
          in_msg: { value: '100', message_content: { decoded: { comment: 'n' } } },
        },
      ],
    };
    const txs = parseIndexerResponse(data);
    expect(txs).toHaveLength(1);
    expect(txs[0]?.in_msg?.message_content?.decoded?.comment).toBe('n');
  });

  it('returns [] for a non-object / malformed envelope (never a false confirm)', () => {
    expect(parseIndexerResponse(null)).toEqual([]);
    expect(parseIndexerResponse({})).toEqual([]);
    expect(parseIndexerResponse({ transactions: 'nope' })).toEqual([]);
    expect(parseIndexerResponse('error string')).toEqual([]);
  });

  it('drops individual malformed transactions but keeps valid ones', () => {
    const data = { transactions: [{ hash: 'ok', now: 1 }, { bogus: true }, { hash: 5, now: 'x' }] };
    const txs = parseIndexerResponse(data);
    expect(txs).toHaveLength(1);
    expect(txs[0]?.hash).toBe('ok');
  });
});

describe('indexerHeaders (keyed → reliable; unkeyed → graceful fallback)', () => {
  it('adds the X-API-Key header when a key is configured', () => {
    expect(indexerHeaders('test-key')).toEqual({ 'X-API-Key': 'test-key' });
  });

  it('sends no auth header (unkeyed public endpoint) when the key is absent', () => {
    expect(indexerHeaders('')).toEqual({});
  });
});
