import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout'; // Direct import for layout usually fine
import { Spinner } from '@/components/ui/Spinner';
import { Toaster } from '@/components/ui/Toast';
import { CartSheet } from '@/components/features/CartSheet';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const Discounts = lazy(() => import('./pages/admin/Discounts'));
const Settings = lazy(() => import('./pages/admin/Settings'));

function App() {
  return (
    <>
      <Suspense 
        fallback={
          <div className="h-screen w-full flex items-center justify-center bg-background">
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<OrderSuccess />} />
            <Route path="404" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Navigate to="/admin/inventory" replace />} />
             <Route path="inventory" element={<Inventory />} />
             <Route path="discounts" element={<Discounts />} />
             <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
      <CartSheet />
    </>
  );
}

export default App;