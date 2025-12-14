import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventDetails.scss';

function GigEventDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accepted');

  const event = {
    title: 'Wedding #1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
    startDate: '23 Nov 2025',
    startTime: '1:00 AM',
    endDate: '25 Nov 2025',
    endTime: '11:00 AM',
    location: 'location addresss',
  };

  const acceptedGigs = [
    {
      id: 1,
      title: 'Sounding system management',
      description: '4 Peoples required to manage the sounding system, play sounds, and manage the sound level.',
    },
  ];

  const handleBack = () => {
    navigate('/gig/my-events');
  };

  const handleCheckIn = (gig) => {
    console.log('Check in:', gig);
  };

  return (
    <div className="gig-event-details">
      <div className="event-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <button className="invite-button">
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
            className={`tab ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            ACCEPTED GIGS
          </button>
          <button
            className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            APPLICATIONS
          </button>
          <button
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            PAYMENTS
          </button>
          <button
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            MANAGE EVENT
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'accepted' && (
            <div className="accepted-gigs-list">
              {acceptedGigs.map((gig) => (
                <div key={gig.id} className="gig-row">
                  <div className="gig-info">
                    <h3 className="gig-title">{gig.title}</h3>
                    <p className="gig-description">{gig.description}</p>
                  </div>

                  <button
                    className="check-in-button"
                    onClick={() => handleCheckIn(gig)}
                  >
                    Check In
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-content">
              <p>Your applications will be displayed here</p>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="payments-content">
              <p>Payment information will be displayed here</p>
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

export default GigEventDetails;
