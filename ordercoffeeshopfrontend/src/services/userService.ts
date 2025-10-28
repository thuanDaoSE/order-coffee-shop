import api  from './api';

export interface User {
  id: number;
  email: string;
  fullname: string;
  phone: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
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
