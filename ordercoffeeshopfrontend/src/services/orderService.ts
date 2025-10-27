import type { CartItem } from "../contexts/CartContext";
import api from './authService';

interface OrderItemPayload {
  productVariantId: string;
  quantity: number;
}

export const createOrder = async (cartItems: CartItem[], couponCode: string, deliveryMethod: string) => {
  try {
    const items: OrderItemPayload[] = cartItems.map(item => ({
      productVariantId: item.id, // Assuming item.id from CartContext is the variant ID
      quantity: item.quantity,
    }));

    const response = await api.post('/v1/orders', { 
      items, 
      couponCode, 
      deliveryMethod
    });
    console.log("create order response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await api.get('/v1/orders');
    console.log("get orders response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get('/v1/orders/all');
    console.log("get all orders response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const response = await api.put(`/v1/orders/${orderId}/status`, { status });
    console.log("update order status response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: number) => {
  try {
    const response = await api.put(`/v1/orders/${orderId}/cancel`);
    console.log("cancel order response: ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};