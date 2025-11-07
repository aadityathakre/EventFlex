import api from './api';

const poolService = {
  // Get available pools with filters
  getAvailablePools: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await api.get(`/pools?${queryString}`);
    return response.data;
  },

  // Get specific pool details
  getPoolDetails: async (poolId) => {
    const response = await api.get(`/pools/${poolId}`);
    return response.data;
  },

  // Apply to a pool
  applyToPool: async (poolId, applicationData) => {
    const response = await api.post(`/pools/${poolId}/apply`, applicationData);
    return response.data;
  },

  // Get gig's applications
  getMyApplications: async (status) => {
    const queryString = status ? `?status=${status}` : '';
    const response = await api.get(`/applications${queryString}`);
    return response.data;
  },

  // Organizer: Create new pool
  createPool: async (poolData) => {
    const response = await api.post('/pools', poolData);
    return response.data;
  },

  // Organizer: Update pool
  updatePool: async (poolId, poolData) => {
    const response = await api.put(`/pools/${poolId}`, poolData);
    return response.data;
  },

  // Organizer: Get own pools
  getMyPools: async () => {
    const response = await api.get('/my-pools');
    return response.data;
  },

  // Organizer: Get pool applications
  getPoolApplications: async (poolId) => {
    const response = await api.get(`/pools/${poolId}/applications`);
    return response.data;
  },

  // Organizer: Decide on application
  decideOnApplication: async (applicationId, decision) => {
    const response = await api.put(`/applications/${applicationId}/decide`, decision);
    return response.data;
  }
};

export default poolService;