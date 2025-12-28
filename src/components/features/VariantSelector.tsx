import { Variant } from '@/types/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  // Group by Size
  const sizes = Array.from(new Set(variants.map((v) => v.size))).sort((a, b) => {
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    return order.indexOf(a) - order.indexOf(b);
  });

  // Determine available colors for selected size (if any)
  // Logic: User selects Size first, then Color. 
  // OR: We just list all combinations.
  // "Apple style" usually implies smart selection. Let's do a simple grid of all variants if small number, 
  // or filtered. Given requirement "Simple but wow", let's do a split view: Size then Color.
  
  // Actually, keeping it simple: List of buttons is okay, but splitting Size/Color is better UX.
  
  // Let's assume user picks Size first.
  const selectedSize = selectedVariant?.size;

  const handleSizeClick = (size: string) => {
    // Find first available variant with this size
    const variant = variants.find(v => v.size === size);
    if (variant) onSelect(variant);
  };

  const handleColorClick = (color: string) => {
    if (!selectedSize) return;
    const variant = variants.find(v => v.size === selectedSize && v.color === color);
    if (variant) onSelect(variant);
  };

  return (
    <div className="space-y-6">
      {/* Sizes */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Size</span>
            <span className="text-xs text-primary cursor-pointer hover:underline">Size Guide</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {sizes.map((size) => {
             const isActive = selectedSize === size;
             const isAvailable = variants.some(v => v.size === size && v.active);
             
             return (
               <button
                 key={size}
                 onClick={() => handleSizeClick(size)}
                 disabled={!isAvailable}
                 className={cn(
                   "h-12 w-12 rounded-full border text-sm font-medium transition-all duration-200 flex items-center justify-center",
                   isActive 
                     ? "bg-foreground text-background border-foreground shadow-lg scale-105" 
                     : "bg-transparent border-input hover:border-foreground/50 text-foreground",
                   !isAvailable && "opacity-50 cursor-not-allowed decoration-slice line-through"
                 )}
               >
                 {size}
               </button>
             );
          })}
        </div>
      </div>

      {/* Colors (only if size selected) */}
      <div className={cn("space-y-3 transition-opacity duration-300", !selectedSize && "opacity-50 pointer-events-none")}>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Color</span>
        <div className="flex flex-wrap gap-3">
            {selectedSize ? (
                // Show colors for selected size
                variants
                .filter(v => v.size === selectedSize)
                .map(v => (
                    <button
                        key={v.id}
                        onClick={() => onSelect(v)}
                        className={cn(
                            "px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200",
                            selectedVariant?.id === v.id
                            ? "bg-foreground text-background border-foreground shadow-md"
                            : "bg-transparent border-input hover:border-foreground/50",
                            !v.active && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {v.color}
                        {!v.active && " (Out of Stock)"}
                    </button>
                ))
            ) : (
                <span className="text-sm text-muted-foreground italic">Select a size first</span>
            )}
        </div>
      </div>
      
      {/* Stock Status */}
      {selectedVariant && (
         <div className="flex items-center gap-2 pt-2 animate-fade-in">
            <Badge variant={selectedVariant.active ? 'success' : 'destructive'}>
                {selectedVariant.active ? 'In Stock' : 'Out of Stock'}
            </Badge>
            <span className="text-xs text-muted-foreground">
                SKU: {selectedVariant.sku}
            </span>
         </div>
      )}
    </div>
  );
}