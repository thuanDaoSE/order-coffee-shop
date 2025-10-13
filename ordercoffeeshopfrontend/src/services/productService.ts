// src/services/productService.ts
import api from './authService';
import type { Product } from '../types/product';

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/v1/products');
  console.log("get products response: ",response.data);
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get(`/v1/products/${id}`);
  console.log("get product by id response: ",response.data);
  return response.data;
};
