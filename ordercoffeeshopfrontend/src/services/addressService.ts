import api from './api';
import type { Address } from '../types/address';

export const addressService = {
  getUserAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/v1/addresses');
    return response.data;
  },

  createAddress: async (address: Omit<Address, 'id'>): Promise<Address> => {
    const response = await api.post('/v1/addresses', address);
    return response.data;
  },

  updateAddress: async (id: number, address: Partial<Address>): Promise<Address> => {
    const response = await api.put(`/v1/addresses/${id}`, address);
    return response.data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/v1/addresses/${id}`);
  },

  setDefaultAddress: async (id: number): Promise<Address> => {
    const response = await api.put(`/v1/addresses/${id}/default`);
    return response.data;
  },

  getDefaultAddress: async (): Promise<Address> => {
    const response = await api.get('/v1/addresses/default');
    return response.data;
  }
};