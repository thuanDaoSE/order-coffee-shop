// src/services/mockAdminApi.ts
// Mock API tạm thời để tránh lỗi frontend khi backend chưa có các endpoint admin

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
  dailyStats?: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  monthlyStats?: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  yearlyStats?: Array<{
    year: string;
    orders: number;
    revenue: number;
  }>;
}

// Dữ liệu giả cho báo cáo
export const mockReportData: Record<string, ReportData> = {
  daily: {
    totalRevenue: 2450000,
    totalOrders: 45,
    totalProducts: 12,
    averageOrderValue: 54444,
    topProducts: [
      { id: "1", name: "Cà phê đen đá", sold: 25, revenue: 1250000 },
      { id: "2", name: "Cappuccino", sold: 15, revenue: 750000 },
      { id: "3", name: "Bánh mì thịt", sold: 5, revenue: 450000 }
    ],
    dailyStats: [
      { date: "2024-10-14", orders: 45, revenue: 2450000 },
      { date: "2024-10-13", orders: 38, revenue: 2100000 },
      { date: "2024-10-12", orders: 52, revenue: 2800000 },
      { date: "2024-10-11", orders: 41, revenue: 2250000 },
      { date: "2024-10-10", orders: 35, revenue: 1950000 },
      { date: "2024-10-09", orders: 48, revenue: 2600000 },
      { date: "2024-10-08", orders: 42, revenue: 2300000 }
    ]
  },
  monthly: {
    totalRevenue: 65000000,
    totalOrders: 1250,
    totalProducts: 15,
    averageOrderValue: 52000,
    topProducts: [
      { id: "1", name: "Cà phê đen đá", sold: 680, revenue: 34000000 },
      { id: "2", name: "Cappuccino", sold: 420, revenue: 21000000 },
      { id: "3", name: "Latte", sold: 150, revenue: 10000000 }
    ],
    monthlyStats: [
      { month: "2024-10", orders: 1250, revenue: 65000000 },
      { month: "2024-09", orders: 1180, revenue: 61200000 },
      { month: "2024-08", orders: 1350, revenue: 70200000 },
      { month: "2024-07", orders: 1100, revenue: 57200000 },
      { month: "2024-06", orders: 980, revenue: 51000000 },
      { month: "2024-05", orders: 1050, revenue: 54600000 }
    ]
  },
  yearly: {
    totalRevenue: 780000000,
    totalOrders: 15000,
    totalProducts: 20,
    averageOrderValue: 52000,
    topProducts: [
      { id: "1", name: "Cà phê đen đá", sold: 8500, revenue: 425000000 },
      { id: "2", name: "Cappuccino", sold: 5200, revenue: 260000000 },
      { id: "3", name: "Latte", sold: 2200, revenue: 110000000 }
    ],
    yearlyStats: [
      { year: "2024", orders: 15000, revenue: 780000000 },
      { year: "2023", orders: 14200, revenue: 738000000 },
      { year: "2022", orders: 12800, revenue: 665000000 },
      { year: "2021", orders: 9500, revenue: 494000000 }
    ]
  }
};

// Mock API functions
const mockAdminApi = {
  // Reports API
  get: async (endpoint: string) => {
    console.log(`Mock API call to: ${endpoint}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Handle reports endpoint
    if (endpoint.includes('/v1/reports/')) {
      const reportType = endpoint.split('/').pop() as 'daily' | 'monthly' | 'yearly';

      if (mockReportData[reportType]) {
        return {
          data: mockReportData[reportType],
          status: 200
        };
      } else {
        throw new Error(`Invalid report type: ${reportType}`);
      }
    }

    // Handle other admin endpoints
    if (endpoint === '/v1/admin/dashboard') {
      return {
        data: {
          totalUsers: 1250,
          totalOrders: 15000,
          totalRevenue: 780000000,
          pendingOrders: 12,
          completedOrders: 14988
        },
        status: 200
      };
    }

    if (endpoint === '/v1/admin/users') {
      return {
        data: [
          { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "CUSTOMER", createdAt: "2024-01-15" },
          { id: "2", name: "Trần Thị B", email: "tranthib@example.com", role: "ADMIN", createdAt: "2024-01-10" },
          { id: "3", name: "Lê Văn C", email: "levanc@example.com", role: "CUSTOMER", createdAt: "2024-02-20" }
        ],
        status: 200
      };
    }

    // Default response for unknown endpoints
    throw new Error(`Mock API: Endpoint ${endpoint} not implemented`);
  },

  post: async (endpoint: string, data: any) => {
    console.log(`Mock API POST to: ${endpoint}`, data);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (endpoint === '/v1/admin/users') {
      return {
        data: { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() },
        status: 201
      };
    }

    throw new Error(`Mock API: POST endpoint ${endpoint} not implemented`);
  },

  put: async (endpoint: string, data: any) => {
    console.log(`Mock API PUT to: ${endpoint}`, data);

    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      data: { success: true, message: 'Updated successfully' },
      status: 200
    };
  },

  delete: async (endpoint: string) => {
    console.log(`Mock API DELETE to: ${endpoint}`);

    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      data: { success: true, message: 'Deleted successfully' },
      status: 200
    };
  }
};

export default mockAdminApi;
