import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types/api';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  // Simple check for min price if variants exist
  const basePrice = product.price_gross;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/product/${product.id}`} className="group block h-full">
        <Card className="h-full border-transparent bg-secondary/10 hover:bg-secondary/20 transition-all duration-300 overflow-hidden group-hover:shadow-xl dark:shadow-none">
          <div className="aspect-[4/5] bg-secondary/30 relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
             <span className="text-muted-foreground font-mono text-xs opacity-50 group-hover:scale-110 transition-transform duration-500">
               {product.slug.toUpperCase()}
             </span>
          </div>
          
          <CardHeader className="p-4">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-base font-medium leading-tight group-hover:text-primary transition-colors">
                {product.name}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <span className="font-semibold text-lg">{formatCurrency(basePrice / 100)}</span>
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
              Details
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}