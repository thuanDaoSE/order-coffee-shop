import api from './api'; // Use the configured axios instance


export interface PaymentRequest {
  amount: number;
  orderInfo: string;
  orderId: string;
  bankCode?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  orderId?: string;
}

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
