import axios from 'axios';

const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080/api/v1';

const adminAPI = axios.create({
  baseURL: `${serverURL}/admin`,
  withCredentials: true,
});

const authAPI = axios.create({
  baseURL: `${serverURL}/auth/admin`,
  withCredentials: true,
});

// Auth APIs
export const adminRegister = (data) =>
  axios.post(`${serverURL}/admin/register`, data, { withCredentials: true });
export const adminLogin = (data) =>
  authAPI.post('/login', data);
export const adminLogout = () =>
  authAPI.post('/logout');
export const adminRefreshToken = () =>
  authAPI.post('/refresh-token');
export const getAdminProfile = () =>
  adminAPI.get('/profile');

// User Management APIs
export const getAllRoles = () => adminAPI.get('/roles');
export const banUser = (userId) => adminAPI.put(`/ban-user/${userId}`);
export const unbanUser = (userId) => adminAPI.put(`/unban-user/${userId}`);
export const softDeleteUser = (userId) => adminAPI.delete(`/soft-delete/${userId}`);
export const restoreUser = (userId) => adminAPI.put(`/restore/${userId}`);

// KYC Management APIs
export const getPendingKYC = () => adminAPI.get('/kyc/pending');
export const approveKYC = (userId) => adminAPI.get(`/kyc/approve/${userId}`);
export const rejectKYC = (userId) => adminAPI.get(`/kyc/reject/${userId}`);
export const getUserDocuments = (userId) => adminAPI.get(`/documents/${userId}`);

// Badge Management APIs
export const createBadge = (data) => adminAPI.post('/badges/create', data);

// Dispute Management APIs
export const getDisputes = () => adminAPI.get('/disputes');
export const resolveDispute = (disputeId, data) => adminAPI.post(`/disputes/resolve/${disputeId}`, data);

// Audit & Logs APIs
export const getAuditLogs = () => adminAPI.get('/audit-logs');

// Notification APIs
export const broadcastNotification = (data) => adminAPI.post('/broadcast', data);
export const notifyUser = (userId, data) => adminAPI.post(`/notify/${userId}`, data);
export const getNotifications = () => adminAPI.get('/notifications');

// Analytics APIs
export const getUserAnalytics = () => adminAPI.get('/analytics/users');
export const getEventAnalytics = () => adminAPI.get('/analytics/events');

export default adminAPI;
