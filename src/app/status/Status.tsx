import { useNavigate, useParams } from 'react-router-dom';
import { useBackButton, useTelegram } from '@/features/telegram';
import { useOrderStore } from '@/entities/order/orderStore';
import { Price } from '@/shared/ui/Price';

/**
 * Order status (SPEC §3.5). Slice 4 ships the order summary + "placed" state;
 * slice 6 replaces this body with the animated placed → paid → delivered timeline.
 */
export function Status() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nativeControls } = useTelegram();
  const order = useOrderStore((s) => (id ? s.orders[id] : undefined));

  const goHome = () => navigate('/');
  useBackButton(goHome, nativeControls);

  if (!order) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <button
          type="button"
          onClick={goHome}
          className="rounded-control bg-primary px-5 py-2.5 font-medium text-primary-foreground"
        >
          Back to catalog
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-foreground">Order placed 🎉</h1>
      <p className="mt-1 text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>

      <ul className="mt-6 space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <img
              src={item.image}
              alt=""
              className="h-12 w-12 rounded-control bg-muted object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-card-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">×{item.qty}</p>
            </div>
            <Price priceTon={item.priceTon * item.qty} className="text-sm" />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <Price priceTon={order.totalTon} className="text-base" />
      </div>

      <button
        type="button"
        onClick={goHome}
        className="mt-8 w-full rounded-control bg-muted py-3 font-medium text-foreground"
      >
        Continue shopping
      </button>
    </main>
  );
}
