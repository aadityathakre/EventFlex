import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import blockchainRoutes from './routes/blockchain.routes.js';
import { initializeSocket } from './services/socket.service.js';
import connectDB from './db/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', blockchain: process.env.BLOCKCHAIN_ENABLED === 'true' });
});

// Routes
app.use('/api/blockchain', blockchainRoutes);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize Socket.IO
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
