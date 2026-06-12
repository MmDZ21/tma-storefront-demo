import { z } from 'zod';

/**
 * Brand configuration — the heart of the personalization layer (SPEC §3.8).
 * Every brand-specific value lives in /public/config/brand.json; swapping that
 * one file re-skins the entire app. The schema is the typed, validated contract
 * for that file, so a malformed re-skin fails loudly instead of silently.
 */

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'must be a hex color, e.g. "#9a5b34"');

export const BrandSchema = z.object({
  /** Shop name, shown in the header and used as the document title. */
  name: z.string().min(1),
  /** One-line greeting on the storefront. */
  welcomeLine: z.string().min(1),
  /** Logo as an emoji (zero-asset re-skins) or an image url/path. */
  logo: z
    .object({
      emoji: z.string().min(1).optional(),
      url: z.string().min(1).optional(),
    })
    .refine((logo) => Boolean(logo.emoji ?? logo.url), {
      message: 'logo must define an "emoji" or a "url"',
    }),
  /** Accent color; drives the primary button and highlights. */
  accentColor: hexColor,
  /** Currency display + optional static TON→USD rate for the price hint. */
  currency: z.object({
    label: z.string().min(1).default('TON'),
    usdRate: z.number().positive().optional(),
  }),
  /** Absolute path to this brand's products file (loaded by the catalog). */
  productsFile: z.string().regex(/^\//, 'must be an absolute path starting with "/"'),
});

export type Brand = z.infer<typeof BrandSchema>;

/** Validate raw JSON against the brand schema. Throws `ZodError` if invalid. */
export function parseBrand(raw: unknown): Brand {
  return BrandSchema.parse(raw);
}

/**
 * Neutral fallback used when brand.json is missing or invalid, so the app still
 * renders rather than white-screening during a demo.
 */
export const DEFAULT_BRAND: Brand = {
  name: 'TON Storefront',
  welcomeLine: 'A Telegram Mini App storefront demo.',
  logo: { emoji: '🛍️' },
  accentColor: '#0098ea',
  currency: { label: 'TON' },
  productsFile: '/config/products.coffee.json',
};

/** Fetch and validate the active brand from /public/config/brand.json. */
export async function loadBrand(signal?: AbortSignal): Promise<Brand> {
  const res = await fetch('/config/brand.json', signal ? { signal } : undefined);
  if (!res.ok) {
    throw new Error(`Failed to load brand.json: ${res.status} ${res.statusText}`);
  }
  const raw: unknown = await res.json();
  return parseBrand(raw);
}
