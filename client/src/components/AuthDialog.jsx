import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from './Dialog';
import './AuthDialog.scss';
import { useAuth } from '../context/AuthContext';

const AuthDialog = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState('organizer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password states
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { register, login, googleAuth, sendOTP, verifyOTP, resetPassword, error: authError, user } = useAuth();
  const navigate = useNavigate();

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Navigate based on user role after successful login
  useEffect(() => {
    if (user) {
      const roleRoutes = {
        gig: '/gig/dashboard',
        organizer: '/organizer/dashboard',
        host: '/host/dashboard',
      };

      const route = roleRoutes[user.role] || '/';
      navigate(route);
      onClose();
    }
  }, [user, navigate, onClose]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          setLocalError(result.error);
        }
      } else if (mode === 'register') {
        // Register mode
        const result = await register({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: selectedRole,
        });

        if (result.success) {
          // Show success message and switch to login
          setSuccessMessage('Registration successful! Please login.');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
          });
          setTimeout(() => {
            setMode('login');
            setSuccessMessage('');
          }, 2000);
        } else {
          setLocalError(result.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setLocalError('');

    try {
      const result = await googleAuth();
      if (!result.success) {
        setLocalError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    });
    setLocalError('');
    setSuccessMessage('');
  };

  const openForgotPassword = () => {
    setMode('forgot-password');
    setForgotPasswordStep(1);
    setLocalError('');
    setSuccessMessage('');
    setForgotPasswordEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const backToLogin = () => {
    setMode('login');
    setLocalError('');
    setSuccessMessage('');
    setForgotPasswordStep(1);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError('');

    try {
      const result = await sendOTP(forgotPasswordEmail);
      if (result.success) {
        setForgotPasswordStep(2);
      } else {
        setLocalError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError('');

    try {
      const result = await verifyOTP(forgotPasswordEmail, otp);
      if (result.success) {
        setForgotPasswordStep(3);
      } else {
        setLocalError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match!');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');

    try {
      const result = await resetPassword(forgotPasswordEmail, newPassword);
      if (result.success) {
        setSuccessMessage('Password reset successful! Please login.');
        setTimeout(() => {
          backToLogin();
        }, 2000);
      } else {
        setLocalError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (mode === 'forgot-password') {
      if (forgotPasswordStep === 1) return 'Forgot Password';
      if (forgotPasswordStep === 2) return 'Verify OTP';
      if (forgotPasswordStep === 3) return 'Reset Password';
    }
    return mode === 'login' ? 'Welcome back' : 'Register';
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="auth-dialog">
      <div className="auth-header">
        <h2 className="auth-title">{getTitle()}</h2>
      </div>

      <div className="auth-body">
        {mode === 'forgot-password' ? (
          // Forgot Password Views
          <>
            {forgotPasswordStep === 1 && (
              <form onSubmit={handleSendOTP}>
                <p className="forgot-password-text">Enter your email to reset password</p>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={forgotPasswordEmail}
                    onChange={(e) => {
                      setForgotPasswordEmail(e.target.value);
                      setLocalError('');
                    }}
                    className="form-input"
                    required
                  />
                </div>

                {localError && <p className="error-message">{localError}</p>}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </button>

                <div className="auth-footer">
                  <button type="button" className="switch-link" onClick={backToLogin}>
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {forgotPasswordStep === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <p className="forgot-password-text">Enter the OTP sent to your email</p>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setLocalError('');
                    }}
                    className="form-input"
                    required
                  />
                </div>

                {localError && <p className="error-message">{localError}</p>}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="auth-footer">
                  <button type="button" className="switch-link" onClick={backToLogin}>
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {forgotPasswordStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <p className="forgot-password-text">Set your new password</p>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setLocalError('');
                    }}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setLocalError('');
                    }}
                    className="form-input"
                    required
                  />
                </div>

                {localError && <p className="error-message">{localError}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </>
        ) : (
          // Login/Register Views
          <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="role-selection">
              <label className="role-label">Choose your role</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-button ${selectedRole === 'organizer' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('organizer')}
                >
                  Organizer
                </button>
                <button
                  type="button"
                  className={`role-button ${selectedRole === 'gig' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('gig')}
                >
                  Gig Worker
                </button>
                <button
                  type="button"
                  className={`role-button ${selectedRole === 'host' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('host')}
                >
                  Host
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Your phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {localError && <p className="error-message">{localError}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          {mode === 'login' && (
            <div className="forgot-password-link-wrapper">
              <button type="button" className="forgot-password-link" onClick={openForgotPassword}>
                Forgot Password?
              </button>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Signup'}
          </button>

          <button type="button" className="google-button" onClick={handleGoogleAuth} disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login with Google' : 'Signup with Google'}
          </button>

          <div className="auth-footer">
            {mode === 'login' ? (
              <p className="switch-text">
                Don't have an Account?{' '}
                <button type="button" className="switch-link" onClick={switchMode}>
                  Register now
                </button>
              </p>
            ) : (
              <p className="switch-text">
                Already have an account?{' '}
                <button type="button" className="switch-link" onClick={switchMode}>
                  Login
                </button>
              </p>
            )}
          </div>
        </form>
        )}
      </div>
    </Dialog>
  );
};

export default AuthDialog;
