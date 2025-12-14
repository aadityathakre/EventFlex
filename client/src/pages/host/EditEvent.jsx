import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvent, editEvent } from '../../api/host';
import './CreateEvent.scss';

function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventType: '',
    startTime: '',
    endTime: '',
    budget: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const eventTypes = [
    { value: 'function', label: 'Function' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'festival', label: 'Festival' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'networking', label: 'Networking' },
    { value: 'fundraiser', label: 'Fundraiser' },
    { value: 'retreat', label: 'Retreat' },
  ];

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEvent(id);
      const eventData = response.data.data || response.data.event || response.data;

      console.log('Fetched event data for editing:', eventData);

      // Convert dates to datetime-local format (YYYY-MM-DDTHH:MM)
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        eventName: eventData.title || '',
        description: eventData.description || '',
        eventType: eventData.event_type || '',
        startTime: formatDateForInput(eventData.start_date),
        endTime: formatDateForInput(eventData.end_date),
        budget: eventData.budget?.$numberDecimal || eventData.budget || '',
      });
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError(err.response?.data?.message || 'Failed to fetch event data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Transform form data to match API structure from Postman collection
      const eventData = {
        title: formData.eventName,
        description: formData.description,
        event_type: formData.eventType,
        start_date: new Date(formData.startTime).toISOString(),
        end_date: new Date(formData.endTime).toISOString(),
        location: {
          type: 'Point',
          coordinates: [77.4126, 23.2599], // Default coordinates, can be updated with geolocation
        },
        budget: formData.budget,
      };

      console.log('Updating event with data:', eventData);
      const response = await editEvent(id, eventData);
      console.log('Event updated successfully:', response.data);

      // Navigate back to event details page after successful update
      navigate(`/host/events/${id}`);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/host/events/${id}`);
  };

  if (loading) {
    return (
      <div className="create-event">
        <div className="loading-state">
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event">
      <button className="back-button" onClick={handleBack}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <div className="create-event-container">
        <div className="form-section">
          <h1>Edit Event</h1>

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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                name="eventName"
                placeholder="Wedding #1"
                value={formData.eventName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Enter event description..."
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Event type</label>
              <div className="select-wrapper">
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <svg className="select-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="time-group">
              <div className="form-group">
                <label>Start time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>End time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Budget</label>
              <input
                type="text"
                name="budget"
                placeholder="Enter budget amount"
                value={formData.budget}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={saving}>
              {saving ? 'Updating Event...' : 'Update Event'}
            </button>
          </form>
        </div>

        <div className="preview-section">
          <div className="preview-card">
            <div className="preview-header">
              <h2>{formData.eventName || 'Event Preview'}</h2>
            </div>
            <div className="preview-body">
              {/* Preview content will be displayed here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;
