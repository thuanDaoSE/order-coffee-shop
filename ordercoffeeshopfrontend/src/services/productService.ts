// src/services/productService.ts
import api from './authService';

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  stockQuantity: number;
  size: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
}
export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  category: Category;
  variants: ProductVariant[];
}

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

