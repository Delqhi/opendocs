import api from '../../../lib/api/client';

export interface CatalogProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sustainability_score: number;
  category: string;
  stock: number;
}

export const catalogService = {
  getProducts: async (): Promise<CatalogProduct[]> => {
    const response = await api.get('/products');
    return response.data;
  },
  getProduct: async (id: string): Promise<CatalogProduct> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};
