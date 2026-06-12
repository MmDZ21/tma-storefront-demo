import { useEffect, useState, type ReactNode } from 'react';
import { themeParams, useSignal } from '@telegram-apps/sdk-react';
import { DEFAULT_BRAND, loadBrand, type Brand } from '@/config/brand';
import { applyBrandTheme } from './brandTheme';
import { markTelegramReady } from './initTelegram';
import { BrandContext } from './BrandContext';

/**
 * Loads + applies the active brand, keeps the document in sync with Telegram's
 * color scheme, and exposes the brand via context. The semantic token layer in
 * index.css does the actual color work; this just feeds it `--brand-*` vars and
 * a `.dark` class.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);
  // themeParams.isDark tracks Telegram's live theme (updated on `theme_changed`),
  // and stays consistent with the colors themeParams.bindCssVars() applies.
  const isDark = useSignal(themeParams.isDark) === true;

  // Load the active brand once; fall back to a neutral default on any failure.
  useEffect(() => {
    const controller = new AbortController();
    loadBrand(controller.signal)
      .then(setBrand)
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.warn('[brand] using default brand:', error);
        }
      });
    return () => controller.abort();
  }, []);

  // Apply brand variables + document title whenever the brand changes.
  useEffect(() => {
    applyBrandTheme(brand);
    document.title = brand.name;
  }, [brand]);

  // Mirror Telegram's scheme onto <html> so native controls + `dark:` match.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  // Hide Telegram's loading placeholder once we've painted.
  useEffect(() => {
    markTelegramReady();
  }, []);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}
