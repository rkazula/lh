import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export function CartSheet() {
  const { isSheetOpen, closeSheet, items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Lock body scroll when open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSheetOpen]);

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSheet}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[100] w-full max-w-md glass border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Cart
                <span className="text-sm font-normal text-muted-foreground ml-2">({items.length} items)</span>
              </h2>
              <Button variant="ghost" size="icon" onClick={closeSheet}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p>Your void is empty.</p>
                  <Button variant="outline" onClick={closeSheet}>Fill it</Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 animate-fade-in">
                    <div className="w-20 h-24 bg-secondary/50 rounded-md shrink-0" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium leading-tight">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{item.variantName}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 hover:bg-secondary rounded-md"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1 hover:bg-secondary rounded-md"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(item.price / 100 * item.quantity)}</p>
                          <button 
                            onClick={() => removeItem(item.variantId)}
                            className="text-[10px] text-destructive hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-lg">{formatCurrency(subtotal / 100)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 text-center">Shipping & taxes calculated at checkout.</p>
                <Link to="/checkout" onClick={closeSheet}>
                  <Button className="w-full" size="lg">
                    Checkout <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}