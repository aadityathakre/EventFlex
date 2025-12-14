import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Event from '../../components/Event';
import { getMyEvents } from '../../api/gig';
import './Events.scss';

function GigEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyEvents();

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

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          startDate: formatDate(event.start_date),
          startTime: formatTime(event.start_date),
          endDate: formatDate(event.end_date),
          endTime: formatTime(event.end_date),
          location: locationStr,
          gigs: event.pools || [],
          status: event.status,
          eventType: event.event_type,
          // Store original event data for detailed view
          rawData: event,
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    navigate(`/gig/my-events/${event.id}`);
  };

  return (
    <div className="gig-events">
      <h1>Manage your Events</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <p>No events found. Join a pool to get started!</p>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <Event
              key={event.id}
              event={event}
              viewType="gigs"
              onClick={handleEventClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GigEvents;
