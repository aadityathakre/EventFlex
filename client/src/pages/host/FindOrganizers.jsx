import React, { useState, useEffect } from 'react';
import SendInvitationDialog from '../../components/SendInvitationDialog';
import OrganizerProfileDialog from '../../components/OrganizerProfileDialog';
import { getOrganizers, getEvents } from '../../api/host';
import './FindOrganizers.scss';

function FindOrganizers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch organizers and events on component mount
  useEffect(() => {
    fetchOrganizers();
    fetchEvents();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrganizers();

      // Extract data from response - it's an array of assignments with nested organizer objects
      const assignmentsData = response.data.data || [];

      // Map to extract unique organizers and add pool/event context
      const organizersMap = new Map();

      assignmentsData.forEach((assignment) => {
        const org = assignment.organizer;
        if (org && org._id) {
          // If organizer already exists, just add the new pool info
          if (organizersMap.has(org._id)) {
            const existing = organizersMap.get(org._id);
            existing.pools.push({
              poolName: assignment.pool_name,
              eventTitle: assignment.event?.title,
              skills: assignment.required_skills,
            });
          } else {
            // Create new organizer entry with pool context
            organizersMap.set(org._id, {
              ...org,
              id: org._id,
              name: org.fullName || `${org.first_name} ${org.last_name}`,
              profile_image_url: org.avatar,
              skills: assignment.required_skills || [],
              rating: org.rating || null,
              pools: [{
                poolName: assignment.pool_name,
                eventTitle: assignment.event?.title,
                skills: assignment.required_skills,
              }],
            });
          }
        }
      });

      // Convert map to array
      const organizersData = Array.from(organizersMap.values());
      setOrganizers(organizersData);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError(err.response?.data?.message || 'Failed to fetch organizers');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      const eventsData = response.data.data || response.data.events || [];

      // Transform events to simple format for dropdown
      const transformedEvents = eventsData.map((event) => ({
        id: event._id,
        title: event.title,
      }));

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      // Don't set error here, just log it - organizers list is more important
    }
  };

  const handleViewProfile = (organizer) => {
    setSelectedOrganizer(organizer);
    setProfileDialogOpen(true);
  };

  const handleInvite = (organizer) => {
    setSelectedOrganizer(organizer);
    setInviteDialogOpen(true);
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    setSelectedOrganizer(null);
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    setSelectedOrganizer(null);
  };

  const getInitials = (name) => {
    if (!name) return 'O';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredOrganizers = organizers.filter((org) => {
    const name = org.name || '';
    const skills = org.skills || [];

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(skills) && skills.some(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  });

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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading organizers...</p>
        </div>
      ) : (
        <div className="organizers-table">
          <div className="table-header">
            <div className="header-cell name">NAME</div>
            <div className="header-cell skills">SKILLS</div>
            <div className="header-cell rating">RATING</div>
            <div className="header-cell actions"></div>
          </div>

          <div className="table-body">
            {filteredOrganizers.length === 0 ? (
              <div className="empty-state">
                <p>No organizers found</p>
              </div>
            ) : (
              filteredOrganizers.map((organizer) => (
                <div key={organizer._id || organizer.id} className="table-row">
                  <div className="cell name">
                    {organizer.profile_image_url ? (
                      <div className="organizer-avatar">
                        <img
                          src={organizer.profile_image_url}
                          alt={organizer.name}
                          className="avatar-image"
                        />
                      </div>
                    ) : (
                      <div className="organizer-avatar">
                        <span className="avatar-text">{getInitials(organizer.name)}</span>
                      </div>
                    )}
                    <span className="organizer-name">{organizer.name || 'Unknown'}</span>
                  </div>
                  <div className="cell skills">
                    {organizer.skills && organizer.skills.length > 0 ? (
                      <div className="skills-list">
                        {organizer.skills.slice(0, 2).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                        {organizer.skills.length > 2 && (
                          <span className="skill-tag">+{organizer.skills.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </div>
                  <div className="cell rating">
                    {organizer.rating ? (
                      <span className="rating-value">⭐ {organizer.rating.toFixed(1)}</span>
                    ) : (
                      <span className="no-data">-</span>
                    )}
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
              ))
            )}
          </div>
        </div>
      )}

      <SendInvitationDialog
        isOpen={inviteDialogOpen}
        onClose={handleCloseInviteDialog}
        organizer={selectedOrganizer}
        events={events}
      />

      <OrganizerProfileDialog
        isOpen={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        organizer={selectedOrganizer}
      />
    </div>
  );
}

export default FindOrganizers;
