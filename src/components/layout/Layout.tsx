import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { AnimatePresence } from 'framer-motion';

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      {/* 
        Padding top allows content to start below fixed header. 
        Min-height ensures footer stays at bottom.
      */}
      <main className="flex-grow flex flex-col pt-20">
        <AnimatePresence mode="wait">
          {/* We use a key based on pathname to trigger animations on route change */}
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}