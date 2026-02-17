import { create } from 'zustand';
import { cartService } from '../services/cartService';

interface CartItemProduct {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

interface CartItem {
  id: number;
  product: CartItemProduct;
  product_id: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const items = await cartService.getCart();
      set({ items: items as CartItem[], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  addItem: async (productId, quantity) => {
    try {
      await cartService.addToCart(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to add item', error);
      throw error;
    }
  },
  removeItem: async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
      throw error;
    }
  },
}));
