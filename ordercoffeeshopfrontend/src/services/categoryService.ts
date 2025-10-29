import api from './api';

export const createCategory = async (name: string): Promise<any> => {
  const response = await api.post('/v1/categories', { name });
  return response.data;
};
