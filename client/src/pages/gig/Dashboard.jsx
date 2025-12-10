import React from 'react';
import Sidebar from '../../components/Sidebar';
import './Dashboard.scss';

function GigDashboard() {
    return (
        <div className="gig-dashboard">
            <Sidebar />
            <div className="dashboard-content">
                <h1>Dashboard</h1>
            </div>
        </div>
    );
}

export default GigDashboard;