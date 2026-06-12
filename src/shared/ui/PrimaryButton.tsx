import { readableTextColor, useBrand } from '@/features/theming';
import { useMainButton, useTelegram } from '@/features/telegram';

interface PrimaryButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * The single primary CTA per screen. Inside Telegram it drives the native
 * MainButton (SPEC §3.6/§5); elsewhere (dev preview, tests) it renders an
 * equivalent in-app button so the funnel never dead-ends.
 */
export function PrimaryButton({ text, onClick, disabled = false }: PrimaryButtonProps) {
  const { nativeControls } = useTelegram();
  const brand = useBrand();

  useMainButton({
    text,
    onClick,
    enabled: !disabled,
    active: nativeControls,
    backgroundColor: brand.accentColor,
    textColor: readableTextColor(brand.accentColor),
  });

  if (nativeControls) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="h-12 w-full rounded-control bg-primary text-base font-semibold text-primary-foreground shadow-card transition-transform duration-150 ease-spring active:scale-[0.99] disabled:opacity-50"
        >
          {text}
        </button>
      </div>
    </div>
  );
}
