import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useCartStore, useToastStore } from '@/lib/store';
import { Variant } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Price } from '@/components/ui/Price';
import { SEO } from '@/components/layout/SEO';
import { VariantSelector } from '@/components/features/VariantSelector';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>(); 
  const { addItem, openSheet } = useCartStore();
  const { addToast } = useToastStore();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id!),
    enabled: !!id,
  });

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      variantName: `${selectedVariant.size} / ${selectedVariant.color}`,
      price: product.price_gross + (selectedVariant.price_delta_gross || 0),
      quantity: 1,
    });
    
    addToast(`Added ${product.name} to cart`, 'success');
    openSheet();
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner /></div>;
  if (error || !product) return <div className="h-[60vh] flex items-center justify-center text-muted-foreground">Product not found.</div>;

  const currentPrice = product.price_gross + (selectedVariant?.price_delta_gross || 0);

  return (
    <>
      <SEO title={product.name} description={product.description} />
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-secondary/10 rounded-3xl aspect-[4/5] relative overflow-hidden border border-white/5 shadow-2xl group"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
             <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 text-6xl font-black rotate-[-45deg] group-hover:scale-110 transition-transform duration-700">
               IMAGE
             </div>
             {/* Fake Pagination Dots */}
             <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-foreground" />
                <div className="w-2 h-2 rounded-full bg-foreground/20" />
                <div className="w-2 h-2 rounded-full bg-foreground/20" />
             </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex flex-col justify-center space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
              <Price amount={currentPrice} className="text-3xl text-primary" />
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              {product.description}
            </p>

            <div className="py-6 border-t border-b border-border/50">
               <VariantSelector 
                 variants={product.variant || []} 
                 selectedVariant={selectedVariant}
                 onSelect={setSelectedVariant}
               />
            </div>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1 text-lg h-14 rounded-xl shadow-xl shadow-primary/20"
                onClick={handleAddToCart}
                disabled={!selectedVariant || !selectedVariant.active}
              >
                {!selectedVariant ? 'Select Size & Color' : selectedVariant.active ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Free shipping on orders over 300 PLN. 30-day return window.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}