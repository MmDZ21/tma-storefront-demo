import { TonPayProvider } from '@/features/ton-pay/TonPayProvider';
import { Cart } from './Cart';

/**
 * Cart route wrapper. Mounting TON Connect only here keeps `@tonconnect/ui-react` out
 * of the catalog/product first-paint bundle — it ships in the lazily-loaded cart chunk
 * (SPEC §7 budget). Default export for `React.lazy`.
 */
export default function CartRoute() {
  return (
    <TonPayProvider>
      <Cart />
    </TonPayProvider>
  );
}
