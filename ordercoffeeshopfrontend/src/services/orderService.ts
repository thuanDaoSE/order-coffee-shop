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