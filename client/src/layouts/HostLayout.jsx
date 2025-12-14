import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { hostMenuItems } from '../config/hostMenuItems.jsx';
import './HostLayout.scss';

const HostLayout = () => {
  return (
    <div className="host-layout">
      <Sidebar menuItems={hostMenuItems} />
      <div className="host-content">
        <Outlet />
      </div>
    </div>
  );
};

export default HostLayout;
