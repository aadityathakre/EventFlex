import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import blockchainRoutes from './routes/blockchain.routes.js';

dotenv.config();

const app = express();
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`⛓️  Blockchain: ${process.env.BLOCKCHAIN_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
});
