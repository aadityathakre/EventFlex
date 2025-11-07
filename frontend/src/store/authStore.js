import { create } from 'zustand';
import { authService } from '../services/authService';
import notificationService from '../services/notificationService';

const useAuthStore = create((set, get) => {
  // Initialize from localStorage
  const initialUser = authService.getCurrentUser();
  // Since we're using cookies, we can only check if user exists
  const initialAuth = !!initialUser;

  return {
    user: initialUser,
    isAuthenticated: initialAuth,
    loading: false,

    // Login
    login: async (credentials) => {
      set({ loading: true });
      try {
        const response = await authService.login(credentials);
        set({
          user: response?.data?.user,
          isAuthenticated: true,
          loading: false,
        });
        // Initialize socket connection after successful login (use stored token)
        try {
          const token = localStorage.getItem('accessToken');
          if (token) notificationService.initializeSocket(token);
        } catch (err) {
          console.warn('Failed to initialize socket after login', err.message);
        }
        return response;
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    // Register
    register: async (formData) => {
      set({ loading: true });
      try {
        const response = await authService.register(formData);
        set({
          user: response?.data?.user,
          isAuthenticated: true,
          loading: false,
        });
        return response;
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    // Logout
    logout: async () => {
      await authService.logout();
      // Disconnect socket on logout
      try { notificationService.disconnectSocket(); } catch (err) { /* ignore */ }
      set({
        user: null,
        isAuthenticated: false,
      });
    },

    // Update user
    updateUser: (userData) => {
      const updatedUser = { ...get().user, ...userData };
      set({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    },

    // Check role
    hasRole: (role) => {
      const user = get().user;
      return user?.role === role;
    },

    // Check if user has any of the roles
    hasAnyRole: (roles) => {
      const user = get().user;
      return roles.includes(user?.role);
    },
  };
});

export default useAuthStore;

// If there's an existing authenticated session on page load, initialize socket
try {
  if (authService.isAuthenticated()) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      notificationService.initializeSocket(token);
    }
  }
} catch (err) {
  // ignore errors during initialization
}

