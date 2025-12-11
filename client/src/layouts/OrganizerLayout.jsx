import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { organizerMenuItems } from '../config/organizerMenuItems.jsx';
import './OrganizerLayout.scss';

const OrganizerLayout = () => {
  return (
    <div className="organizer-layout">
      <Sidebar menuItems={organizerMenuItems} />
      <div className="organizer-content">
        <Outlet />
      </div>
    </div>
  );
};

export default OrganizerLayout;
