import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/payment';

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
  const response = await axios.post(`${API_URL}/create-payment`, paymentData);
  return response.data;
};

export const getPaymentStatus = async (orderId: string) => {
  const response = await axios.get(`${API_URL}/status/${orderId}`);
  return response.data;
};

export const verifyPayment = async (data: { orderId: string }): Promise<VerifyPaymentResponse> => {
  const response = await axios.post(`${API_URL}/verify`, data);
  return response.data;
};
