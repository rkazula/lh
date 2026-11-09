import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS } from './constants';

// --- Cart Store ---
export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Pomocnicza funkcja walidująca cenę produktu względem katalogu
const getAuthoritativePrice = (productId: string, fallbackPrice: number): number => {
  const catalogProduct = PRODUCTS.find((p) => p.id === productId);
  return catalogProduct ? catalogProduct.price : fallbackPrice;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSheetOpen: false,
      openSheet: () => set({ isSheetOpen: true }),
      closeSheet: () => set({ isSheetOpen: false }),
      addItem: (item) =>
        set((state) => {
          const validatedQuantity = Math.max(1, Math.floor(item.quantity || 1));
          const validatedPrice = getAuthoritativePrice(item.productId, item.price);
          const sanitizedItem = {
            ...item,
            price: validatedPrice,
            quantity: validatedQuantity,
          };

          const existing = state.items.find((i) => i.variantId === sanitizedItem.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === sanitizedItem.variantId
                  ? { ...i, price: validatedPrice, quantity: i.quantity + validatedQuantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, sanitizedItem] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== id) })),
      updateQuantity: (id, qty) =>
        set((state) => {
          const cleanQty = Math.floor(qty);
          if (cleanQty < 1) return { items: state.items.filter((i) => i.variantId !== id) };
          return {
            items: state.items.map((i) =>
              i.variantId === id ? { ...i, quantity: cleanQty } : i
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((acc, item) => {
          const price = getAuthoritativePrice(item.productId, item.price);
          return acc + price * item.quantity;
        }, 0),
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        // Po odczytaniu z localStorage upewniamy się, że ceny są zgodne z aktualnym katalogiem
        if (state && Array.isArray(state.items)) {
          state.items = state.items.map((item) => ({
            ...item,
            price: getAuthoritativePrice(item.productId, item.price),
            quantity: Math.max(1, Math.floor(item.quantity || 1)),
          }));
        }
      },
    }
  )
);

// --- Toast Store ---
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
