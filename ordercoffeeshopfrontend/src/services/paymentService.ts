import api from './api'; // Use the configured axios instance
import type { PaymentRequest, VerifyPaymentResponse } from '../types/payment';

export const mockPaymentSuccess = async (orderId: string | number) => {
  const response = await api.post('/v1/payment/mock-payment-success', { orderId });
  return response.data;
};

export const createPayment = async (paymentData: PaymentRequest) => {
  const response = await api.post(`/v1/payment/create-payment`, paymentData);
  return response.data;
};

export const getPaymentStatus = async (orderId: string) => {
  const response = await api.get(`/v1/payment/status/${orderId}`);
  return response.data;
};

export const verifyPayment = async (data: { orderId: string }): Promise<VerifyPaymentResponse> => {
  const response = await api.post(`/v1/payment/verify`, data);
  return response.data;
};
