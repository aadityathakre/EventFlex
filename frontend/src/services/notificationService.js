import api from './api';
import io from 'socket.io-client';
import { store } from '../store';
import { addNotification, markNotificationSeen } from '../store/slices/notificationSlice';

let socket;

const notificationService = {
  // Initialize socket connection
  initializeSocket: (token) => {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to notification system');
    });

    socket.on('notification', (notification) => {
      store.dispatch(addNotification(notification));
      // Optional: Play a sound or show a toast notification
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  },

  // Disconnect socket
  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
    }
  },

  // Get user's notifications
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/notifications?${queryString}`);
    return response.data;
  },

  // Mark notification as seen
  markAsSeen: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/seen`);
    store.dispatch(markNotificationSeen(notificationId));
    return response.data;
  },

  // Mark all notifications as seen
  markAllAsSeen: async () => {
    const response = await api.put('/notifications/mark-all-seen');
    return response.data;
  }
};

export default notificationService;