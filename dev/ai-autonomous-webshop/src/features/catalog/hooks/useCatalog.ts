import { create } from 'zustand';
import { catalogService, type CatalogProduct } from '../services/catalogService';
import { searchService } from '../services/searchService';

interface CatalogState {
  products: CatalogProduct[];
  productsPromise: Promise<CatalogProduct[]> | null;
  isLoading: boolean;
  error: string | null;
  initProducts: () => Promise<CatalogProduct[]>;
  fetchProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
}

let cachedPromise: Promise<CatalogProduct[]> | null = null;

export const useCatalogStore = create<CatalogState>((set) => ({
  products: [],
  productsPromise: null,
  isLoading: false,
  error: null,

  initProducts: () => {
    if (cachedPromise) return cachedPromise;
    cachedPromise = catalogService.getProducts().then((products) => {
      set({ products, isLoading: false, error: null });
      return products;
    });
    set({ productsPromise: cachedPromise, isLoading: true });
    return cachedPromise;
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      cachedPromise = null;
      const products = await catalogService.getProducts();
      set({ products, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const products = await searchService.search(query);
      set({ products: products as CatalogProduct[], isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },
}));
