import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  siteId: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addToCart: (item: { id: string; name: string; price: string; image: string; siteId: string }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => string;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addToCart: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.name === item.name && i.siteId === item.siteId
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.name === item.name && i.siteId === item.siteId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
          isOpen: true,
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: `${item.name}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            siteId: item.siteId,
          },
        ],
        isOpen: true,
      };
    });
  },

  removeFromCart: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => {
    set({ items: [], isOpen: false });
  },

  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  closeCart: () => {
    set({ isOpen: false });
  },

  getCartCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  getCartTotal: () => {
    const total = get().items.reduce((sum, item) => {
      const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return sum + priceNum * item.quantity;
    }, 0);
    return total.toFixed(2);
  },
}));
