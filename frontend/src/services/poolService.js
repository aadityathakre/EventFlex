import api from '../utils/api';
import notificationService from './notificationService';

const poolService = {
  // Get available pools with filters
  getAvailablePools: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const data = await api.get(`/pools?${queryString}`);
    // Subscribe to real-time updates for these pools
    const socket = notificationService.getSocket();
    if (socket?.connected) {
      socket.emit('watch_pools', { filters });
    }
    return data;
  },

  // Get specific pool details
  getPoolDetails: async (poolId) => {
    const data = await api.get(`/pools/${poolId}`);
    return data;
  },

  // Apply to a pool
  applyToPool: async (poolId, applicationData) => {
    const data = await api.post(`/pools/${poolId}/apply`, applicationData);
    return data;
  },

  // Get gig's applications
  getMyApplications: async (status) => {
    const queryString = status ? `?status=${status}` : '';
    const data = await api.get(`/applications${queryString}`);
    return data;
  },

  // Organizer: Create new pool
  createPool: async (poolData) => {
    const data = await api.post('/pools', poolData);
    return data;
  },

  // Organizer: Update pool
  updatePool: async (poolId, poolData) => {
    const data = await api.put(`/pools/${poolId}`, poolData);
    return data;
  },

  // Organizer: Get own pools
  getMyPools: async () => {
    const data = await api.get('/my-pools');
    return data;
  },

  // Organizer: Get pool applications
  getPoolApplications: async (poolId) => {
    const data = await api.get(`/pools/${poolId}/applications`);
    return data;
  },

  // Organizer: Decide on application
  decideOnApplication: async (applicationId, decision) => {
    const data = await api.put(`/applications/${applicationId}/decide`, decision);
    return data;
  }
};

export default poolService;