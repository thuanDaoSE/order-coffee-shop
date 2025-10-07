import { useState, useEffect } from 'react';
import { adminApi } from '../services/mockApi';

const AdminReports = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getReports(reportType);
      setReportData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (format: 'xlsx' | 'pdf') => {
    alert(`Exporting data as ${format.toUpperCase()}... (Mock functionality)`);
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
          <h1 className="text-3xl font-bold text-amber-900">Revenue Reports</h1>
          <div className="flex gap-2">
            <button onClick={() => exportData('xlsx')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Export Excel
            </button>
            <button onClick={() => exportData('pdf')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Export PDF
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setReportType('daily')}
              className={`px-4 py-2 rounded-lg ${reportType === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-2 rounded-lg ${reportType === 'monthly' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setReportType('yearly')}
              className={`px-4 py-2 rounded-lg ${reportType === 'yearly' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-amber-600">${reportData?.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{reportData?.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Avg Order Value</h3>
            <p className="text-3xl font-bold text-green-600">${reportData?.averageOrderValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Chart</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {reportData?.chartData.values.map((value: number, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-amber-500 rounded-t hover:bg-amber-600 transition"
                  style={{ height: `${(value / Math.max(...reportData.chartData.values)) * 100}%` }}
                  title={`$${value.toFixed(2)}`}
                ></div>
                <span className="text-xs mt-2 text-gray-600">{reportData.chartData.labels[index]}</span>
              </div>
            ))}
          </div>
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
              {reportData?.topProducts.map((product: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{product.name}</td>
                  <td className="text-right py-2">{product.sales}</td>
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
