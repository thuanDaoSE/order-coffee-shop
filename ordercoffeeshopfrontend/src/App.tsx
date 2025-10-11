import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Menu from './pages/Menu';
import Orders from './pages/orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import StaffDashboard from './pages/staff/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import { Home } from './pages/Home';
import Unauthorized from './pages/Unauthorized';
import AdminMenu from './pages/AdminMenu';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      {/* Home Route */}
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />

      {/* Menu Route */}
      <Route path="/menu" element={
        <Layout>
          <Menu />
        </Layout>
      } />
      
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Layout>
            <Checkout />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout>
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Staff/Barista Routes */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['BARISTA', 'ADMIN']}>
          <Layout>
            <StaffDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin">
        <Route index element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="menu" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminMenu />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminReports />
            </Layout>
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-amber-800 mb-4">404 - Not Found</h1>
            <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
            <Link to="/" className="px-6 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors">
              Go to Home
            </Link>
          </div>
        </Layout>
      } />
    </Routes>
  );
};

function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}
export default App;
