import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Menu from './pages/Menu';
import Orders from './pages/orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import StaffDashboard from './pages/staff/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import type { CartItem as NewCartItem } from './types/cart'; // Sử dụng type mới
import { Home } from './pages/Home';
import Unauthorized from './pages/Unauthorized';

// Admin components (you'll need to create these components)
import AdminMenu from './pages/AdminMenu';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';

const getInitialCart = (): NewCartItem[] => {
  try {
    const item = window.localStorage.getItem('cartItems');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage', error);
    return [];
  }
};

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<NewCartItem[]>(getInitialCart);
  const { user } = useAuth();

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

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
        <ProtectedRoute allowedRoles={['BARISTA', 'ADMIN']}>
          <Layout cartCount={cartCount}>
            <StaffDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      {/* Admin Routes */}
      <Route path="/admin">
        <Route index element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout cartCount={cartCount}>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="menu" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout cartCount={cartCount}>
              <AdminMenu />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout cartCount={cartCount}>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
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
