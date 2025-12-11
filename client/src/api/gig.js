import axios from 'axios';

const serverURL = 'http://localhost:8080/api/v1';

// Create axios instance with default config for gig routes
const gigAPI = axios.create({
  baseURL: `${serverURL}/gigs`,
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profile APIs
export const getProfile = () => gigAPI.get('/profile');

export const updateProfile = (data) => gigAPI.put('/profile', data);

export const updateProfileImage = (formData) =>
  gigAPI.put('/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProfileImage = () => gigAPI.delete('/profile-image');

// Wallet APIs
export const createWallet = () => gigAPI.post('/wallet/create');

export const getWallet = () => gigAPI.get('/wallet');

export const withdraw = (data) => gigAPI.post('/withdraw', data);

export const getPaymentHistory = () => gigAPI.get('/payment-history');

// KYC & Documents APIs
export const uploadDocuments = (formData) =>
  gigAPI.post('/upload-documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getKYCStatus = () => gigAPI.get('/kyc-status');

export const updateKYCStatus = (data) => gigAPI.put('/kyc-status', data);

export const uploadKYCVideo = (formData) =>
  gigAPI.post('/kyc/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Events & Pools APIs
export const getNearbyEvents = (params) =>
  gigAPI.get('/nearby-events', { params });

export const getOrganizerPools = () => gigAPI.get('/organizer-pools');

export const joinPool = (poolId, data) =>
  gigAPI.post(`/join-pool/${poolId}`, data);

export const getMyEvents = () => gigAPI.get('/my-events');

// Attendance APIs
export const checkIn = (eventId) => gigAPI.post(`/check-in/${eventId}`);

export const checkOut = (eventId) => gigAPI.post(`/check-out/${eventId}`);

export const getAttendanceHistory = () => gigAPI.get('/attendance-history');

// Disputes APIs
export const raiseDispute = (eventId, data) =>
  gigAPI.post(`/raise-dispute/${eventId}`, data);

// Gamification APIs
export const getBadges = () => gigAPI.get('/badges');

export const getLeaderboard = () => gigAPI.get('/leaderboard');

// Feedback API
export const submitFeedback = (eventId, data) =>
  gigAPI.post(`/feedback/${eventId}`, data);

// Dashboard API
export const getDashboard = () => gigAPI.get('/dashboard');

// Messages APIs
export const sendMessage = (conversationId, data) =>
  gigAPI.post(`/message/${conversationId}`, data);

export const getConversations = () => gigAPI.get('/conversations');

// Notifications API
export const getNotifications = () => gigAPI.get('/notifications');

export default gigAPI;
