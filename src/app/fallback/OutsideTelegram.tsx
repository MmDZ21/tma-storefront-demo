import { QRCodeSVG } from 'qrcode.react';
import { useBrand } from '@/features/theming';
import { APP } from '@/config/app';

/**
 * Shown when the app is opened outside Telegram (SPEC §3.9). A slim, branded page
 * that points the visitor to the bot via a QR code and a deep link. Lazy-loaded
 * in main.tsx, so the QR dependency never ships to in-Telegram users.
 */
export function OutsideTelegram() {
  const brand = useBrand();

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-primary/12">
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl" aria-hidden>
            {brand.logoEmoji ?? '🛍️'}
          </span>
        )}
      </span>

      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{brand.name}</h1>
        <p className="mt-2 text-muted-foreground">This app lives inside Telegram.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan the code, or open it on a device with Telegram installed.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <QRCodeSVG value={APP.botUrl} size={184} marginSize={1} />
      </div>

      <a
        href={APP.botUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 items-center justify-center rounded-control bg-primary px-6 font-semibold text-primary-foreground shadow-card transition-transform duration-150 ease-spring active:scale-[0.98]"
      >
        Open in Telegram
      </a>
    </main>
  );
}
