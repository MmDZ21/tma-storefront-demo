import { describe, it, expect } from 'vitest';
import { commentPayload } from './comment';

describe('commentPayload', () => {
  it('builds the deterministic base64 BOC of a TON text-comment cell', () => {
    // op=0x00000000 (text comment) + UTF-8 'order-123'; value verified against @ton/core.
    expect(commentPayload('order-123')).toBe('te6cckEBAQEADwAAGgAAAABvcmRlci0xMjOC9WhG');
  });

  it('produces distinct payloads for distinct nonces (uniqueness for F1 binding)', () => {
    expect(commentPayload('nonce-a')).not.toBe(commentPayload('nonce-b'));
  });
});
