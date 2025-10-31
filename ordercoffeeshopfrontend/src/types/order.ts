import type { User } from './user';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';

export interface OrderItem {
  id: number;
  productName: string;
  productVariantId: number;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryMethod: 'DELIVERY' | 'PICKUP';
  address?: string; // Or a more complex Address object
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}