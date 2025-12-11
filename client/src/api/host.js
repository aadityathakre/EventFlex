import axios from 'axios';
import { serverURL } from '../App.jsx';

// Create axios instance with default config for host routes
const hostAPI = axios.create({
  baseURL: `${serverURL}/host`,
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profile API
export const getProfile = () => hostAPI.get('/profile');

// Document Upload APIs
export const uploadDocs = (formData) =>
  hostAPI.post('/upload-docs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const uploadESignature = (formData) =>
  hostAPI.post('/e-signature', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Aadhaar Verification API
export const verifyAadhaar = (data) => hostAPI.post('/aadhaar/verify', data);

// Wallet APIs
export const getWalletBalance = () => hostAPI.get('/wallet/balance');

// Event Management APIs
export const createEvent = (data) => hostAPI.post('/events/create', data);

export const editEvent = (eventId, data) =>
  hostAPI.put(`/events/edit/${eventId}`, data);

export const getEvent = (eventId) => hostAPI.get(`/events/${eventId}`);

export const getEvents = () => hostAPI.get('/events');

export const completeEvent = (eventId) =>
  hostAPI.post(`/events/complete/${eventId}`);

// Organizer Management APIs
export const inviteOrganizer = (data) => hostAPI.post('/invite-organizer', data);

export const approveOrganizer = (invitationId) =>
  hostAPI.post(`/approve-organizer/${invitationId}`);

export const getOrganizers = () => hostAPI.get('/organizers');

// Chat API
export const getChat = () => hostAPI.get('/chat');

// Payment APIs
export const depositPayment = (data) => hostAPI.post('/payment/deposit', data);

export const getPaymentStatus = (eventId) =>
  hostAPI.get(`/payment/status/${eventId}`);

// Dashboard API
export const getDashboard = () => hostAPI.get('/dashboard');

// Attendance Verification API
export const verifyAttendance = (eventId, data) =>
  hostAPI.post(`/verify-attendance/${eventId}`, data);

// Reviews & Ratings APIs
export const submitFeedback = (data) => hostAPI.post('/reviews/feedback', data);

export const submitRating = (data) => hostAPI.post('/reviews/rating', data);

export default hostAPI;
