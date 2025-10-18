import { useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Menu from './pages/Menu';
import Orders from './pages/orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import { Home } from './pages/Home';
import StaffDashboard from './pages/BaristaDashboard';
import PaymentResultPage from './pages/PaymentResultPage';
import PaymentPage from './pages/PaymentPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

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

      <Route path="/payment" element={
        <ProtectedRoute>
          <Layout>
            <PaymentPage />
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

      <Route path="/payment/vnpay/callback" element={
        <Layout>
          <PaymentResultPage />
        </Layout>
      } />

      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><Layout><StaffDashboard /></Layout></ProtectedRoute>
      } />

      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />

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
