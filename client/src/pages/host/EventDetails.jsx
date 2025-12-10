import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventDetails.scss';

function EventDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('organizers');

  // Sample event data
  const event = {
    title: 'Wedding #1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
    startDate: '23 Nov 2025',
    startTime: '1:00 AM',
    endDate: '25 Nov 2025',
    endTime: '11:00 AM',
    location: 'location addresss',
  };

  // Sample organizers data
  const organizers = [
    {
      id: 1,
      name: 'Iswaran',
      avatar: 'IS',
      status: 'invited',
    },
    {
      id: 2,
      name: 'Iswaran',
      avatar: 'IS',
      status: 'accepted',
    },
    {
      id: 3,
      name: 'Iswaran',
      avatar: 'IS',
      status: 'declined',
    },
  ];

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
                      <span className="avatar-text">{organizer.avatar}</span>
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
              <p>Budget information will be displayed here</p>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="manage-content">
              <p>Event management options will be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
