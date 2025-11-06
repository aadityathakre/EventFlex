import axios from 'axios';

// Default to same-origin when served by Express; can be overridden via VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { data } = refreshResponse.data;
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle errors by logging to console only (no user-facing toast)
    const message = error.response?.data?.message || error.message || 'An error occurred';
    // eslint-disable-next-line no-console
    console.error('API error:', { status: error.response?.status, message, url: originalRequest?.url });
    return Promise.reject(error);
  }
);

export default apiClient;

