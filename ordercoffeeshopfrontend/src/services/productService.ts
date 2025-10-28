import api from './api';
import type { Product, ProductRequest } from '../types/product';

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/v1/products');
  return response.data;
};

export const getProductsForAdmin = async (): Promise<Product[]> => {
  const response = await api.get('/v1/products/admin');
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get(`/v1/products/${id}`);
  return response.data;
};

export const createProduct = async (product: ProductRequest): Promise<Product> => {
  const response = await api.post('/v1/products', product);
  return response.data;
};

export const updateProduct = async (id: number, product: ProductRequest): Promise<Product> => {
  const response = await api.put(`/v1/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/v1/products/${id}`);
};

export const updateProductStatus = async (id: number, isActive: boolean): Promise<Product> => {
  const response = await api.patch(`/v1/products/${id}/status`, { isActive });
  return response.data;
};