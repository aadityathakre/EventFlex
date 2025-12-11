import React, { useState } from 'react';
import ApplyGigDialog from '../../components/ApplyGigDialog';
import './FindNearbyEvents.scss';

function FindNearbyEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);

  const events = [
    {
      id: 1,
      title: 'Wedding #1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
      startDate: '23 Nov 2025',
      startTime: '1:00 AM',
      endDate: '25 Nov 2025',
      endTime: '11:00 AM',
      location: 'location addresss',
      organizer: {
        name: 'Iswaran',
        rating: 4,
      },
      availableGigs: [
        {
          id: 1,
          title: 'Sounding system management',
          description: '4 Peoples required to manage the sounding system, play sounds, and manage the sound level.',
          applied: 40,
          responsibilities: [
            'Manage the sounding system',
            'Play sounds',
            'Manage the sound level',
          ],
        },
        {
          id: 2,
          title: 'Crowd management',
          description: '3 Peoples required to manage the crowd welcome, and seatings.',
          applied: 10,
          responsibilities: [
            'Manage crowd welcome',
            'Handle seating arrangements',
            'Maintain order',
          ],
        },
      ],
    },
  ];

  const handleApply = (event, gig) => {
    setSelectedGig({ ...gig, event });
    setApplyDialogOpen(true);
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
    setSelectedGig(null);
  };

  return (
    <div className="find-nearby-events">
      <h1>Find nearby events</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter location, event name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <div className="event-main">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
              </div>

              <div className="event-details-row">
                <div className="event-time">
                  <span className="detail-label">START</span>
                  <span className="detail-value">{event.startDate} from {event.startTime}</span>
                  <span className="detail-label">END</span>
                  <span className="detail-value">{event.endDate} from {event.endTime}</span>
                </div>

                <div className="event-location">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{event.location}</span>
                </div>

                <div className="event-organizer">
                  <span className="detail-label">Organizer</span>
                  <span className="organizer-name">{event.organizer.name}</span>
                  <div className="organizer-rating">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`star ${index < event.organizer.rating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="gigs-section">
              <h4 className="gigs-label">Gigs Available</h4>

              {event.availableGigs.map((gig) => (
                <div key={gig.id} className="gig-item">
                  <div className="gig-info">
                    <h5 className="gig-title">{gig.title}</h5>
                    <p className="gig-description">{gig.description}</p>
                    <p className="gig-applied">{gig.applied} Peoples applied</p>
                  </div>
                  <button
                    className="apply-button"
                    onClick={() => handleApply(event, gig)}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ApplyGigDialog
        isOpen={applyDialogOpen}
        onClose={handleCloseApplyDialog}
        gig={selectedGig}
      />
    </div>
  );
}

export default FindNearbyEvents;
