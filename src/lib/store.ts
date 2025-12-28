import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Toast Store ---
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// --- Theme Store ---
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);

// --- Cart Store ---
export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string; // e.g. "Size L / Black"
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
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isSheetOpen: false,
      openSheet: () => set({ isSheetOpen: true }),
      closeSheet: () => set({ isSheetOpen: false }),
      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === newItem.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isSheetOpen: true,
            };
          }
          return { items: [...state.items, newItem], isSheetOpen: true };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== id) })),
      updateQuantity: (id, qty) =>
        set((state) => {
           if (qty < 1) return { items: state.items.filter((i) => i.variantId !== id) };
           return { items: state.items.map((i) => i.variantId === id ? { ...i, quantity: qty } : i) };
        }),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
);