import api from './api';

export const calculateShippingFee = async (latitude: number, longitude: number): Promise<any> => {
  const response = await api.post('/v1/shipping/calculate', { latitude, longitude });
  return response.data;
};