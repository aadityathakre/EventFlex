import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvent } from '../../api/host';
import './EventDetails.scss';

function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('organizers');
  const [event, setEvent] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEventDetails();
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

      // Extract and format organizers if available
      if (eventData.organizers && Array.isArray(eventData.organizers)) {
        const formattedOrganizers = eventData.organizers.map((org) => ({
          id: org._id || org.id,
          name: org.fullName || org.name || `${org.first_name || ''} ${org.last_name || ''}`.trim() || 'Organizer',
          avatar: org.avatar || org.profile_image_url,
          status: org.status || 'invited',
          email: org.email,
          phone: org.phone,
        }));
        setOrganizers(formattedOrganizers);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(err.response?.data?.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
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
    console.log('Edit event');
  };

  const handleMarkEventCompleted = () => {
    console.log('Mark event completed');
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
              <div className="budget-grid">
                <div className="budget-item">
                  <span className="budget-label">Total funds</span>
                  <span className="budget-value">₹{parseFloat(event.budget).toFixed(2)}</span>
                </div>

                <div className="budget-item">
                  <span className="budget-label">Organizers share</span>
                  <span className="budget-value">{event.rawData?.organizers_share || 20}%</span>
                </div>

                <div className="budget-item">
                  <span className="budget-label">Gig Workers share</span>
                  <span className="budget-value">{event.rawData?.gig_workers_share || 20}%</span>
                </div>
              </div>

              <div className="budget-grid">
                <div className="budget-item">
                  <span className="budget-label">Platform fee</span>
                  <span className="budget-value">{event.rawData?.platform_fee || 20}%</span>
                </div>

                <div className="budget-item">
                  <span className="budget-label">In escrow</span>
                  <span className="budget-value">₹{parseFloat(event.rawData?.escrow_amount?.$numberDecimal || event.rawData?.escrow_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <button className="deposit-button">
                Deposit now
              </button>
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
    </div>
  );
}

export default EventDetails;
