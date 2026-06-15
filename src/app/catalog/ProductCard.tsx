import type { CSSProperties } from 'react';
import type { Product } from '@/config/products';
import { Price } from '@/shared/ui/Price';

interface ProductCardProps {
  product: Product;
  style?: CSSProperties;
}

/** A catalog tile: image, optional badge, name, category, and price. */
export function ProductCard({ product, style }: ProductCardProps) {
  return (
    <article
      className="animate-rise group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-card"
      style={style}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-emphasized group-active:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-pill bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
          {product.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{product.category}</p>
        {/* mt-auto pins the price to the bottom so prices align across a row regardless of
            how many lines the title wraps to (cards are equal-height via the grid). */}
        <Price priceTon={product.priceTon} className="mt-auto pt-2 text-sm" />
      </div>
    </article>
  );
}
