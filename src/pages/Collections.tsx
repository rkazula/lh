import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { COLLECTIONS } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

export default function Collections() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Kolekcje</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Odkryj nasze starannie wyselekcjonowane kolekcje
          </p>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COLLECTIONS.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/catalog?collection=${collection.id}`}
                className="group block relative aspect-[4/3] rounded-3xl overflow-hidden bg-secondary"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{collection.name}</h2>
                  <p className="text-muted-foreground mb-4">{collection.description}</p>
                  <span className="inline-flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                    Przeglądaj kolekcję
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Nie możesz się zdecydować? Przeglądaj wszystkie produkty
          </p>
          <Link to="/catalog">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Zobacz cały sklep
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
