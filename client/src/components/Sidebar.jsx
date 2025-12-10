import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = ({ user = { name: 'Iswaran', role: 'ORG' } }) => {
  const location = useLocation();

  const menuItems = [
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <span className="logo-text">EVENTFLEX</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
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
          <div className="user-profile">
            <div className="user-avatar">
              <span className="avatar-text">{getInitials(user.name)}</span>
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
