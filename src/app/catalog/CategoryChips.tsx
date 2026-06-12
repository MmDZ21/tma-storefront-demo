interface CategoryChipsProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

/** Horizontally-scrollable filter chips (SPEC §3.1). */
export function CategoryChips({ categories, active, onSelect }: CategoryChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="Product categories"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((category) => {
        const selected = category === active;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              onSelect(category);
            }}
            className={[
              'shrink-0 rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
              selected
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground',
            ].join(' ')}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
