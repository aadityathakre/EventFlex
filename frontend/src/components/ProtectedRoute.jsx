import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but user is missing (token present but user not loaded), try to reload from localStorage
  const currentUser = user || authService.getCurrentUser();
  if (!currentUser) {
    // clear potential bad token and force login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    // Redirect to appropriate dashboard based on role
    const roleDashboards = {
      gig: '/dashboard/gig',
      organizer: '/dashboard/organizer',
      host: '/dashboard/host',
      admin: '/dashboard/admin',
    };
    return <Navigate to={roleDashboards[currentUser?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;

