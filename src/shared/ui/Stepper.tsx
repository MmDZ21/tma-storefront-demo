import { haptics } from '@/features/telegram';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** Quantity stepper with selection haptics (SPEC §3.2). */
export function Stepper({ value, onChange, min = 1, max = 99 }: StepperProps) {
  const decrement = () => {
    if (value > min) {
      haptics.selection();
      onChange(value - 1);
    }
  };
  const increment = () => {
    if (value < max) {
      haptics.selection();
      onChange(value + 1);
    }
  };

  return (
    <div className="inline-flex items-center rounded-control border border-border bg-card">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrement}
        disabled={value <= min}
        className="grid h-11 w-11 place-items-center text-xl text-card-foreground transition-colors active:bg-muted disabled:opacity-30"
      >
        −
      </button>
      <span aria-live="polite" className="w-10 text-center text-base font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={increment}
        disabled={value >= max}
        className="grid h-11 w-11 place-items-center text-xl text-card-foreground transition-colors active:bg-muted disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
