import api from '../utils/api';
import io from 'socket.io-client';

let socket;
const listeners = {};

const emitToListeners = (event, payload) => {
  const fns = listeners[event] || [];
  fns.forEach((fn) => {
    try { fn(payload); } catch (err) { console.error('listener error', err); }
  });
};

const notificationService = {
  // Initialize socket connection
  initializeSocket: (token) => {
    if (socket?.connected) {
      socket.disconnect();
    }

    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Connected to notification system');
      // Request initial pool data after reconnection (use same event name as backend)
      socket.emit('watch_pools', { filters: {} });
    });

    socket.on('notification', (notification) => {
      // emit to local listeners; UI can decide what to do with notification
      emitToListeners('notification', notification);
    });

    // Pool/app events
    socket.on('pool_created', (pool) => {
      emitToListeners('pool_created', pool);
    });

    socket.on('pool_updated', (pool) => {
      emitToListeners('pool_updated', pool);
    });

    socket.on('pool_application_created', (data) => {
      emitToListeners('pool_application_created', data);
    });

    socket.on('application_decided', (data) => {
      emitToListeners('application_decided', data);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  },

  // Simple event subscription API for components
  on: (event, cb) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(cb);
    return () => { // return unsubscribe
      listeners[event] = listeners[event].filter(f => f !== cb);
    };
  },

  // Disconnect socket
  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // Expose socket instance if needed
  getSocket: () => socket,

  // Get user's notifications
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const data = await api.get(`/notifications?${queryString}`);
    return data;
  },

  // Mark notification as seen
  markAsSeen: async (notificationId) => {
    const data = await api.put(`/notifications/${notificationId}/seen`);
    return data;
  },

  // Mark all notifications as seen
  markAllAsSeen: async () => {
    const data = await api.put('/notifications/mark-all-seen');
    return data;
  }
};

export default notificationService;