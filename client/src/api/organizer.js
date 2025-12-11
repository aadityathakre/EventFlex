import axios from 'axios';
import { serverURL } from '../App.jsx';

// Create axios instance with default config for organizer routes
const organizerAPI = axios.create({
  baseURL: `${serverURL}/organizer`,
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profile API
export const getProfile = () => organizerAPI.get('/profile');

// Document Upload APIs
export const uploadDocs = (formData) =>
  organizerAPI.post('/upload-docs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const uploadESignature = (formData) =>
  organizerAPI.post('/e-signature', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Aadhaar Verification API
export const verifyAadhaar = (data) => organizerAPI.post('/aadhaar/verify', data);

// Wallet APIs
export const getWallet = () => organizerAPI.get('/wallet');

export const withdraw = (data) => organizerAPI.post('/withdraw', data);

// Pool Management APIs
export const createPool = (data) => organizerAPI.post('/pools/create', data);

export const getPoolApplications = (poolId) =>
  organizerAPI.get(`/pools/${poolId}/applications`);

export const approvePoolApplication = (poolId, data) =>
  organizerAPI.post(`/pools/${poolId}/applications`, data);

export const getPool = (poolId) => organizerAPI.get(`/pools/${poolId}`);

export const managePool = (poolId, data) =>
  organizerAPI.put(`/pools/manage/${poolId}`, data);

export const getPoolChat = (poolId) => organizerAPI.get(`/pools/chat/${poolId}`);

// Event APIs
export const getEvent = (eventId) => organizerAPI.get(`/events/${eventId}`);

export const markEventLive = (eventId, data) =>
  organizerAPI.post(`/events/live/${eventId}`, data);

// Payment APIs
export const getPaymentHistory = () => organizerAPI.get('/payment-history');

export const simulatePayout = (eventId) =>
  organizerAPI.post(`/simulate-payout/${eventId}`);

// No-Show Risk API
export const getNoShowRisk = (poolId) =>
  organizerAPI.get(`/no-show-risk/${poolId}`);

// Disputes APIs
export const getDisputes = () => organizerAPI.get('/disputes');

export const getDisputeDetails = (disputeId) =>
  organizerAPI.get(`/disputes/${disputeId}`);

export const resolveDispute = (data) => organizerAPI.post('/disputes', data);

// Gamification APIs
export const getBadges = () => organizerAPI.get('/badges');

export const getLeaderboard = () => organizerAPI.get('/leaderboard');

// Notifications APIs
export const getNotifications = () => organizerAPI.get('/notifications');

export const markNotificationAsRead = (notificationId) =>
  organizerAPI.put(`/notifications/${notificationId}/read`);

export default organizerAPI;
