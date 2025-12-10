import React, { useState } from 'react';
import Dialog from './Dialog';
import './AuthDialog.scss';

const AuthDialog = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState('organiser');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { mode, formData, role: mode === 'register' ? selectedRole : undefined });
  };

  const handleGoogleAuth = () => {
    console.log('Google auth clicked');
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
                  className={`role-button ${selectedRole === 'organiser' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('organiser')}
                >
                  Organiser
                </button>
                <button
                  type="button"
                  className={`role-button ${selectedRole === 'gig-worker' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('gig-worker')}
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

          <button type="submit" className="submit-button">
            {mode === 'login' ? 'Login' : 'Signup'}
          </button>

          <button type="button" className="google-button" onClick={handleGoogleAuth}>
            {mode === 'login' ? 'Login with Google' : 'Signup with Google'}
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
