import React, { useState } from 'react';
import Dialog from './Dialog';
import './CreateTeamDialog.scss';

const CreateTeamDialog = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    description: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Create team:', formData);
    setFormData({ teamName: '', description: '' });
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="create-team-dialog">
      <div className="dialog-header">
        <h2 className="dialog-title">Create Team</h2>
      </div>

      <div className="dialog-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="teamName"
              placeholder="Team name"
              value={formData.teamName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="6"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Create Team
          </button>

          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </Dialog>
  );
};

export default CreateTeamDialog;
