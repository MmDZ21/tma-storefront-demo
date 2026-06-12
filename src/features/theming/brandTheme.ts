import type { Brand } from '@/config/brand';
import { readableTextColor } from './color';

/**
 * Translate a validated brand into the `--brand-*` CSS custom properties read by
 * the semantic token layer in index.css. The accent foreground is computed for
 * guaranteed readability (see `readableTextColor`), so any re-skin color works.
 */
export function buildBrandThemeVars(brand: Brand): Record<string, string> {
  return {
    '--brand-accent': brand.accentColor,
    '--brand-accent-foreground': readableTextColor(brand.accentColor),
  };
}

/** Write the brand variables onto an element (defaults to the document root). */
export function applyBrandTheme(
  brand: Brand,
  root: HTMLElement = document.documentElement,
): void {
  for (const [name, value] of Object.entries(buildBrandThemeVars(brand))) {
    root.style.setProperty(name, value);
  }
}
