import { z } from 'zod';

/**
 * Products configuration — validated exactly like brand.json (SPEC §3.1, §6).
 * The active brand points at its own products file via `brand.productsFile`, so
 * a re-skin swaps the catalog along with the branding.
 */

export const ProductSchema = z.object({
  /** Stable id — also used as the cart key and image filename. */
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  /** Price in TON (testnet). */
  priceTon: z.number().positive(),
  /**
   * Local absolute path to a bundled image. Hotlinked/remote URLs are rejected
   * so the demo has no external image dependency (no `http(s)://`).
   */
  image: z.string().regex(/^\//, 'must be a local absolute path (no hotlinking)'),
  /** Category used by the filter chips. */
  category: z.string().min(1),
  /** Optional merchandising badge, e.g. "Best seller". */
  badge: z.string().min(1).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductsFileSchema = z.object({
  products: z.array(ProductSchema).min(1),
});

/** Validate raw JSON and return the product list. Throws `ZodError` if invalid. */
export function parseProducts(raw: unknown): Product[] {
  return ProductsFileSchema.parse(raw).products;
}

/** Unique categories in first-seen order (the catalog prepends an "All" chip). */
export function deriveCategories(products: readonly Product[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const { category } of products) {
    if (!seen.has(category)) {
      seen.add(category);
      categories.push(category);
    }
  }
  return categories;
}

/** Fetch and validate a brand's products file (path from `brand.productsFile`). */
export async function loadProducts(path: string, signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(path, signal ? { signal } : undefined);
  if (!res.ok) {
    throw new Error(`Failed to load products (${path}): ${res.status} ${res.statusText}`);
  }
  const raw: unknown = await res.json();
  return parseProducts(raw);
}
