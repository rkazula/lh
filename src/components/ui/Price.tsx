import { formatCurrency, cn } from '@/lib/utils';

interface PriceProps {
  amount: number; // in cents
  className?: string;
  originalAmount?: number; // for strike-through
}

export function Price({ amount, className, originalAmount }: PriceProps) {
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="font-semibold tracking-tight">
        {formatCurrency(amount / 100)}
      </span>
      {originalAmount && originalAmount > amount && (
        <span className="text-muted-foreground line-through text-sm">
          {formatCurrency(originalAmount / 100)}
        </span>
      )}
    </div>
  );
}