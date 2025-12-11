import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { serverURL } from '../App.jsx';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${serverURL}/auth/users/me`, {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async ({ first_name, last_name, email, password, phone, role }) => {
    try {
      setError('');
      const result = await axios.post(
        `${serverURL}/auth/users/register`,
        { first_name, last_name, email, password, phone, role },
        { withCredentials: true }
      );

      setUser(result.data.user);
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async ({ email, password }) => {
    try {
      setError('');
      const result = await axios.post(
        `${serverURL}/auth/users/login`,
        { email, password },
        { withCredentials: true }
      );

      setUser(result.data.user);
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Google Auth
  const googleAuth = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const data = await signInWithPopup(auth, provider);

      const result = await axios.post(
        `${serverURL}/auth/users/google-auth`,
        { email: data.user.email },
        { withCredentials: true }
      );

      setUser(result.data.user);
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Google authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setError('');
      await axios.post(
        `${serverURL}/auth/users/logout`,
        {},
        { withCredentials: true }
      );

      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Send OTP for password reset
  const sendOTP = async (email) => {
    try {
      setError('');
      await axios.post(
        `${serverURL}/auth/users/send-otp`,
        { email },
        { withCredentials: true }
      );
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Verify OTP
  const verifyOTP = async (email, otp) => {
    try {
      setError('');
      await axios.post(
        `${serverURL}/auth/users/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (email, newPassword) => {
    try {
      setError('');
      await axios.post(
        `${serverURL}/auth/users/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    googleAuth,
    logout,
    sendOTP,
    verifyOTP,
    resetPassword,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
