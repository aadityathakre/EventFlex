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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, login, googleAuth, error: authError, user } = useAuth();
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError('');

    try {
      if (mode === 'login') {
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          setLocalError(result.error);
        }
      } else {
        // Register mode
        const result = await register({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: selectedRole,
        });

        if (!result.success) {
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
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="auth-dialog">
      <div className="auth-header">
        <h2 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Register'}</h2>
      </div>

      <div className="auth-body">
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
      </div>
    </Dialog>
  );
};

export default AuthDialog;
