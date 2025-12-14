import React, { useState, useEffect } from 'react';
import { getDashboard } from '../../api/gig';
import './Dashboard.scss';

function GigDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalEvents: 0,
    totalEarnings: 0,
    averageRating: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDashboard();
      const data = response.data.data || response.data;

      console.log('Gig dashboard data:', data);

      setDashboardData({
        totalEvents: data.totalEvents || 0,
        totalEarnings: parseFloat(data.totalEarnings?.$numberDecimal || data.totalEarnings || 0),
        averageRating: data.averageRating || 0,
        badges: data.badges || [],
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
      <div className="gig-dashboard">
        <div className="loading-state">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gig-dashboard">
      <h1>Dashboard</h1>

      {error && (
        <div className="error-message" style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{dashboardData.totalEvents}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon earnings">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Earnings</span>
            <span className="stat-value">₹{dashboardData.totalEarnings.toFixed(2)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Rating</span>
            <span className="stat-value">{dashboardData.averageRating.toFixed(1)} ⭐</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon badges">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Badges Earned</span>
            <span className="stat-value">{dashboardData.badges.length}</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {dashboardData.badges.length > 0 && (
        <div className="badges-section">
          <h2>Your Badges</h2>
          <div className="badges-grid">
            {dashboardData.badges.map((badge, index) => (
              <div key={index} className="badge-card">
                <div className="badge-icon">🏆</div>
                <span className="badge-name">{badge.name || badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GigDashboard;
