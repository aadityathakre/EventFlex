import Pool from '../models/Pool.model.js';
import { emitPoolEvent } from './socket.service.js';

export const poolService = {
  // Create a new pool
  createPool: async (poolData) => {
    const pool = await Pool.create(poolData);
    // Emit pool created event to all connected clients
    emitPoolEvent('pool_created', pool);
    return pool;
  },

  // Get all pools with filters
  getPools: async (filters = {}) => {
    const query = Pool.find(filters)
      .populate('organizer', 'name email')
      .sort('-createdAt');
    
    const pools = await query.exec();
    return pools;
  },

  // Update a pool
  updatePool: async (poolId, updateData) => {
    const pool = await Pool.findByIdAndUpdate(
      poolId,
      updateData,
      { new: true }
    ).populate('organizer', 'name email');

    if (!pool) {
      throw new Error('Pool not found');
    }

    // Emit pool updated event
    emitPoolEvent('pool_updated', pool);
    return pool;
  },

  // Delete a pool
  deletePool: async (poolId) => {
    const pool = await Pool.findByIdAndDelete(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    // Emit pool deleted event
    emitPoolEvent('pool_deleted', poolId);
    return { message: 'Pool deleted successfully' };
  }
};