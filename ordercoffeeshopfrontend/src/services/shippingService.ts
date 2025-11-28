import api from './api';

export interface ShippingInfo {
  shippingFee: number;
  distance: number;
  storeId: number;
  storeName: string;
}

export const calculateShippingFeeForStore = async (storeId: number, latitude: number, longitude: number): Promise<ShippingInfo> => {
  const response = await api.post('/shipping/calculate-for-store', { storeId, latitude, longitude });
  return response.data;
};

export const calculateShippingFee = async (latitude: number, longitude: number): Promise<ShippingInfo> => {
  const response = await api.post('/shipping/calculate', { latitude, longitude });
  return response.data;
};