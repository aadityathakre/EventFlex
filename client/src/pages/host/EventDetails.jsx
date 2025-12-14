import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvent, getOrganizers, getPaymentStatus } from '../../api/host';
import PaymentDepositDialog from '../../components/PaymentDepositDialog';
import './EventDetails.scss';

function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('organizers');
  const [event, setEvent] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchOrganizers();
      fetchPaymentStatus();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEvent(id);

      // Extract event data from response
      const eventData = response.data.data || response.data.event || response.data;

      console.log('Event details response:', eventData);

      // Format location from GeoJSON
      let locationStr = 'Location not specified';
      if (eventData.location?.coordinates) {
        const [lng, lat] = eventData.location.coordinates;
        locationStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      // Format dates
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };

      const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

      // Set event data
      const formattedEvent = {
        id: eventData._id,
        title: eventData.title,
        description: eventData.description,
        startDate: formatDate(eventData.start_date),
        startTime: formatTime(eventData.start_date),
        endDate: formatDate(eventData.end_date),
        endTime: formatTime(eventData.end_date),
        location: locationStr,
        budget: eventData.budget?.$numberDecimal || eventData.budget || 0,
        status: eventData.status,
        eventType: eventData.event_type,
        rawData: eventData,
      };

      setEvent(formattedEvent);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(err.response?.data?.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const response = await getOrganizers();
      const organizersData = response.data.data || response.data.organizers || response.data;

      console.log('Organizers response:', organizersData);

      // Filter organizers for this specific event if the response includes event info
      let eventOrganizers = organizersData;

      // If organizersData is an array, filter by event ID
      if (Array.isArray(organizersData)) {
        eventOrganizers = organizersData.filter(
          (org) => org.event?._id === id || org.event === id || org.eventId === id
        );
      }

      // Format organizers data
      const formattedOrganizers = (Array.isArray(eventOrganizers) ? eventOrganizers : []).map((org) => {
        // Handle both invitation objects and direct organizer objects
        const organizerData = org.organizer || org;

        return {
          id: organizerData._id || organizerData.id,
          name: organizerData.fullName || organizerData.name ||
                `${organizerData.first_name || ''} ${organizerData.last_name || ''}`.trim() || 'Organizer',
          avatar: organizerData.avatar || organizerData.profile_image_url,
          status: org.status || 'invited',
          email: organizerData.email,
          phone: organizerData.phone,
        };
      });

      setOrganizers(formattedOrganizers);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      // Don't set error state here, just log it - organizers list will be empty
    }
  };

  const fetchPaymentStatus = async () => {
    try {
      setPaymentLoading(true);
      const response = await getPaymentStatus(id);
      const paymentData = response.data.data || response.data;

      console.log('Payment status response:', paymentData);

      setPaymentStatus(paymentData);
    } catch (err) {
      console.error('Error fetching payment status:', err);
      // Don't set error state - payment might not exist yet
      setPaymentStatus(null);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/host/events');
  };

  const handleInviteOrganizers = () => {
    navigate('/host/find-organizers');
  };

  const handleFindMoreOrganizers = () => {
    navigate('/host/find-organizers');
  };

  const handleViewProfile = (organizer) => {
    console.log('View profile:', organizer);
  };

  const handleRemove = (organizer) => {
    console.log('Remove organizer:', organizer);
  };

  const handleMarkAttended = (organizer) => {
    console.log('Mark attended:', organizer);
  };

  const handleEditEvent = () => {
    navigate(`/host/events/${id}/edit`);
  };

  const handleMarkEventCompleted = () => {
    console.log('Mark event completed');
  };

  const handleDepositNow = () => {
    setDepositDialogOpen(true);
  };

  const handleCloseDepositDialog = () => {
    setDepositDialogOpen(false);
    // Refresh payment status after deposit
    fetchPaymentStatus();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'invited':
        return 'Invitation sent';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'invited':
        return 'status-invited';
      case 'accepted':
        return 'status-accepted';
      case 'declined':
        return 'status-declined';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="event-details">
        <div className="loading-state">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details">
        <div className="event-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
        <div className="error-message">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="event-details">
      <div className="event-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <button className="invite-button" onClick={handleInviteOrganizers}>
          Invite organizers
        </button>
      </div>

      <div className="event-info">
        <div className="event-title-section">
          <h1>{event.title}</h1>
          <p className="event-description">{event.description}</p>
        </div>

        <div className="event-details-grid">
          <div className="detail-item">
            <span className="detail-label">START</span>
            <span className="detail-value">{event.startDate} from {event.startTime}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Location</span>
            <span className="detail-value">{event.location}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">END</span>
            <span className="detail-value">{event.endDate} from {event.endTime}</span>
          </div>
        </div>
      </div>

      <div className="tabs-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'organizers' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizers')}
          >
            ORGANIZERS
          </button>
          <button
            className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            BUDGET
          </button>
          <button
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            MANAGE EVENT
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'organizers' && (
            <div className="organizers-list">
              {organizers.map((organizer) => (
                <div key={organizer.id} className="organizer-row">
                  <div className="organizer-info">
                    <div className="organizer-avatar">
                      {organizer.avatar ? (
                        <img src={organizer.avatar} alt={organizer.name} className="avatar-image" />
                      ) : (
                        <span className="avatar-text">
                          {organizer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="organizer-name">{organizer.name}</span>
                    <span className={`status-badge ${getStatusClass(organizer.status)}`}>
                      {getStatusLabel(organizer.status)}
                    </span>
                  </div>

                  <div className="organizer-actions">
                    {organizer.status === 'accepted' && (
                      <button
                        className="action-button mark-attended"
                        onClick={() => handleMarkAttended(organizer)}
                      >
                        Mark attended
                      </button>
                    )}
                    <button
                      className="action-button view-profile"
                      onClick={() => handleViewProfile(organizer)}
                    >
                      View full profile
                    </button>
                    <button
                      className="action-button remove"
                      onClick={() => handleRemove(organizer)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button className="find-more-button" onClick={handleFindMoreOrganizers}>
                Find more organizers
              </button>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="budget-content">
              {paymentLoading ? (
                <div className="loading-state">
                  <p>Loading payment information...</p>
                </div>
              ) : paymentStatus ? (
                <>
                  {/* Event Budget and Funded Amount */}
                  <div className="budget-overview">
                    <div className="budget-overview-item">
                      <span className="overview-label">Event Budget</span>
                      <span className="overview-value">₹{parseFloat(event.budget).toFixed(2)}</span>
                    </div>
                    <div className="budget-overview-item">
                      <span className="overview-label">Funded Amount</span>
                      <span className="overview-value">
                        ₹{parseFloat(paymentStatus.total_amount?.$numberDecimal || paymentStatus.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="budget-overview-item">
                      <span className="overview-label">Remaining</span>
                      <span className="overview-value">
                        ₹{(parseFloat(event.budget) - parseFloat(paymentStatus.total_amount?.$numberDecimal || paymentStatus.total_amount || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="budget-grid">
                    <div className="budget-item">
                      <span className="budget-label">Organizers Share</span>
                      <span className="budget-value">
                        {parseFloat(paymentStatus.organizer_percentage?.$numberDecimal || paymentStatus.organizer_percentage || 0).toFixed(2)}%
                      </span>
                    </div>

                    <div className="budget-item">
                      <span className="budget-label">Gig Workers Share</span>
                      <span className="budget-value">
                        {parseFloat(paymentStatus.gigs_percentage?.$numberDecimal || paymentStatus.gigs_percentage || 0).toFixed(2)}%
                      </span>
                    </div>

                    <div className="budget-item">
                      <span className="budget-label">Created Date</span>
                      <span className="budget-value">
                        {new Date(paymentStatus.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="budget-grid">
                    <div className="budget-item">
                      <span className="budget-label">Organizers Amount</span>
                      <span className="budget-value">
                        ₹{(parseFloat(paymentStatus.total_amount?.$numberDecimal || paymentStatus.total_amount || 0) *
                          parseFloat(paymentStatus.organizer_percentage?.$numberDecimal || paymentStatus.organizer_percentage || 0) / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="budget-item">
                      <span className="budget-label">Gig Workers Amount</span>
                      <span className="budget-value">
                        ₹{(parseFloat(paymentStatus.total_amount?.$numberDecimal || paymentStatus.total_amount || 0) *
                          parseFloat(paymentStatus.gigs_percentage?.$numberDecimal || paymentStatus.gigs_percentage || 0) / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="budget-item">
                      <span className="budget-label">In Escrow</span>
                      <span className="budget-value">
                        ₹{parseFloat(paymentStatus.total_amount?.$numberDecimal || paymentStatus.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button className="deposit-button" onClick={handleDepositNow}>
                    Make Another Deposit
                  </button>
                </>
              ) : (
                <>
                  <div className="no-payment-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>No Payment Deposited</h3>
                    <p>Deposit funds to escrow to secure payment for this event</p>
                  </div>

                  <div className="budget-grid">
                    <div className="budget-item">
                      <span className="budget-label">Event Budget</span>
                      <span className="budget-value">₹{parseFloat(event.budget).toFixed(2)}</span>
                    </div>
                  </div>

                  <button className="deposit-button" onClick={handleDepositNow}>
                    Deposit now
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="manage-content">
              <button className="edit-event-button" onClick={handleEditEvent}>
                Edit Event
              </button>
              <button className="complete-event-button" onClick={handleMarkEventCompleted}>
                Mark Event completed
              </button>
            </div>
          )}
        </div>
      </div>

      <PaymentDepositDialog
        isOpen={depositDialogOpen}
        onClose={handleCloseDepositDialog}
        event={event}
        organizers={organizers}
      />
    </div>
  );
}

export default EventDetails;
