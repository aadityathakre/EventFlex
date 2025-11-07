import apiClient from '../utils/api';

// Gig Worker Services
export const gigService = {
  getDashboard: () => apiClient.get('/gigs/dashboard'),
  getMyEvents: () => apiClient.get('/gigs/my-events'),
  checkIn: (eventId) => apiClient.post(`/gigs/check-in/${eventId}`),
  getNearbyEvents: (params) => apiClient.get('/gigs/nearby-events', { params }),
  getRecommendedEvents: () => apiClient.get('/gigs/recommended-events'),
  // Get all organizer pools with optional location filtering
  getOrganizerPools: (coords) => apiClient.get('/gigs/organizer-pools', { 
    params: coords,
    transformResponse: [(data) => {
      try {
        const parsedData = JSON.parse(data);
        return parsedData.data.map(pool => ({
          ...pool,
          hasJoined: pool.status === 'pending' || pool.status === 'joined'
        }));
      } catch (error) {
        console.error('Error parsing pool data:', error);
        return [];
      }
    }]
  }),
  // Get pools created by organizers (Pool model)
  getPools: () => apiClient.get('/gigs/pools', {
    transformResponse: [(data) => {
      try {
        const parsed = JSON.parse(data);
        return parsed.data.map(pool => ({
          ...pool,
          hasJoined: pool.status === 'pending' || pool.status === 'joined'
        }));
      } catch (e) {
        console.error('Error parsing pools response', e);
        return [];
      }
    }]
  }),
  // Join a Pool created by organizer (Pool model)
  joinPoolModel: (poolId) => apiClient.post(`/gigs/pools/join/${poolId}`),
  // Join a specific pool
  joinPool: (poolId, data) => apiClient.post(`/gigs/join-pool/${poolId}`, data),
  // Get details of a specific pool (Pool model)
  getPoolDetails: (poolId) => apiClient.get(`/gigs/pools/${poolId}`, {
    transformResponse: [(data) => {
      try {
        const parsed = JSON.parse(data);
        // ApiResponse shape: { statusCode, data, message, success }
        const payload = parsed.data || parsed;
        return {
          ...payload,
          hasJoined: payload.status === 'pending' || payload.status === 'joined' || !!payload.hasJoined
        };
      } catch (e) {
        console.error('Error parsing pool details response', e);
        return null;
      }
    }]
  }),
  getWallet: () => apiClient.get('/gigs/wallet'),
  withdraw: (data) => apiClient.post('/gigs/withdraw', data),
  getPaymentHistory: () => apiClient.get('/gigs/payment-history'),
  getProfile: () => apiClient.get('/gigs/profile'),
  updateProfile: (data) => apiClient.put('/gigs/profile', data),
  uploadKycVideo: (formData) => apiClient.post('/gigs/kyc/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProfileImage: (formData) => apiClient.put('/gigs/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // 30 second timeout
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log('Upload progress:', percentCompleted, '%');
    }
  }),
  getKycStatus: () => apiClient.get('/gigs/kyc-status'),
  getBadges: () => apiClient.get('/gigs/badges'),
  getLeaderboard: () => apiClient.get('/gigs/leaderboard'),
  getConversations: () => apiClient.get('/gigs/conversations'),
  sendMessage: (conversationId, message) => apiClient.post(`/gigs/message/${conversationId}`, { message }),
  getNotifications: () => apiClient.get('/gigs/notifications'),
};

// Organizer Services
export const organizerService = {
  createPool: (data) => apiClient.post('/organizer/pools/create', data),
  getPoolDetails: (poolId) => apiClient.get(`/organizer/pools/${poolId}`),
  managePool: (poolId, data) => apiClient.put(`/organizer/pools/manage/${poolId}`, data),
  createEvent: (data) => apiClient.post('/organizer/events/create', data),
  editEvent: (eventId, data) => apiClient.put(`/organizer/events/${eventId}/edit`, data),
  getEventDetails: (eventId) => apiClient.get(`/organizer/events/${eventId}`),
  getLiveEventTracking: (eventId) => apiClient.get(`/organizer/events/live/${eventId}`),
  markEventComplete: (eventId) => apiClient.post(`/organizer/events/complete/${eventId}`),
  getWallet: () => apiClient.get('/organizer/wallet'),
  withdrawFunds: (data) => apiClient.post('/organizer/withdraw', data),
  getPaymentHistory: () => apiClient.get('/organizer/payment-history'),
  getWellnessScore: () => apiClient.get('/organizer/wellness-score'),
  getNoShowRisk: (gigId) => apiClient.get(`/organizer/no-show-risk/${gigId}`),
};

// Host Services
export const hostService = {
  createEvent: (data) => apiClient.post('/host/events/create', data),
  editEvent: (eventId, data) => apiClient.put(`/host/events/edit/${eventId}`, data),
  getEventDetails: (eventId) => apiClient.get(`/host/events/${eventId}`),
  getHostEvents: () => apiClient.get('/host/events'),
  completeEvent: (eventId) => apiClient.put(`/host/events/complete/${eventId}`),
  inviteOrganizer: (data) => apiClient.post('/host/invite-organizer', data),
  approveOrganizer: (organizerId) => apiClient.post(`/host/approve-organizer/${organizerId}`),
  getAssignedOrganizers: () => apiClient.get('/host/organizers'),
  depositToEscrow: (data) => apiClient.post('/host/payment/deposit', data),
  getEscrowStatus: (eventId) => apiClient.get(`/host/payment/status/${eventId}`),
  verifyAttendance: (eventId) => apiClient.post(`/host/verify-attendance/${eventId}`),
  getWalletBalance: () => apiClient.get('/host/wallet/balance'),
  getDashboard: () => apiClient.get('/host/dashboard'),
};

// Admin Services
export const adminService = {
  getAllRoles: () => apiClient.get('/admin/roles'),
  banUser: (userId) => apiClient.put(`/admin/ban-user/${userId}`),
  unbanUser: (userId) => apiClient.put(`/admin/unban-user/${userId}`),
  getPendingKYC: () => apiClient.get('/admin/kyc/pending'),
  approveKYC: (userId) => apiClient.post(`/admin/kyc/approve/${userId}`),
  rejectKYC: (userId) => apiClient.post(`/admin/kyc/reject/${userId}`),
  getDisputes: () => apiClient.get('/admin/disputes'),
  resolveDispute: (disputeId, data) => apiClient.post(`/admin/disputes/resolve/${disputeId}`, data),
  getAnalytics: {
    users: () => apiClient.get('/admin/analytics/users'),
    events: () => apiClient.get('/admin/analytics/events'),
    payments: () => apiClient.get('/admin/analytics/payments'),
  },
};

