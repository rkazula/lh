import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS } from '@/lib/constants';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial="pageInitial"
      animate="pageAnimate"
      exit="pageExit"
      variants={ANIMATION_VARIANTS}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
};
