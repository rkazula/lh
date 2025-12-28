import { UseFormRegister } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Price } from '@/components/ui/Price';
import { Spinner } from '@/components/ui/Spinner';
import { CartQuote } from '@/types/api';
import { CartItem } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface SummaryPanelProps {
  items: CartItem[];
  quote: CartQuote | null;
  isLoading: boolean;
  register: UseFormRegister<any>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function SummaryPanel({ items, quote, isLoading, register, onSubmit, isSubmitting }: SummaryPanelProps) {
  return (
    <Card className="glass border-white/20 dark:border-white/10 shadow-2xl sticky top-24">
      <CardHeader className="border-b border-border/50">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Scrollable Items */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between items-start text-sm group">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-secondary/30 rounded-md shrink-0 flex items-center justify-center text-[8px] text-muted-foreground">
                    IMG
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variantName} <span className="text-foreground">x{item.quantity}</span>
                  </p>
                </div>
              </div>
              <Price amount={item.price * item.quantity} className="text-sm" />
            </div>
          ))}
        </div>

        {/* Discount Input */}
        <div className="border-t border-border/50 pt-4 space-y-2">
          <Input
            placeholder="Discount Code"
            {...register('discountCode')}
            className="bg-background/50 text-sm h-10"
          />
        </div>

        {/* Quote Loading State */}
        {isLoading && (
            <div className="flex justify-center py-4 text-muted-foreground text-sm gap-2">
                <Spinner size="sm" /> Calculating...
            </div>
        )}

        {/* Quote Details */}
        {quote && !isLoading && (
          <div className="border-t border-border/50 pt-4 space-y-2 text-sm animate-fade-in">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal_gross / 100)}</span>
            </div>
            {quote.discount_gross > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-{formatCurrency(quote.discount_gross / 100)}</span>
                </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{quote.shipping_gross === 0 ? 'Free' : formatCurrency(quote.shipping_gross / 100)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-border/50 mt-2">
              <span>Total</span>
              <span>{formatCurrency(quote.total_gross / 100)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-right">Includes VAT ({formatCurrency(quote.tax_gross / 100)})</p>
          </div>
        )}

        <Button
          onClick={onSubmit}
          type="button" // Triggered via prop, but ideally this is inside form context
          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 mt-4"
          isLoading={isSubmitting}
          disabled={!quote || isLoading}
        >
          Pay with P24
        </Button>
      </CardContent>
    </Card>
  );
}