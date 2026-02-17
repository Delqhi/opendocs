import api from '../../../lib/api/client';

export const aiService = {
  generateDescription: async (name: string, category: string) => {
    const response = await api.post('/admin/generate-description', { name, category });
    return response.data.description;
  },
};
