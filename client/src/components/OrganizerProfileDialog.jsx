import React from 'react';
import './OrganizerProfileDialog.scss';

const OrganizerProfileDialog = ({ isOpen, onClose, organizer }) => {
  if (!isOpen || !organizer) return null;

  const getInitials = (name) => {
    if (!name) return 'O';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="organizer-profile-dialog-overlay" onClick={onClose}>
      <div className="organizer-profile-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Organizer Profile</h2>
          <button className="btn-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="dialog-body">
          <div className="profile-header">
            <div className="profile-avatar">
              {organizer.profile_image_url || organizer.avatar ? (
                <img src={organizer.profile_image_url || organizer.avatar} alt={organizer.name} />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-text">{getInitials(organizer.name)}</span>
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{organizer.name || organizer.fullName || 'Unknown Organizer'}</h3>
              {organizer.email && (
                <p className="email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {organizer.email}
                </p>
              )}
              {organizer.phone && (
                <p className="phone">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22 20.4728 21.5523 20.92 21 20.92H19C8.50659 20.92 0 12.4134 0 1.92C0 1.36772 0.447715 0.92 1 0.92H4C4.55228 0.92 5 1.36772 5 1.92V5.92C5 6.47228 4.55228 6.92 4 6.92H3C3 11.3383 6.58172 14.92 11 14.92V13.92C11 13.3677 11.4477 12.92 12 12.92H16C16.5523 12.92 17 13.3677 17 13.92C17 14.4723 17.4477 14.92 18 14.92H21C21.5523 14.92 22 15.3677 22 15.92V16.92Z" fill="currentColor"/>
                  </svg>
                  {organizer.phone}
                </p>
              )}
              {organizer.rating && (
                <div className="rating">
                  <span className="rating-stars">⭐ {organizer.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-details">
            {organizer.bio && (
              <div className="detail-section">
                <h4>Bio</h4>
                <p>{organizer.bio}</p>
              </div>
            )}

            {organizer.skills && organizer.skills.length > 0 && (
              <div className="detail-section">
                <h4>Skills</h4>
                <div className="skills-list">
                  {organizer.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {organizer.location && (
              <div className="detail-section">
                <h4>Location</h4>
                <p>
                  {typeof organizer.location === 'string'
                    ? organizer.location
                    : `${organizer.location.city || ''}, ${organizer.location.state || ''}, ${organizer.location.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')}
                </p>
              </div>
            )}

            {organizer.assignments && organizer.assignments.length > 0 && (
              <div className="detail-section">
                <h4>Current Assignments</h4>
                <div className="assignments-list">
                  {organizer.assignments.map((assignment, index) => (
                    <div key={index} className="assignment-item">
                      <div className="assignment-header">
                        <div className="assignment-event-title">{assignment.eventTitle}</div>
                        <span className={`assignment-status status-${assignment.status}`}>
                          {assignment.status}
                        </span>
                      </div>
                      {assignment.poolName && (
                        <div className="assignment-pool">Pool: {assignment.poolName}</div>
                      )}
                      {assignment.skills && assignment.skills.length > 0 && (
                        <div className="assignment-skills">
                          <span className="skills-label">Required Skills:</span>
                          {assignment.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag-sm">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {organizer.pools && organizer.pools.length > 0 && (!organizer.assignments || organizer.assignments.length === 0) && (
              <div className="detail-section">
                <h4>Active in Pools</h4>
                <div className="pools-list">
                  {organizer.pools.map((pool, index) => (
                    <div key={index} className="pool-item">
                      <div className="pool-name">{pool.poolName}</div>
                      {pool.eventTitle && (
                        <div className="pool-event">Event: {pool.eventTitle}</div>
                      )}
                      {pool.skills && pool.skills.length > 0 && (
                        <div className="pool-skills">
                          {pool.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag-sm">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {organizer.createdAt && (
              <div className="detail-section">
                <h4>Member Since</h4>
                <p>{formatDate(organizer.createdAt)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-close-footer" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfileDialog;
