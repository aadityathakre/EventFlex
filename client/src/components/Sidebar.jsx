import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.scss';
import { useAuth } from '../context/AuthContext';
import { adminLogout } from '../api/admin';
import ProfileEditDialog from './ProfileEditDialog';

const Sidebar = ({ menuItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleLogout = async () => {
    const storedRole = localStorage.getItem('userRole');

    // If admin, use admin logout
    if (storedRole === 'admin') {
      try {
        await adminLogout();
        localStorage.removeItem('userRole');
        navigate('/admin/login');
      } catch (err) {
        console.error('Admin logout error:', err);
        localStorage.removeItem('userRole');
        navigate('/admin/login');
      }
    } else {
      // Otherwise use regular logout
      await logout();
      navigate('/');
    }
  };

  const defaultMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/gig/dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'nearby-events',
      label: 'Nearby Events',
      path: '/gig/nearby-events',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path d="M12 3V12" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'my-events',
      label: 'My Events',
      path: '/gig/my-events',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="2" fill="currentColor" />
          <rect x="3" y="11" width="18" height="2" fill="currentColor" />
          <rect x="3" y="16" width="18" height="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Messages',
      path: '/gig/messages',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      path: '/gig/notifications',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="9" y="1" width="6" height="3" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'wallet',
      label: 'Wallet',
      path: '/gig/wallet',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="16" y="11" width="3" height="2" fill="currentColor" />
        </svg>
      ),
    },
  ];

  const items = menuItems || defaultMenuItems;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = () => {
    // Check if admin
    const storedRole = localStorage.getItem('userRole');
    if (storedRole === 'admin') return 'Admin';

    // Profile endpoint returns 'name' field directly
    if (user?.name) return user.name;
    // Fallback for other endpoints that might return fullName or first_name/last_name
    if (user?.fullName) return user.fullName;
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;
    return 'User';
  };

  const getUserRole = () => {
    // Check localStorage for admin role
    const storedRole = localStorage.getItem('userRole');
    if (storedRole === 'admin') return 'ADMIN';

    if (!user?.role) return '';
    const roleMap = {
      gig: 'GIG',
      organizer: 'ORG',
      host: 'HOST',
      admin: 'ADMIN',
    };
    return roleMap[user.role] || user.role.toUpperCase();
  };

  const handleProfileClick = () => {
    const storedRole = localStorage.getItem('userRole');
    // Only open dialog for gig users
    if (storedRole === 'gig' || user?.role === 'gig') {
      setIsProfileDialogOpen(true);
    }
  };

  const handleProfileUpdate = async () => {
    // Refresh auth context after profile update
    window.location.reload();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <span className="logo-text">EVENTFLEX</span>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className={`user-profile ${user?.role === 'gig' || localStorage.getItem('userRole') === 'gig' ? 'clickable' : ''}`}
            onClick={handleProfileClick}
          >
            {(user?.profile_image_url || user?.avatar) ? (
              <div className="user-avatar">
                <img src={user.profile_image_url || user.avatar} alt={getUserName()} className="avatar-image" />
              </div>
            ) : (
              <div className="user-avatar">
                <span className="avatar-text">{getInitials(getUserName())}</span>
              </div>
            )}
            <div className="user-info">
              <div className="user-name">{getUserName()}</div>
              <div className="user-role">{getUserRole()}</div>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <ProfileEditDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </aside>
  );
};

export default Sidebar;
