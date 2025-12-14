import React from 'react';

export const hostMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/host/dashboard',
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
    id: 'find-organizers',
    label: 'Find Organizers',
    path: '/host/find-organizers',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path d="M12 3V12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Events',
    path: '/host/events',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 2V6M16 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/host/messages',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'wallet',
    label: 'Wallet',
    path: '/host/wallet',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="16" y="11" width="3" height="2" fill="currentColor" />
      </svg>
    ),
  },
];
