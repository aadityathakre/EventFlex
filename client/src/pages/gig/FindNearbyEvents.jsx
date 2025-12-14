import React, { useState, useEffect } from 'react';
import ApplyGigDialog from '../../components/ApplyGigDialog';
import { getNearbyEvents } from '../../api/gig';
import './FindNearbyEvents.scss';

function FindNearbyEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNearbyEvents();
  }, []);

  const fetchNearbyEvents = async (coordinates = null) => {
    try {
      setLoading(true);
      setError('');

      // Prepare request body with coordinates if provided
      // Format: { coordinates: [longitude, latitude] }
      const requestBody = coordinates ? { coordinates } : {};

      const response = await getNearbyEvents(requestBody);

      // Extract events from response
      const eventsData = response.data.data || response.data.events || [];

      // Transform events to match component structure
      const transformedEvents = eventsData.map((event) => {
        // Format location from GeoJSON
        let locationStr = 'Location not specified';
        if (event.location?.coordinates) {
          const [lng, lat] = event.location.coordinates;
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

        // Transform pools to availableGigs format
        const availableGigs = (event.pools || []).map((pool) => ({
          id: pool._id,
          poolId: pool._id,
          title: pool.pool_name || pool.name,
          description: pool.description || '',
          applied: pool.applicants_count || 0,
          responsibilities: pool.responsibilities || [],
          requiredSkills: pool.required_skills || [],
          requiredCount: pool.required_count || 0,
        }));

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          startDate: formatDate(event.start_date),
          startTime: formatTime(event.start_date),
          endDate: formatDate(event.end_date),
          endTime: formatTime(event.end_date),
          location: locationStr,
          organizer: {
            name: event.organizer?.fullName ||
                  `${event.organizer?.first_name || ''} ${event.organizer?.last_name || ''}`.trim() ||
                  'Organizer',
            rating: event.organizer?.rating || 0,
            avatar: event.organizer?.avatar,
          },
          availableGigs,
          eventType: event.event_type,
          status: event.status,
          // Store original event data
          rawData: event,
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching nearby events:', err);
      setError(err.response?.data?.message || 'Failed to fetch nearby events');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (event, gig) => {
    setSelectedGig({ ...gig, event });
    setApplyDialogOpen(true);
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
    setSelectedGig(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Check if search query contains coordinates (format: longitude,latitude)
    const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
    const match = searchQuery.trim().match(coordPattern);

    if (match) {
      const longitude = parseFloat(match[1]);
      const latitude = parseFloat(match[2]);

      // Validate coordinate ranges
      if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
        console.log('Searching with coordinates:', [longitude, latitude]);
        fetchNearbyEvents([longitude, latitude]);
      } else {
        setError('Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.');
      }
    } else {
      // If not coordinates, fetch all events (search by name not implemented yet)
      fetchNearbyEvents();
    }
  };

  return (
    <div className="find-nearby-events">
      <h1>Find nearby events</h1>

      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          placeholder="Enter coordinates (longitude, latitude) e.g., 77.4126, 23.2599"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading nearby events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <p>No nearby events found</p>
        </div>
      ) : (
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
      )}

      <ApplyGigDialog
        isOpen={applyDialogOpen}
        onClose={handleCloseApplyDialog}
        gig={selectedGig}
      />
    </div>
  );
}

export default FindNearbyEvents;
