// src/types/product.ts

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
