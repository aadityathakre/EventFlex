import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateEvent.scss';

function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventType: '',
    startTime: '',
    endTime: '',
    budget: '',
  });

  const eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday Party',
    'Conference',
    'Concert',
    'Festival',
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Create event:', formData);
    // Navigate back to events page after creation
    navigate('/host/events');
  };

  const handleBack = () => {
    navigate('/host/events');
  };

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
          <h1>Create New Event</h1>

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
                    <option key={type} value={type}>
                      {type}
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

            <button type="submit" className="submit-button">
              Create Event
            </button>
          </form>
        </div>

        <div className="preview-section">
          <div className="preview-card">
            <div className="preview-header">
              <h2>{formData.eventName || 'Wedding #1'}</h2>
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

export default CreateEvent;
