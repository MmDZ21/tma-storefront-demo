import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { haptics, useBackButton, useTelegram } from '@/features/telegram';
import { cartTotalNano, useCartStore, type CartLine } from '@/entities/cart/cartStore';
import { useOrderStore } from '@/entities/order/orderStore';
import { useTonPay } from '@/features/ton-pay/useTonPay';
import { isRecipientConfigured } from '@/features/ton-pay';
import { nanoToTon } from '@/shared/ton';
import { Price } from '@/shared/ui/Price';
import { Stepper } from '@/shared/ui/Stepper';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';

function CartRow({ line }: { line: CartLine }) {
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const { product, qty } = line;

  return (
    <li className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <img
        src={product.image}
        alt=""
        className="h-20 w-20 shrink-0 rounded-control bg-muted object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate font-medium text-card-foreground">{product.name}</p>
        <Price priceTon={product.priceTon} className="mt-0.5 text-sm" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <Stepper value={qty} onChange={(next) => setQty(product.id, next)} />
          <button
            type="button"
            onClick={() => remove(product.id)}
            aria-label={`Remove ${product.name}`}
            className="text-sm font-medium text-destructive"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

/**
 * Cart & checkout (SPEC §3.3/§3.4). Two paths into a placed order:
 * - **Pay with TON** — real TON Connect testnet transfer; the Order records the BOC,
 *   exact nanoton amount, and payer (status stays 'placed' until the indexer confirms).
 * - **Demo mode: simulate payment** — the no-wallet escape hatch so a viewer without a
 *   wallet still completes the funnel. Never dead-ends the demo.
 */
export function Cart() {
  const navigate = useNavigate();
  const { nativeControls } = useTelegram();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const { connected, connect, pay } = useTonPay();
  const tonConfigured = isRecipientConfigured();
  const [paying, setPaying] = useState(false);
  const inFlight = useRef(false);

  const goBack = () => navigate(-1);
  useBackButton(goBack, nativeControls);

  const items = Object.values(lines);
  const totalNano = cartTotalNano(lines);

  const finish = (orderId: string) => {
    clear();
    haptics.notification('success');
    navigate(`/status/${orderId}`);
  };

  // Real TON payment (SPEC §3.3). First tap connects a wallet; once connected, pay.
  const payWithTon = async () => {
    if (!connected) {
      connect();
      return;
    }
    if (inFlight.current) return; // guard a double-tap before `paying` re-renders the button
    inFlight.current = true;
    setPaying(true);
    try {
      // Unique nonce: attached to the transfer as a comment AND stored on the order, so
      // confirmation binds to THIS order (security review F1).
      const nonce = crypto.randomUUID();
      const result = await pay(totalNano, nonce);
      const order = placeOrder(items, 'ton', null, {
        boc: result.boc,
        amountNano: result.amountNano,
        payerAddress: result.payerAddress,
        paymentNonce: nonce,
      });
      finish(order.id);
    } catch (error) {
      // Wallet rejected / closed — never dead-end; stay on the cart so they can retry
      // or use the demo path.
      haptics.notification('error');
      if (import.meta.env.DEV) console.warn('[ton-pay] payment failed:', error);
      inFlight.current = false;
      setPaying(false);
    }
  };

  // No-wallet path (SPEC §3.4): a simulated order carries no on-chain fields.
  const simulatePayment = () => {
    const order = placeOrder(items);
    finish(order.id);
  };

  // Static label — the amount lives in the DOM "Subtotal" line above, not the native
  // MainButton (mobile Telegram lags/coalesces its setParams text; BUG 2). The subtotal
  // updates as line quantities change; the button text only reflects connect/pay state.
  const primaryText = !tonConfigured
    ? 'TON payment unavailable — use Demo mode'
    : paying
      ? 'Confirm in your wallet…'
      : connected
        ? 'Pay with TON'
        : 'Connect wallet to pay';

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-header/80 px-4 py-3 backdrop-blur-md">
        {!nativeControls && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-foreground"
          >
            ←
          </button>
        )}
        <h1 className="font-display text-lg font-semibold text-foreground">Cart</h1>
      </header>

      {items.length === 0 ? (
        <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-5xl" aria-hidden>
            🛍️
          </span>
          <p className="text-muted-foreground">Your cart is empty.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-control bg-primary px-5 py-2.5 font-medium text-primary-foreground"
          >
            Browse the catalog
          </button>
        </main>
      ) : (
        <>
          <main className="mx-auto w-full max-w-md px-4 pb-40">
            <ul>
              {items.map((line) => (
                <CartRow key={line.product.id} line={line} />
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <Price priceTon={Number(nanoToTon(totalNano))} className="text-base" />
            </div>

            <button
              type="button"
              onClick={simulatePayment}
              disabled={paying}
              className="mt-6 w-full rounded-control border border-border bg-muted py-3 text-sm font-medium text-foreground disabled:opacity-50"
            >
              Demo mode: simulate payment
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              No wallet? Simulate the payment to finish the demo. Real payments use TON testnet.
            </p>
          </main>

          <PrimaryButton
            text={primaryText}
            onClick={() => void payWithTon()}
            disabled={paying || !tonConfigured}
          />
        </>
      )}
    </>
  );
}
