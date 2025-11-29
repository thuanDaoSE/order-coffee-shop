import api from './api';

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  revenueOverTime: any[];
  topSellingProducts: any[];
}

export const getSalesReport = async (period: string, storeId?: number | null): Promise<SalesReport> => {
  const params: any = { period };
  if (storeId) {
    params.storeId = storeId;
  }
  const response = await api.get('/v1/reports/sales', { params });
  return response.data;
};