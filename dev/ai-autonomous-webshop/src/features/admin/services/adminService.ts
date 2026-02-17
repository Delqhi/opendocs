import api from '../../../lib/api/client';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  createProduct: async (product: any) => {
    const response = await api.post('/products', product);
    return response.data;
  },
  updateProduct: async (id: number, product: any) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
