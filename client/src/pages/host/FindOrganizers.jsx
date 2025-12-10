import React, { useState } from 'react';
import SendInvitationDialog from '../../components/SendInvitationDialog';
import './FindOrganizers.scss';

function FindOrganizers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);

  // Sample events for the dropdown
  const events = [
    { id: 1, title: 'Wedding #1' },
    { id: 2, title: 'Wedding #2' },
    { id: 3, title: 'Corporate Event' },
  ];

  // Sample organizers data
  const organizers = [
    {
      id: 1,
      name: 'Iswaran',
      avatar: 'IS',
      skills: ['Event Management', 'Team Leadership'],
      rating: 4.5,
    },
    {
      id: 2,
      name: 'Iswaran',
      avatar: 'IS',
      skills: ['Coordination', 'Planning'],
      rating: 4.8,
    },
    {
      id: 3,
      name: 'Iswaran',
      avatar: 'IS',
      skills: ['Logistics', 'Operations'],
      rating: 4.2,
    },
  ];

  const handleViewProfile = (organizer) => {
    console.log('View profile:', organizer);
  };

  const handleInvite = (organizer) => {
    setSelectedOrganizer(organizer);
    setInviteDialogOpen(true);
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    setSelectedOrganizer(null);
  };

  const filteredOrganizers = organizers.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="find-organizers">
      <h1>Organizers</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search organizer by name, skill"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="organizers-table">
        <div className="table-header">
          <div className="header-cell name">NAME</div>
          <div className="header-cell skills">SKILLS</div>
          <div className="header-cell rating">RATING</div>
          <div className="header-cell actions"></div>
        </div>

        <div className="table-body">
          {filteredOrganizers.map((organizer) => (
            <div key={organizer.id} className="table-row">
              <div className="cell name">
                <div className="organizer-avatar">
                  <span className="avatar-text">{organizer.avatar}</span>
                </div>
                <span className="organizer-name">{organizer.name}</span>
              </div>
              <div className="cell skills">
                {/* Skills would be displayed here */}
              </div>
              <div className="cell rating">
                {/* Rating would be displayed here */}
              </div>
              <div className="cell actions">
                <button
                  className="view-profile-button"
                  onClick={() => handleViewProfile(organizer)}
                >
                  View full profile
                </button>
                <button
                  className="invite-button"
                  onClick={() => handleInvite(organizer)}
                >
                  Invite to event
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SendInvitationDialog
        isOpen={inviteDialogOpen}
        onClose={handleCloseInviteDialog}
        organizer={selectedOrganizer}
        events={events}
      />
    </div>
  );
}

export default FindOrganizers;
