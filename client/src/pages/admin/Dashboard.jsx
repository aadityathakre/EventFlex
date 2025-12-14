import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserAnalytics, getEventAnalytics, getPendingKYC, getDisputes } from '../../api/admin';
import './Dashboard.scss';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalGigs: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    pendingKYC: 0,
    openDisputes: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [userAnalytics, eventAnalytics, kycData, disputesData] = await Promise.all([
        getUserAnalytics(),
        getEventAnalytics(),
        getPendingKYC(),
        getDisputes(),
      ]);

      const userData = userAnalytics.data.data || userAnalytics.data;
      const eventData = eventAnalytics.data.data || eventAnalytics.data;
      const kycList = kycData.data.data || kycData.data.pendingKYCs || [];
      const disputesList = disputesData.data.data || disputesData.data.disputes || [];

      // Calculate stats
      setStats({
        totalUsers: userData.total_users || 0,
        totalHosts: userData.total_hosts || 0,
        totalGigs: userData.total_gigs || 0,
        totalOrganizers: userData.total_organizers || 0,
        totalEvents: eventData.total_events || 0,
        activeEvents: eventData.active_events || 0,
        completedEvents: eventData.completed_events || 0,
        pendingKYC: kycList.length || 0,
        openDisputes: disputesList.filter(d => d.status === 'open' || d.status === 'pending').length || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Overview of platform statistics and pending actions</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/kyc" className="action-card">
            <div className="action-icon kyc">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h3>Pending KYC</h3>
              <p className="action-count">{stats.pendingKYC}</p>
            </div>
          </Link>

          <Link to="/admin/disputes" className="action-card">
            <div className="action-icon disputes">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h3>Open Disputes</h3>
              <p className="action-count">{stats.openDisputes}</p>
            </div>
          </Link>

          <Link to="/admin/users" className="action-card">
            <div className="action-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h3>Manage Users</h3>
              <p className="action-count">{stats.totalUsers}</p>
            </div>
          </Link>

          <Link to="/admin/analytics" className="action-card">
            <div className="action-icon analytics">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h3>View Analytics</h3>
              <p className="action-count">Reports</p>
            </div>
          </Link>
        </div>
      </div>

      {/* User Statistics */}
      <div className="dashboard-section">
        <h2>User Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalHosts}</div>
            <div className="stat-label">Hosts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrganizers}</div>
            <div className="stat-label">Organizers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalGigs}</div>
            <div className="stat-label">Gig Workers</div>
          </div>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="dashboard-section">
        <h2>Event Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalEvents}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeEvents}</div>
            <div className="stat-label">Active Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedEvents}</div>
            <div className="stat-label">Completed Events</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
