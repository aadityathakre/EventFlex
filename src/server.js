import dotenv from 'dotenv';
import { createServer } from 'http';
import { app } from './app.js';
import { initializeSocket } from './services/socket.service.js';
import connectDB from './db/index.js';

dotenv.config();

const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO (will attach to httpServer)
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
      console.log(`⛓️  Blockchain: ${process.env.BLOCKCHAIN_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
      console.log(`🔌 Socket.IO: Initialized`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
