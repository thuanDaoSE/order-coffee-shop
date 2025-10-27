// src/types/product.ts

export interface ProductVariantRequest {
  sku: string;
  size: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
}

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

export interface ProductRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  isActive?: boolean;
  variants?: ProductVariantRequest[];
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
