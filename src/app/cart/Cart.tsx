import { useNavigate } from 'react-router-dom';
import { useBrand } from '@/features/theming';
import { haptics, useBackButton, useTelegram } from '@/features/telegram';
import { cartTotalTon, useCartStore, type CartLine } from '@/entities/cart/cartStore';
import { useOrderStore } from '@/entities/order/orderStore';
import { formatTokenAmount } from '@/shared/format';
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

/** Cart & checkout (SPEC §3.3). Checkout places a simulated order (ton-pay later). */
export function Cart() {
  const navigate = useNavigate();
  const brand = useBrand();
  const { nativeControls } = useTelegram();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const placeOrder = useOrderStore((s) => s.placeOrder);

  const goBack = () => navigate(-1);
  useBackButton(goBack, nativeControls);

  const items = Object.values(lines);
  const total = cartTotalTon(lines);

  const checkout = () => {
    // ton-pay (slice 5) will insert the real TON transfer before this point.
    const order = placeOrder(items);
    clear();
    haptics.notification('success');
    navigate(`/status/${order.id}`);
  };

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
          <main className="mx-auto w-full max-w-md px-4 pb-28">
            <ul>
              {items.map((line) => (
                <CartRow key={line.product.id} line={line} />
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <Price priceTon={total} className="text-base" />
            </div>
          </main>
          <PrimaryButton
            text={`Checkout · ${formatTokenAmount(total)} ${brand.currency.label}`}
            onClick={checkout}
          />
        </>
      )}
    </>
  );
}
