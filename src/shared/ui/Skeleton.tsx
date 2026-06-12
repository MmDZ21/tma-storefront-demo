/** A shimmering placeholder block. Sized by the caller via `className`. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={['skeleton', className].filter(Boolean).join(' ')} aria-hidden="true" />;
}
