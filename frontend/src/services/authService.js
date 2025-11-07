import apiClient from '../utils/api';

export const authService = {
  // Register user
  register: async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return await apiClient.post('/users/register', formData, config);
  },

  // ✅ Login user (Updated for admin handling)
  login: async (credentials) => {
<<<<<<< HEAD
    // 👇 Check if this is admin login
    const isAdmin = credentials.email === "adityathakre1281@gmail.com";

    // 👇 Hit the correct endpoint
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/users/login';

    const response = await apiClient.post(endpoint, credentials);

    // ✅ Save tokens if available
    if (response?.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
=======
    const response = await apiClient.post('/auth/users/login', credentials);
    // Backend returns ApiResponse { statusCode, data: { user, accessToken, refreshToken }, message }
    if (response?.data?.user) {
      // Store user data in localStorage for persistence
>>>>>>> organizer-branch
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/auth/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh token
  refreshToken: async () => {
    return await apiClient.post('/auth/users/refresh-token');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};
