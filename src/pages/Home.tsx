import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/layout/SEO';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <>
      <SEO title="Home" />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden">
           {/* Background Elements */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse duration-[5000ms]" />
           
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="space-y-6 max-w-4xl px-4 z-10"
           >
             <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-foreground/80 mb-4">
                Collection 2026
             </span>
             <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40 pb-4">
               Wear Your Silence.
             </h1>
             <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto font-light leading-relaxed">
               Minimalist streetwear for the introverted soul. <br/>
               High-quality materials, zero noise.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
               <Link to="/catalog">
                 <Button size="lg" className="rounded-full px-10 h-14 text-base font-semibold shadow-xl shadow-primary/20">
                   Shop Collection
                 </Button>
               </Link>
               <Link to="/about">
                 <Button variant="glass" size="lg" className="rounded-full px-10 h-14 text-base font-medium">
                   Our Philosophy
                 </Button>
               </Link>
             </div>
           </motion.div>
        </section>

        {/* Bestsellers Teaser */}
        <section className="py-24 container mx-auto px-4">
           <div className="flex justify-between items-end mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
              <Link to="/catalog" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                View All
              </Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Skeleton Placeholders for visuals */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-secondary/20 rounded-2xl animate-pulse relative overflow-hidden group">
                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-bold text-4xl transform -rotate-12 group-hover:scale-110 transition-transform">
                      SOLD OUT
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Brand Statement */}
        <section className="py-32 bg-foreground text-background relative overflow-hidden">
           <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
                "I hate people."
              </h2>
              <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto">
                Just kidding. We love people. We just prefer them from a distance, 
                wearing really good clothes. Local Haters is about comfort in your own zone.
              </p>
           </div>
        </section>
      </div>
    </>
  );
}