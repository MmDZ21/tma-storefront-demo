import { useBrand } from '@/features/theming';
import { formatTokenAmount, formatUsd } from '@/shared/format';

/**
 * Renders a price as "{amount} {currency}" with an optional approximate USD hint
 * (SPEC §3.1). Currency label + TON→USD rate come from the active brand.
 */
export function Price({ priceTon, className }: { priceTon: number; className?: string }) {
  const { currency } = useBrand();
  return (
    <span className={className}>
      <span className="font-semibold text-foreground">
        {formatTokenAmount(priceTon)} {currency.label}
      </span>
      {currency.usdRate !== undefined && (
        <span className="ml-1.5 whitespace-nowrap text-muted-foreground">
          ≈ {formatUsd(priceTon * currency.usdRate)}
        </span>
      )}
    </span>
  );
}
