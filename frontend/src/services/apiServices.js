import apiClient from '../utils/api';

// Gig Worker Services
export const gigService = {
  getDashboard: () => apiClient.get('/gigs/dashboard'),
  getMyEvents: () => apiClient.get('/gigs/my-events'),
  checkIn: (eventId) => apiClient.post(`/gigs/check-in/${eventId}`),
  getNearbyEvents: (params) => apiClient.get('/gigs/nearby-events', { params }),
  getRecommendedEvents: () => apiClient.get('/gigs/recommended-events'),
  getOrganizerPools: () => apiClient.get('/gigs/organizer-pools'),
  joinPool: (poolId, data) => apiClient.post(`/gigs/join-pool/${poolId}`, data),
  getWallet: () => apiClient.get('/gigs/wallet'),
  withdraw: (data) => apiClient.post('/gigs/withdraw', data),
  getPaymentHistory: () => apiClient.get('/gigs/payment-history'),
  getProfile: () => apiClient.get('/gigs/profile'),
  updateProfile: (data) => apiClient.put('/gigs/profile', data),
  uploadKycVideo: (formData) => apiClient.post('/gigs/kyc/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
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

// Organizer actions on host-created pools
export const poolService = {
  applyToPool: (poolId) => apiClient.post(`/host/pools/apply/${poolId}`),
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
  getAllOrganizers: () => apiClient.get('/host/organizers/all'),
  getAllPools: () => apiClient.get('/host/pools'),
  startChatWithOrganizer: (data) => apiClient.post('/host/chat', data),
  // host messaging
  getConversations: () => apiClient.get('/host/conversations'),
  getConversation: (conversationId) => apiClient.get(`/host/conversations/${conversationId}`),
  sendMessage: (conversationId, message) => apiClient.post(`/host/message/${conversationId}`, { message_text: message }),
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

