import api from './api';

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  revenueOverTime: any[];
  topSellingProducts: any[];
}

export const getSalesReport = async (period: string): Promise<SalesReport> => {
  const response = await api.get('/v1/reports/sales', { params: { period } });
  return response.data;
};
