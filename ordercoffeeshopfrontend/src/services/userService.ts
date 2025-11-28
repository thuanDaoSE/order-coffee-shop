import api  from './api';
import type { Page } from '../types/common';
import type { User } from '../types/user';

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

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/v1/users/me');
  return response.data;
};

export const updateUserStore = async (storeId: number): Promise<User> => {
  const response = await api.put('/v1/users/me/store', { storeId });
  return response.data;
};

// Use Partial<User> to allow updating only some fields of the profile
export const updateProfile = async (profile: Partial<User>): Promise<User> => {
  const response = await api.put('/v1/users/me', profile);
  return response.data;
};
