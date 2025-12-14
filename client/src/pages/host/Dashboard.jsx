import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../api/host';
import './Dashboard.scss';

function HostDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    events: [],
    escrows: [],
    payments: [],
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

      // Extract dashboard data from response
      const data = response.data.data || response.data;

      console.log('Dashboard data:', data);

      setDashboardData({
        events: data.events || [],
        escrows: data.escrows || [],
        payments: data.payments || [],
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    const value = amount.$numberDecimal || amount;
    return `₹${parseFloat(value).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="host-dashboard">
        <div className="loading-state">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-dashboard">
      <h1>Host Dashboard</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <section className="dashboard-section">
        <h2>Quick Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{dashboardData.events.length}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {dashboardData.events.filter(e => e.status === 'active').length}
            </div>
            <div className="stat-label">Active Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {dashboardData.escrows.filter(e => e.status === 'funded').length}
            </div>
            <div className="stat-label">Funded Escrows</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {dashboardData.payments.filter(p => p.status === 'completed').length}
            </div>
            <div className="stat-label">Completed Payments</div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Events</h2>
          <button
            className="view-all-btn"
            onClick={() => navigate('/host/events')}
          >
            View All Events
          </button>
        </div>

        {dashboardData.events.length === 0 ? (
          <div className="empty-state">
            <p>No events created yet</p>
            <button
              className="create-event-btn"
              onClick={() => navigate('/host/events/create')}
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {dashboardData.events.slice(0, 4).map((event) => (
              <div
                key={event._id}
                className="event-card"
                onClick={() => navigate(`/host/events/${event._id}`)}
              >
                <h3>{event.title}</h3>
                <p className="event-type">{event.event_type}</p>
                <div className="event-details">
                  <span className="event-date">
                    {formatDate(event.start_date)}
                  </span>
                  <span className={`event-status status-${event.status}`}>
                    {event.status}
                  </span>
                </div>
                <div className="event-budget">
                  Budget: {formatCurrency(event.budget)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Escrows Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Escrow Contracts</h2>
        </div>

        {dashboardData.escrows.length === 0 ? (
          <div className="empty-state">
            <p>No escrow contracts yet</p>
          </div>
        ) : (
          <div className="escrows-list">
            {dashboardData.escrows.map((escrow) => (
              <div key={escrow._id} className="escrow-item">
                <div className="escrow-info">
                  <h4>{escrow.event?.title || 'Event'}</h4>
                  <p className="escrow-organizer">
                    Organizer: {escrow.organizer?.name || escrow.organizer?.email || 'N/A'}
                  </p>
                </div>
                <div className="escrow-details">
                  <div className="escrow-amount">
                    {formatCurrency(escrow.total_amount)}
                  </div>
                  <span className={`escrow-status status-${escrow.status}`}>
                    {escrow.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payments Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Payments</h2>
        </div>

        {dashboardData.payments.length === 0 ? (
          <div className="empty-state">
            <p>No payments yet</p>
          </div>
        ) : (
          <div className="payments-list">
            {dashboardData.payments.map((payment) => (
              <div key={payment._id} className="payment-item">
                <div className="payment-info">
                  <h4>{formatCurrency(payment.amount)}</h4>
                  <p className="payment-method">
                    {payment.payment_method}
                    {payment.upi_transaction_id && ` - ${payment.upi_transaction_id}`}
                  </p>
                </div>
                <div className="payment-details">
                  <span className="payment-date">
                    {formatDate(payment.createdAt)}
                  </span>
                  <span className={`payment-status status-${payment.status}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HostDashboard;
