import { useState, useEffect } from 'react';
import { getSalesReport, SalesReport } from '../services/reportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminReports = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [reportData, setReportData] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await getSalesReport(period);
      setReportData(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-900">Sales Reports</h1>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-4 py-2 rounded-lg ${period === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-lg ${period === 'weekly' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-lg ${period === 'monthly' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-amber-600">${reportData?.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{reportData?.totalOrders}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData?.revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#c0a062" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Products</h2>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Sales</th>
                <th className="text-right py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.topSellingProducts.map((product: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{product.name}</td>
                  <td className="text-right py-2">{product.quantity}</td>
                  <td className="text-right py-2">${product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
