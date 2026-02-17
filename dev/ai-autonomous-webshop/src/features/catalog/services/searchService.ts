import api from '../../../lib/api/client';

export const searchService = {
  search: async (query: string) => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
