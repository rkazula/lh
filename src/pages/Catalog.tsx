import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/features/ProductCard';
import { PRODUCTS, CATEGORIES, COLLECTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') || '';
  const categoryParam = searchParams.get('category') || '';
  const queryParam = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      return categoryParam;
    }
    return 'Wszystkie';
  });

  const [selectedCollection, setSelectedCollection] = useState<string>(collectionParam);
  const [onlyNew, setOnlyNew] = useState<boolean>(categoryParam === 'new');
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  useEffect(() => {
    if (collectionParam) {
      setSelectedCollection(collectionParam);
    }
    if (categoryParam) {
      if (categoryParam === 'new') {
        setOnlyNew(true);
        setSelectedCategory('Wszystkie');
      } else if (CATEGORIES.includes(categoryParam)) {
        setSelectedCategory(categoryParam);
        setOnlyNew(false);
      }
    }
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [collectionParam, categoryParam, queryParam]);

  const activeCollectionName = useMemo(() => {
    if (!selectedCollection) return null;
    const col = COLLECTIONS.find((c) => c.id === selectedCollection);
    return col ? col.name : selectedCollection;
  }, [selectedCollection]);

  const filteredProducts = useMemo(() => {
    let products = [...PRODUCTS];

    // Filter by collection
    if (selectedCollection) {
      products = products.filter((p) => p.collectionId === selectedCollection);
    }

    // Filter by 'new' badge
    if (onlyNew) {
      products = products.filter(
        (p) => p.badge && (p.badge.toLowerCase().includes('nowo') || p.badge.toLowerCase().includes('nowa'))
      );
    }

    // Filter by category
    if (selectedCategory !== 'Wszystkie') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    }

    return products;
  }, [selectedCollection, onlyNew, selectedCategory, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory('Wszystkie');
    setSelectedCollection('');
    setOnlyNew(false);
    setSearchQuery('');
    setSearchParams({});
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setOnlyNew(false);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'Wszystkie') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {activeCollectionName ? `Kolekcja: ${activeCollectionName}` : 'Sklep'}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {activeCollectionName
              ? COLLECTIONS.find((c) => c.id === selectedCollection)?.description
              : 'Odkryj naszą kolekcję minimalistycznego streetwearu'}
          </p>
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj produktów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Wyczyść wyszukiwanie"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 rounded-xl"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filtry
          </Button>
        </motion.div>

        {/* Active Filter Chips */}
        {(selectedCollection || onlyNew || selectedCategory !== 'Wszystkie' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground mr-1">Aktywne filtry:</span>
            {selectedCollection && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Kolekcja: {activeCollectionName}
                <button
                  onClick={() => {
                    setSelectedCollection('');
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('collection');
                    setSearchParams(newParams);
                  }}
                  className="hover:text-destructive"
                  aria-label="Usuń filtr kolekcji"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {onlyNew && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Nowości
                <button
                  onClick={() => {
                    setOnlyNew(false);
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                  }}
                  className="hover:text-destructive"
                  aria-label="Usuń filtr nowości"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedCategory !== 'Wszystkie' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">
                Kategoria: {selectedCategory}
                <button
                  onClick={() => handleCategorySelect('Wszystkie')}
                  className="hover:text-destructive"
                  aria-label="Usuń filtr kategorii"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">
                Szukaj: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-destructive"
                  aria-label="Usuń frazę wyszukiwania"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
            >
              Wyczyść wszystko
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 p-6 rounded-2xl bg-secondary/30 border border-border"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Kategoria
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                        selectedCategory === category && !onlyNew
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections Filter */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Kolekcja
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCollection('');
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('collection');
                      setSearchParams(newParams);
                    }}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      !selectedCollection
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    Wszystkie kolekcje
                  </button>
                  {COLLECTIONS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        setSelectedCollection(col.id);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('collection', col.id);
                        setSearchParams(newParams);
                      }}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                        selectedCollection === col.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      )}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Sortuj
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'default' as const, label: 'Domyślnie' },
                    { value: 'price-asc' as const, label: 'Cena: rosnąco' },
                    { value: 'price-desc' as const, label: 'Cena: malejąco' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                        sortBy === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Pills (Mobile-friendly) */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide md:hidden">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === category && !onlyNew
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'produkt' : 'produktów'}
        </p>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/20 rounded-2xl p-8 border border-border/50">
            <p className="text-muted-foreground text-lg mb-4">
              Nie znaleziono produktów dla wybranych kryteriów
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
