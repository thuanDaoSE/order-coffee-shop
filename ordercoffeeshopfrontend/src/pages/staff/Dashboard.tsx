import { useAuth } from '../../contexts/AuthContext';

const StaffDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Staff Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-amber-900">Welcome, {user?.name} ({user?.role})</span>
          <button
            onClick={logout}
            className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Order Management */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Order Management</h2>
          <ul className="space-y-2">
            <li><a href="/staff/orders" className="text-amber-700 hover:text-amber-900">View All Orders</a></li>
            <li><a href="/staff/orders/new" className="text-amber-700 hover:text-amber-900">New Orders</a></li>
            <li><a href="/staff/orders/in-progress" className="text-amber-700 hover:text-amber-900">In Progress</a></li>
          </ul>
        </div>

        {/* Menu Management */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Menu Management</h2>
          <ul className="space-y-2">
            <li><a href="/staff/menu" className="text-amber-700 hover:text-amber-900">View Menu</a></li>
            <li><a href="/staff/menu/update" className="text-amber-700 hover:text-amber-900">Update Availability</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-amber-900">Customer Service</h2>
          <ul className="space-y-2">
            <li><a href="/staff/customers" className="text-amber-700 hover:text-amber-900">Customer List</a></li>
            <li><a href="/staff/reservations" className="text-amber-700 hover:text-amber-900">Reservations</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
