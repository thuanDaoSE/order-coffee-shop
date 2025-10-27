// src/services/voucherService.ts
import api from './api';
import type { VoucherValidationResponse } from '../types/voucher';

export const validateVoucher = async (code: string): Promise<VoucherValidationResponse> => {
  const response = await api.post('/v1/orders/validate-voucher', { code });
  return response.data;
};
