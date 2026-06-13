import './buffer-polyfill';
import { beginCell } from '@ton/core';

/**
 * Build the base64 BOC of a TON **text-comment** message body (32-bit zero opcode +
 * UTF-8 text), for the `payload` of a TON Connect message. We attach a unique per-order
 * nonce as the comment so the confirmation poller can bind an on-chain payment to THIS
 * order — closing the amount+time mis-attribution / collision hole (security review F1).
 */
export function commentPayload(text: string): string {
  return beginCell().storeUint(0, 32).storeStringTail(text).endCell().toBoc().toString('base64');
}
