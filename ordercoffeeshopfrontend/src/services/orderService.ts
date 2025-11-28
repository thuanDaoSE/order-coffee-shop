import type { CartItem } from '../types/cart';
import api from './api';
import type { Order } from '../types/order';
import type { Page } from '../types/common';

interface OrderItemPayload {
  productVariantId: number;
  quantity: number;
  price: number;
}

export const createOrder = async (cartItems: CartItem[], couponCode: string, deliveryMethod: string, addressId: string | number | null, storeId?: number | null) => {
  try {
    const items: OrderItemPayload[] = cartItems.map(item => ({
      productVariantId: parseInt(item.productVariantId, 10), // Use the correct productVariantId from the cart item
      quantity: item.quantity,
      price: item.price,
    }));

    const response = await api.post('/v1/orders', {
      items,
      couponCode,
      deliveryMethod,
      addressId: addressId ? parseInt(String(addressId), 10) : null,
      storeId: storeId,
    });
    console.log("create order response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
export const getOrders = async (page = 0, size = 10): Promise<Page<Order>> => {
  try {
    const response = await api.get('/v1/orders', { params: { page, size } });
    console.log("get orders response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/v1/orders/all');
    console.log("get all orders response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  try {
    const response = await api.put(`/v1/orders/${orderId}/status`, { status });
    console.log("update order status response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: number): Promise<Order> => {
  try {
    const response = await api.put(`/v1/orders/${orderId}/cancel`);
    console.log("cancel order response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};