import api from '../../../lib/api/client';

export const trendService = {
  getTrends: async () => {
    const response = await api.get('/admin/trends');
    return response.data;
  },
};
