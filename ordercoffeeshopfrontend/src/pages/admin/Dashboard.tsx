import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-amber-900">Welcome, {user?.name} (Admin)</span>
          <button
            onClick={logout}
            className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">User Management</h2>
          <ul className="space-y-2">
            <li><a href="/admin/users" className="text-amber-700 hover:text-amber-900">View All Users</a></li>
            <li><a href="/admin/users/new" className="text-amber-700 hover:text-amber-900">Add New User</a></li>
            <li><a href="/admin/roles" className="text-amber-700 hover:text-amber-900">Manage Roles</a></li>
          </ul>
        </div>

        {/* Menu Management */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Menu Management</h2>
          <ul className="space-y-2">
            <li><a href="/admin/menu" className="text-amber-700 hover:text-amber-900">View All Items</a></li>
            <li><a href="/admin/menu/add" className="text-amber-700 hover:text-amber-900">Add New Item</a></li>
            <li><a href="/admin/categories" className="text-amber-700 hover:text-amber-900">Manage Categories</a></li>
          </ul>
        </div>

        {/* Reports & Analytics */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Reports & Analytics</h2>
          <ul className="space-y-2">
            <li><a href="/admin/reports/sales" className="text-amber-700 hover:text-amber-900">Sales Reports</a></li>
            <li><a href="/admin/analytics" className="text-amber-700 hover:text-amber-900">Business Analytics</a></li>
            <li><a href="/admin/inventory" className="text-amber-700 hover:text-amber-900">Inventory Status</a></li>
          </ul>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">System Settings</h2>
          <ul className="space-y-2">
            <li><a href="/admin/settings" className="text-amber-700 hover:text-amber-900">General Settings</a></li>
            <li><a href="/admin/backup" className="text-amber-700 hover:text-amber-900">Backup & Restore</a></li>
            <li><a href="/admin/logs" className="text-amber-700 hover:text-amber-900">System Logs</a></li>
          </ul>
        </div>

        {/* Staff Management */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Staff Management</h2>
          <ul className="space-y-2">
            <li><a href="/admin/staff" className="text-amber-700 hover:text-amber-900">View All Staff</a></li>
            <li><a href="/admin/staff/schedule" className="text-amber-700 hover:text-amber-900">Staff Schedule</a></li>
            <li><a href="/admin/performance" className="text-amber-700 hover:text-amber-900">Performance Metrics</a></li>
          </ul>
        </div>

        {/* Promotions & Discounts */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Promotions</h2>
          <ul className="space-y-2">
            <li><a href="/admin/promotions" className="text-amber-700 hover:text-amber-900">Manage Promotions</a></li>
            <li><a href="/admin/discounts" className="text-amber-700 hover:text-amber-900">Discount Codes</a></li>
            <li><a href="/admin/loyalty" className="text-amber-700 hover:text-amber-900">Loyalty Program</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
