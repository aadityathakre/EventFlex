import React, { useState } from 'react';
import Dialog from './Dialog';
import { inviteOrganizer } from '../api/host';
import './SendInvitationDialog.scss';

const SendInvitationDialog = ({ isOpen, onClose, organizer, events = [] }) => {
  const [formData, setFormData] = useState({
    eventId: '',
    requiredSkills: '',
    payRange: '',
    location: '',
    maxCapacity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter out events where organizer is already assigned
  const availableEvents = events.filter(event => {
    if (!organizer?.assignments) return true;

    // Check if organizer is already assigned to this event
    return !organizer.assignments.some(assignment => assignment.eventId === event.id);
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!organizer) {
      setError('No organizer selected');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare invitation data - match backend field names
      const invitationData = {
        organizerId: organizer._id || organizer.id,
        eventId: formData.eventId,
        pool_name: `Pool for ${organizer.name}`, // Generate a pool name
        required_skills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        pay_range: formData.payRange,
        location: {
          type: "Point",
          coordinates: formData.location.split(',').map(coord => parseFloat(coord.trim()))
        },
        max_capacity: parseInt(formData.maxCapacity, 10),
      };

      console.log('Sending invitation:', invitationData);

      await inviteOrganizer(invitationData);

      // Reset form and close dialog
      setFormData({
        eventId: '',
        requiredSkills: '',
        payRange: '',
        location: '',
        maxCapacity: '',
      });

      alert('Invitation sent successfully!');
      onClose();
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
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
              {organizer.profile_image_url ? (
                <img src={organizer.profile_image_url} alt={organizer.name} className="avatar-image" />
              ) : (
                <span className="avatar-text">{getInitials(organizer.name)}</span>
              )}
            </div>
            <span className="organizer-name">{organizer.name}</span>
          </div>
        )}

        {error && (
          <div className="error-message" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33'
          }}>
            {error}
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
              disabled={loading}
            >
              <option value="">Select event</option>
              {availableEvents.length === 0 ? (
                <option value="" disabled>No available events (organizer already assigned to all)</option>
              ) : (
                availableEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))
              )}
            </select>
            <svg className="select-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="requiredSkills"
              placeholder="Required skills (comma-separated)"
              value={formData.requiredSkills}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="location"
              placeholder="Location (longitude, latitude)"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>

          <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </form>
      </div>
    </Dialog>
  );
};

export default SendInvitationDialog;
