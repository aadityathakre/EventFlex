import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { gigMenuItems } from '../config/gigMenuItems.jsx';
import './GigLayout.scss';

const GigLayout = () => {
  return (
    <div className="gig-layout">
      <Sidebar menuItems={gigMenuItems} />
      <div className="gig-content">
        <Outlet />
      </div>
    </div>
  );
};

export default GigLayout;
