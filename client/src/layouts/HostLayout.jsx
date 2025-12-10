import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { hostMenuItems } from '../config/hostMenuItems.jsx';
import './HostLayout.scss';

const HostLayout = () => {
  // TODO: Replace with actual user data from auth context
  const user = {
    name: 'Host User',
    role: 'HOST',
  };

  return (
    <div className="host-layout">
      <Sidebar user={user} menuItems={hostMenuItems} />
      <div className="host-content">
        <Outlet />
      </div>
    </div>
  );
};

export default HostLayout;
