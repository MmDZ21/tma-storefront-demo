import type { CSSProperties } from 'react';
import type { Product } from '@/config/products';
import { Price } from '@/shared/ui/Price';
import { ArrowRightIcon } from '@/shared/ui/Icons';

interface ProductCardProps {
  product: Product;
  style?: CSSProperties;
}

/** A catalog tile: image, optional badge, name, category, and price. */
export function ProductCard({ product, style }: ProductCardProps) {
  return (
    <article
      className="animate-rise group flex h-full flex-col overflow-hidden rounded-[1.2rem] border border-border bg-card shadow-card transition-transform duration-200 ease-emphasized active:scale-[0.985]"
      style={style}
    >
      <div className="relative aspect-[1/1.08] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-emphasized group-hover:scale-[1.025] group-active:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-pill border border-white/20 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-card">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-card-foreground">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {product.category}
        </p>
        {/* mt-auto pins the price to the bottom so prices align across a row regardless of
            how many lines the title wraps to (cards are equal-height via the grid). */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price priceTon={product.priceTon} className="text-[13px] tracking-[-0.01em]" />
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
