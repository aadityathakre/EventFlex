import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTeamDialog from '../../components/CreateTeamDialog';
import ViewApplicationDialog from '../../components/ViewApplicationDialog';
import './EventDetails.scss';

function OrganizerEventDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('teams');
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [viewApplicationDialogOpen, setViewApplicationDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const event = {
    title: 'Wedding #1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
    startDate: '23 Nov 2025',
    startTime: '1:00 AM',
    endDate: '25 Nov 2025',
    endTime: '11:00 AM',
    location: 'location addresss',
  };

  const teams = [
    {
      id: 1,
      name: 'Tech management team',
      avatar: 'TM',
      members: 0,
    },
    {
      id: 2,
      name: 'Sound management',
      avatar: 'SM',
      members: 4,
    },
    {
      id: 3,
      name: 'Decoration management',
      avatar: 'DM',
      members: 0,
    },
  ];

  const applications = [
    {
      id: 1,
      name: 'Iswaran',
      avatar: 'IS',
      team: null,
    },
    {
      id: 2,
      name: 'Sound management',
      avatar: 'SM',
      team: 'Sound management',
    },
    {
      id: 3,
      name: 'Decoration management',
      avatar: 'DM',
      team: 'Decoration management',
    },
  ];

  const handleBack = () => {
    navigate('/organizer/events');
  };

  const handleCreateTeam = () => {
    setCreateTeamDialogOpen(true);
  };

  const handleCloseCreateTeamDialog = () => {
    setCreateTeamDialogOpen(false);
  };

  const handleRemoveTeam = (team) => {
    console.log('Remove team:', team);
  };

  const handleFindGigWorkers = () => {
    console.log('Find gig workers');
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setViewApplicationDialogOpen(true);
  };

  const handleCloseViewApplicationDialog = () => {
    setViewApplicationDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleChat = (application) => {
    console.log('Chat with:', application);
  };

  const handleAccept = (application) => {
    console.log('Accept application:', application);
    setViewApplicationDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleReject = (application) => {
    console.log('Reject application:', application);
    setViewApplicationDialogOpen(false);
    setSelectedApplication(null);
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
    <div className="organizer-event-details">
      <div className="event-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <button className="create-team-button" onClick={handleCreateTeam}>
          Create new Team
        </button>
      </div>

      <div className="event-info">
        <div className="event-title-section">
          <h1>{event.title}</h1>
          <p className="event-description">{event.description}</p>
        </div>

        <div className="event-details-grid">
          <div className="detail-item">
            <span className="detail-label">START</span>
            <span className="detail-value">{event.startDate} from {event.startTime}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Location</span>
            <span className="detail-value">{event.location}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">END</span>
            <span className="detail-value">{event.endDate} from {event.endTime}</span>
          </div>
        </div>
      </div>

      <div className="tabs-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            TEAMS
          </button>
          <button
            className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            APPLICATIONS
          </button>
          <button
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            MANAGE EVENT
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'teams' && (
            <div className="teams-list">
              {teams.map((team) => (
                <div key={team.id} className="team-row">
                  <div className="team-info">
                    <div className="team-avatar">
                      <span className="avatar-text">{team.avatar}</span>
                    </div>
                    <span className="team-name">{team.name}</span>
                  </div>

                  <div className="team-actions">
                    <span className="members-count">{team.members} Members</span>
                    <button
                      className="action-button remove"
                      onClick={() => handleRemoveTeam(team)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button className="find-gig-workers-button" onClick={handleFindGigWorkers}>
                Find Gig workers
              </button>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-list">
              {applications.map((application) => (
                <div key={application.id} className="application-row">
                  <div className="application-info">
                    <div className="application-avatar">
                      <span className="avatar-text">{getInitials(application.name)}</span>
                    </div>
                    <span className="application-name">{application.name}</span>
                  </div>

                  <div className="application-actions">
                    <button
                      className="action-button chat"
                      onClick={() => handleChat(application)}
                    >
                      Chat
                    </button>
                    <button
                      className="action-button view-application"
                      onClick={() => handleViewApplication(application)}
                    >
                      View full application
                    </button>
                    <button
                      className="action-button accept"
                      onClick={() => handleAccept(application)}
                    >
                      Accept
                    </button>
                    <button
                      className="action-button reject"
                      onClick={() => handleReject(application)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="manage-content">
              <p>Event management options will be displayed here</p>
            </div>
          )}
        </div>
      </div>

      <CreateTeamDialog
        isOpen={createTeamDialogOpen}
        onClose={handleCloseCreateTeamDialog}
      />

      <ViewApplicationDialog
        isOpen={viewApplicationDialogOpen}
        onClose={handleCloseViewApplicationDialog}
        application={selectedApplication}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
}

export default OrganizerEventDetails;
