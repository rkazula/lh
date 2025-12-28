import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartSheet } from '@/components/features/CartSheet';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_VARIANTS } from '@/lib/constants';

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSheet />
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="pageInitial"
            animate="pageAnimate"
            exit="pageExit"
            variants={ANIMATION_VARIANTS}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full flex-grow flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
