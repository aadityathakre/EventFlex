import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Event from '../../components/Event';
import { getEvents } from '../../api/host';
import './Events.scss';

function HostEvents() {
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
      const response = await getEvents();

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
          organizers: event.organizer_count || 0,
          status: event.status,
          budget: event.budget?.$numberDecimal || event.budget,
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
    navigate(`/host/events/${event.id}`);
  };

  const handleManage = (event) => {
    navigate(`/host/events/${event.id}`);
  };

  const handleCreateEvent = () => {
    navigate('/host/events/create');
  };

  return (
    <div className="host-events">
      <div className="events-header">
        <h1>Manage your Events</h1>
        <button className="create-event-button" onClick={handleCreateEvent}>
          Create a new Event
        </button>
      </div>

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
          <p>No events found. Create your first event!</p>
          <button className="create-event-button-secondary" onClick={handleCreateEvent}>
            Create Event
          </button>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <Event
              key={event.id}
              event={event}
              viewType="organizers"
              onManage={handleManage}
              onClick={handleEventClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HostEvents;
