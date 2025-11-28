import api from './api';
import type { Store } from '../types/store';

export const getAllStores = async (): Promise<Store[]> => {
  const response = await api.get('/stores');
  return response.data;
};
