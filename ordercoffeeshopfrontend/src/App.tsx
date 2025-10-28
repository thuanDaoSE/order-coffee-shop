import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Menu from './pages/Menu';
import Orders from './pages/orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import { Home } from './pages/Home';
import StaffDashboard from './pages/StaffDashboard';
import PaymentResultPage from './pages/PaymentResultPage';
import PaymentPage from './pages/PaymentPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';

import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminProductManagement from './pages/AdminProductManagement';

const AppRoutes = () => {
  const { user } = useAuth();

  const NotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-amber-800 mb-4">404 - Not Found</h1>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="px-6 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors">
        Go to Home
      </Link>
    </div>
  );

  const MainLayout = ({ children }: { children: React.ReactNode }) => (
    <Layout>
      {children}
    </Layout>
  );

  return (
    <Routes>
      {/* Routes without main layout */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      {/* Routes with main layout */}
      <Route
        path="/"
        element={<MainLayout><Home /></MainLayout>}
      />
      <Route
        path="/menu"
        element={<MainLayout><Menu /></MainLayout>}
      />
      <Route
        path="/checkout"
        element={<ProtectedRoute><MainLayout><Checkout /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/payment"
        element={<ProtectedRoute><MainLayout><PaymentPage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/orders"
        element={<ProtectedRoute allowedRoles={['CUSTOMER']}><MainLayout><Orders /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/payment/vnpay/callback"
        element={<MainLayout><PaymentResultPage /></MainLayout>}
      />
      <Route
        path="/staff"
        element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><MainLayout><StaffDashboard /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/staff"
        element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><MainLayout><StaffDashboard /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>}
      />
      
      <Route
        path="/admin/users"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminUsers /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/admin/reports"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminReports /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/admin/products"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminProductManagement /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/cart"
        element={<ProtectedRoute><MainLayout><CartPage /></MainLayout></ProtectedRoute>}
      />

      {/* Fallback Route */}
      <Route
        path="*"
        element={<MainLayout><NotFound /></MainLayout>}
      />
    </Routes>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;
