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