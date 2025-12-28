import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/types/api';
import { ProductCard } from '@/components/features/ProductCard';
import { SEO } from '@/components/layout/SEO';
import { Input } from '@/components/ui/Input';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

type SortOption = 'price-asc' | 'price-desc' | 'name-asc';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['catalog'],
    queryFn: api.getCatalog,
  });

  // Extract available sizes from all products
  const availableSizes = useMemo(() => {
    if (!products) return [];
    const sizes = new Set<string>();
    products.forEach(p => p.variant?.forEach(v => v.active && sizes.add(v.size)));
    return Array.from(sizes).sort((a, b) => {
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        return order.indexOf(a) - order.indexOf(b);
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = products.filter((p: Product) => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (selectedSize) {
        result = result.filter(p => p.variant?.some(v => v.size === selectedSize && v.active));
    }

    // Sorting
    result.sort((a, b) => {
        if (sort === 'price-asc') return a.price_gross - b.price_gross;
        if (sort === 'price-desc') return b.price_gross - a.price_gross;
        return a.name.localeCompare(b.name);
    });

    return result;
  }, [products, search, selectedSize, sort]);

  return (
    <>
      <SEO title="Catalog" description="Browse our full collection of silent apparel." />
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-border/50">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Catalog</h1>
            <p className="text-muted-foreground text-lg">Find your uniform.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background/50 backdrop-blur-sm"
                />
             </div>
             <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-secondary' : ''}>
                <Filter className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
            {showFilters && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-6 bg-secondary/20 rounded-xl space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="space-y-3">
                                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Size</span>
                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => setSelectedSize(null)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors border ${!selectedSize ? 'bg-foreground text-background border-foreground' : 'bg-transparent border-input hover:border-foreground/50'}`}
                                    >
                                        All
                                    </button>
                                    {availableSizes.map(size => (
                                        <button 
                                            key={size}
                                            onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors border ${selectedSize === size ? 'bg-foreground text-background border-foreground' : 'bg-transparent border-input hover:border-foreground/50'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Sort By</span>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Name (A-Z)', value: 'name-asc' },
                                        { label: 'Price: Low to High', value: 'price-asc' },
                                        { label: 'Price: High to Low', value: 'price-desc' },
                                    ].map((option) => (
                                        <button 
                                            key={option.value}
                                            onClick={() => setSort(option.value as SortOption)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors border ${sort === option.value ? 'bg-foreground text-background border-foreground' : 'bg-transparent border-input hover:border-foreground/50'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-secondary/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <p>Failed to load the void. Try refreshing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
                {products?.map((product: Product, index: number) => (
                    <ProductCard key={product.id} product={product} index={index} />
                ))}
            </AnimatePresence>
          </div>
        )}
        
        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-xl">
            <p>No products found matching your vibe.</p>
            <Button variant="link" onClick={() => { setSearch(''); setSelectedSize(null); }}>Clear filters</Button>
          </div>
        )}
      </div>
    </>
  );
}