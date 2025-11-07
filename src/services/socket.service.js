import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || true,
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user?._id);

    // Join room for user role
    const userRole = socket.user?.role || 'guest';
    socket.join(userRole);

    // Handle pool subscriptions
    socket.on('watch_pools', ({ filters }) => {
      // Store filters for targeted updates
      socket.poolFilters = filters;
      socket.join('pool_watchers');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user?._id);
    });
  });

  return io;
};

// Emit pool events to relevant users
export const emitPoolEvent = (eventName, payload) => {
  if (!io) return;

  // Emit to all pool watchers
  io.to('pool_watchers').emit(eventName, payload);
};

// Get socket instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};