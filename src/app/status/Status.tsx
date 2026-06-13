import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBackButton, useTelegram } from '@/features/telegram';
import {
  ORDER_STATUS_SEQUENCE,
  nextStatus,
  useOrderStore,
  type OrderStatus,
} from '@/entities/order/orderStore';
import { useTonConfirmation, explorerTxUrl, explorerAccountUrl } from '@/features/ton-pay';
import { Price } from '@/shared/ui/Price';

const STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'placed', label: 'Placed', desc: 'We’ve received your order.' },
  { key: 'paid', label: 'Paid', desc: 'Payment confirmed on TON testnet.' },
  { key: 'delivered', label: 'Delivered', desc: 'On its way — enjoy!' },
];

const HEADINGS: Record<OrderStatus, string> = {
  placed: 'Order placed',
  paid: 'Payment confirmed',
  delivered: 'Delivered 🎉',
};

/** How long each mocked step lingers before advancing (ms). */
const STEP_DURATION = 1800;

/** Order status timeline (SPEC §3.5) — placed → paid → delivered, auto-advancing. */
export function Status() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nativeControls } = useTelegram();
  const order = useOrderStore((s) => (id ? s.orders[id] : undefined));
  const setStatus = useOrderStore((s) => s.setStatus);
  const confirmPayment = useOrderStore((s) => s.confirmPayment);

  const goHome = () => navigate('/');
  useBackButton(goHome, nativeControls);

  const orderId = order?.id;
  const status = order?.status;
  // A real TON order waits in 'placed' until the indexer confirms the transfer — the
  // demo timer must not advance it. Simulated orders auto-advance the whole timeline.
  const awaitingTon = order?.paymentMethod === 'ton' && status === 'placed';

  // Real flow drives the 'paid' step for TON orders (SPEC §3.5): watch testnet for the
  // matching incoming payment, then record its tx hash and advance to 'paid'.
  const { phase: confirmPhase, retry: retryConfirm } = useTonConfirmation(
    awaitingTon ? (order ?? null) : null,
    (txHash) => {
      if (orderId) confirmPayment(orderId, txHash);
    },
  );

  // Mocked timeline: advance every step on a timer, except a TON order awaiting its
  // real on-chain confirmation.
  useEffect(() => {
    if (!orderId || !status || awaitingTon) return;
    const next = nextStatus(status);
    if (!next) return;
    const timer = setTimeout(() => setStatus(orderId, next), STEP_DURATION);
    return () => clearTimeout(timer);
  }, [orderId, status, awaitingTon, setStatus]);

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

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
  const fraction = STEPS.length > 1 ? currentIndex / (STEPS.length - 1) : 0;

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="font-display text-2xl font-semibold text-balance text-foreground">
        {HEADINGS[order.status]}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
      {awaitingTon && confirmPhase === 'watching' && (
        <p className="mt-2 text-sm text-muted-foreground">Confirming payment on TON testnet…</p>
      )}
      {awaitingTon && confirmPhase === 'unconfirmed' && (
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground">
            We couldn’t confirm your payment yet — it may still be on its way.
          </p>
          <div className="mt-1 flex items-center gap-4">
            {order.payerAddress && (
              <a
                href={explorerAccountUrl(order.payerAddress)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline underline-offset-2"
              >
                View on testnet explorer ↗
              </a>
            )}
            <button
              type="button"
              onClick={retryConfirm}
              className="font-medium text-primary underline underline-offset-2"
            >
              Check again
            </button>
          </div>
        </div>
      )}
      {order.txHash && (
        <a
          href={explorerTxUrl(order.txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2"
        >
          View transaction on testnet explorer ↗
        </a>
      )}

      <ol className="relative mt-8 ml-1">
        <span
          className="absolute left-4 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-border"
          aria-hidden
        />
        <span
          className="absolute left-4 top-4 w-0.5 -translate-x-1/2 bg-primary transition-[height] duration-700 ease-emphasized"
          style={{ height: `calc((100% - 2rem) * ${fraction})` }}
          aria-hidden
        />
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li
              key={step.key}
              className="relative flex gap-4 pb-7 last:pb-0"
              aria-current={active ? 'step' : undefined}
            >
              <span
                aria-hidden
                className={[
                  'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-500',
                  done || active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                {done ? (
                  '✓'
                ) : active ? (
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary-foreground" />
                ) : (
                  i + 1
                )}
              </span>
              <div className="pt-1">
                <p
                  className={[
                    'font-medium transition-colors',
                    done || active ? 'text-foreground' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <ul className="mt-8 space-y-3 border-t border-border pt-6">
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
