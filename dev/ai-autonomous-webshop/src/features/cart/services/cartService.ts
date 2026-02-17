import api from '../../../lib/api/client';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addToCart: async (productId: number, quantity: number) => {
    const response = await api.post('/cart', { product_id: productId, quantity });
    return response.data;
  },
  removeFromCart: async (productId: number) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },
};
