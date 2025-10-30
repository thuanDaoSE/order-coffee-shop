import api from './api';

export interface ShippingInfo {
  shippingFee: number;
  distance: number;
}

export const calculateShippingFee = async (latitude: number, longitude: number): Promise<ShippingInfo> => {
  const response = await api.post('/v1/shipping/calculate', { latitude, longitude });
  return response.data;
};