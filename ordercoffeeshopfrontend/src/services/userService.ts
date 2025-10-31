import api  from './api';
import type { Page } from '../types/common';
import type { Product } from '../types/product';

export interface User {
  id: number;
  email: string;
  fullname: string;
  phone: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

export const userService = {
  getUsers: async (search: string, page: number, size: number): Promise<Page<User>> => {
    const response = await api.get('/v1/users', {
      params: { search, page, size },
    });
    return response.data;
  },

  updateUserRole: async (userId: number, role: User['role']): Promise<User> => {
    const response = await api.put(`/v1/users/${userId}/role`, { role });
    return response.data;
  },
};

export const updateProductStatus = async (id: number, isActive: boolean): Promise<Product> => {
  const response = await api.patch(`/v1/products/${id}/status`, { isActive });
  return response.data;
};

export const getProfile = async (): Promise<any> => {
  const response = await api.get('/v1/users/me');
  return response.data;
};

export const updateProfile = async (profile: any): Promise<any> => {
  const response = await api.put('/v1/users/me', profile);
  return response.data;
};
