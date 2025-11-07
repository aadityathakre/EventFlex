import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => {
  // Initialize from localStorage
  const initialUser = authService.getCurrentUser();
  const initialAuth = authService.isAuthenticated();

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

