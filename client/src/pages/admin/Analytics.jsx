import React, { useState, useEffect } from 'react';
import { getUserAnalytics, getEventAnalytics } from '../../api/admin';
import './Analytics.scss';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [eventAnalytics, setEventAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [userResponse, eventResponse] = await Promise.all([
        getUserAnalytics(),
        getEventAnalytics(),
      ]);

      const userData = userResponse.data.data || userResponse.data;
      const eventData = eventResponse.data.data || eventResponse.data;

      setUserAnalytics(userData);
      setEventAnalytics(eventData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-analytics">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-analytics">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <p className="subtitle">Platform performance and usage statistics</p>
      </div>

      {/* User Analytics Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h2>User Analytics</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon user-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{userAnalytics?.total_users || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon host-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{userAnalytics?.total_hosts || 0}</div>
              <div className="stat-label">Hosts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon organizer-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{userAnalytics?.total_organizers || 0}</div>
              <div className="stat-label">Organizers</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon gig-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{userAnalytics?.total_gigs || 0}</div>
              <div className="stat-label">Gig Workers</div>
            </div>
          </div>
        </div>

        {/* Additional User Metrics */}
        {userAnalytics && (
          <div className="metrics-grid">
            {userAnalytics.active_users !== undefined && (
              <div className="metric-card">
                <div className="metric-label">Active Users</div>
                <div className="metric-value">{userAnalytics.active_users}</div>
                <div className="metric-sublabel">Currently active</div>
              </div>
            )}
            {userAnalytics.new_users_this_month !== undefined && (
              <div className="metric-card">
                <div className="metric-label">New This Month</div>
                <div className="metric-value">{userAnalytics.new_users_this_month}</div>
                <div className="metric-sublabel">New registrations</div>
              </div>
            )}
            {userAnalytics.verified_users !== undefined && (
              <div className="metric-card">
                <div className="metric-label">Verified Users</div>
                <div className="metric-value">{userAnalytics.verified_users}</div>
                <div className="metric-sublabel">KYC verified</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Analytics Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h2>Event Analytics</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon event-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="6" width="18" height="15" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 10H21M8 3V6M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{eventAnalytics?.total_events || 0}</div>
              <div className="stat-label">Total Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{eventAnalytics?.active_events || 0}</div>
              <div className="stat-label">Active Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{eventAnalytics?.completed_events || 0}</div>
              <div className="stat-label">Completed Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon upcoming-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{eventAnalytics?.upcoming_events || 0}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
          </div>
        </div>

        {/* Additional Event Metrics */}
        {eventAnalytics && (
          <div className="metrics-grid">
            {eventAnalytics.total_pools !== undefined && (
              <div className="metric-card">
                <div className="metric-label">Total Pools</div>
                <div className="metric-value">{eventAnalytics.total_pools}</div>
                <div className="metric-sublabel">Across all events</div>
              </div>
            )}
            {eventAnalytics.average_pool_size !== undefined && (
              <div className="metric-card">
                <div className="metric-label">Avg Pool Size</div>
                <div className="metric-value">{eventAnalytics.average_pool_size}</div>
                <div className="metric-sublabel">Workers per pool</div>
              </div>
            )}
            {eventAnalytics.events_this_month !== undefined && (
              <div className="metric-card">
                <div className="metric-label">This Month</div>
                <div className="metric-value">{eventAnalytics.events_this_month}</div>
                <div className="metric-sublabel">New events</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
