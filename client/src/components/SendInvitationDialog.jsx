import React, { useState } from 'react';
import Dialog from './Dialog';
import './SendInvitationDialog.scss';

const SendInvitationDialog = ({ isOpen, onClose, organizer, events = [] }) => {
  const [formData, setFormData] = useState({
    eventId: '',
    requiredSkills: '',
    payRange: '',
    location: '',
    maxCapacity: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Send invitation:', { organizer, ...formData });
    onClose();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="send-invitation-dialog">
      <div className="invitation-header">
        <h2 className="invitation-title">Send Invitation</h2>
      </div>

      <div className="invitation-body">
        {organizer && (
          <div className="organizer-info">
            <div className="organizer-avatar">
              <span className="avatar-text">{getInitials(organizer.name)}</span>
            </div>
            <span className="organizer-name">{organizer.name}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            <svg className="select-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="requiredSkills"
              placeholder="Required skills"
              value={formData.requiredSkills}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="payRange"
              placeholder="Pay range"
              value={formData.payRange}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="maxCapacity"
              placeholder="Max Capacity"
              value={formData.maxCapacity}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Send Invitation
          </button>

          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </Dialog>
  );
};

export default SendInvitationDialog;
