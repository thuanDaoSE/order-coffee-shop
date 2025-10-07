import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute = ({
  allowedRoles = ['customer', 'barista', 'admin'],
  redirectTo = '/login',
  children
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If children are passed, render them, otherwise render the Outlet
  return children ? <>{children}</> : <Outlet />;
};
