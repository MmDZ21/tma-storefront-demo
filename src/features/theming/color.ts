/**
 * Color utilities for the theming layer.
 *
 * The personalization feature (SPEC §3.8) lets anyone drop an arbitrary accent
 * color into brand.json. To keep the primary button readable for *any* such
 * color, we pick the foreground (black or white) with the higher WCAG contrast
 * ratio against the accent — a foolproof default that never yields an
 * unreadable label, no matter what color a re-skin uses.
 */

/** Expand a CSS hex color to its six lowercase hex digits, or throw. */
function hexDigits(input: string): string {
  const match = /^#(?<digits>[0-9a-f]{3}|[0-9a-f]{6})$/.exec(input.trim().toLowerCase());
  const digits = match?.groups?.['digits'];
  if (!digits) {
    throw new Error(`Invalid hex color: ${input}`);
  }
  return digits.length === 3
    ? digits
        .split('')
        .map((c) => c + c)
        .join('')
    : digits;
}

/** sRGB channel (0–255) → linear-light value (0–1), per WCAG 2.x. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance (0 = black, 1 = white) of a hex color. */
export function relativeLuminance(hex: string): number {
  const digits = hexDigits(hex);
  const r = parseInt(digits.slice(0, 2), 16);
  const g = parseInt(digits.slice(2, 4), 16);
  const b = parseInt(digits.slice(4, 6), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Returns '#000000' or '#ffffff' — whichever has the higher WCAG contrast ratio
 * against `background`. Guarantees a readable foreground for any brand accent.
 */
export function readableTextColor(background: string): '#000000' | '#ffffff' {
  const l = relativeLuminance(background);
  const contrastWithBlack = (l + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (l + 0.05);
  return contrastWithBlack >= contrastWithWhite ? '#000000' : '#ffffff';
}
