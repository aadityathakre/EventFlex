import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const roleDashboards = {
      gig: '/dashboard/gig',
      organizer: '/dashboard/organizer',
      host: '/dashboard/host',
      admin: '/dashboard/admin',
    };
    return <Navigate to={roleDashboards[user?.role] || '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;

