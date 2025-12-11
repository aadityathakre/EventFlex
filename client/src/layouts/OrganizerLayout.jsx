import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { organizerMenuItems } from '../config/organizerMenuItems.jsx';
import './OrganizerLayout.scss';

const OrganizerLayout = () => {
  const user = {
    name: 'Iswaran',
    role: 'ORG',
  };

  return (
    <div className="organizer-layout">
      <Sidebar user={user} menuItems={organizerMenuItems} />
      <div className="organizer-content">
        <Outlet />
      </div>
    </div>
  );
};

export default OrganizerLayout;
