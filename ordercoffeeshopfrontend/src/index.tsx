import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import StaffDashboard from './pages/staff/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import type { CartItem } from './types/coffee';
import { Home } from './pages/Home';
import Unauthorized from './pages/Unauthorized';

// Admin components (you'll need to create these components)
const AdminMenu = () => <div>Admin Menu Management</div>;
const AdminUsers = () => <div>User Management</div>;
const AdminReports = () => <div>Reports Dashboard</div>;

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      {/* Home Routes */}
      <Route path="/" element={
        <Layout cartCount={cartCount}>
          <Home 
           
          />
        </Layout>
      } />

       {/* Menu Routes */}
       <Route path="/menu" element={
        <Layout cartCount={cartCount}>
          <Menu 
            cartItems={cartItems}
            setCartItems={setCartItems}
            setCartCount={setCartCount}
          />
        </Layout>
      } />
      
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Layout cartCount={cartCount}>
            <Checkout cartItems={cartItems} onClearCart={clearCart} />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout cartCount={cartCount}>
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Staff/Barista Routes */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['barista', 'admin']}>
          <Layout cartCount={cartCount}>
            <StaffDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      {/* Admin Routes */}
      <Route path="/admin">
        <Route index element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout cartCount={cartCount}>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="menu" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout cartCount={cartCount}>
              <AdminMenu />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout cartCount={cartCount}>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout cartCount={cartCount}>
              <AdminReports />
            </Layout>
          </ProtectedRoute>
        } />
      </Route>

      <Route path="/unauthorized" element={
        <Layout cartCount={cartCount}>
          <Unauthorized />
        </Layout>
      } />
    </Routes>
  );
}
export default App;
