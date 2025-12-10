import React from 'react';
import './Event.scss';

const Event = ({ event, viewType = 'pools', onManage, onApply }) => {
  const renderPools = () => {
    const poolsCount = event.pools || 0;
    return (
      <div className="event-footer pools-view">
        <div className="pools-info">
          {poolsCount === 0 ? 'NO POOLS ASSIGNED' : `${poolsCount} POOLS ASSIGNED`}
        </div>
        <button className="manage-button" onClick={() => onManage && onManage(event)}>
          MANAGE →
        </button>
      </div>
    );
  };

  const renderOrganizers = () => {
    const organizersCount = event.organizers || 0;
    return (
      <div className="event-footer organizers-view">
        <div className="organizers-info">
          {organizersCount === 0 ? 'NO ORGANIZERS' : `${organizersCount} ORGANIZERS`}
        </div>
        <button className="manage-button" onClick={() => onManage && onManage(event)}>
          MANAGE →
        </button>
      </div>
    );
  };

  const renderAvailableGigs = () => {
    return (
      <div className="event-footer available-gigs-view">
        {event.organizer && (
          <div className="organizer-section">
            <span className="organizer-label">Organizer</span>
            <div className="organizer-details">
              <span className="organizer-name">{event.organizer.name}</span>
              {event.organizer.rating && (
                <div className="organizer-rating">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`star ${index < event.organizer.rating ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="gigs-available-label">Gigs Available</div>

        <div className="gigs-list">
          {event.availableGigs && event.availableGigs.map((gig, index) => (
            <div key={index} className="gig-item">
              <div className="gig-info">
                <h4 className="gig-title">{gig.title}</h4>
                <p className="gig-description">{gig.description}</p>
                {gig.applied && (
                  <p className="gig-applied">{gig.applied} Peoples applied</p>
                )}
              </div>
              <button
                className="apply-button"
                onClick={() => onApply && onApply(event, gig)}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGigs = () => {
    return (
      <div className="event-footer gigs-view">
        <div className="your-gigs-label">YOUR GIGS</div>
        <div className="gigs-pills">
          {event.gigs && event.gigs.map((gig, index) => (
            <div key={index} className="gig-pill">
              {gig.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    switch (viewType) {
      case 'pools':
        return renderPools();
      case 'organizers':
        return renderOrganizers();
      case 'available_gigs':
        return renderAvailableGigs();
      case 'gigs':
        return renderGigs();
      default:
        return renderPools();
    }
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-main">
          <h3 className="event-title">{event.title}</h3>
          <p className="event-description">{event.description}</p>
        </div>

        <div className="event-details">
          <div className="event-time">
            <span className="detail-label">START</span>
            <span className="detail-value">{event.startDate} from {event.startTime}</span>
            <span className="detail-label">END</span>
            <span className="detail-value">{event.endDate} from {event.endTime}</span>
          </div>

          <div className="event-location">
            <span className="detail-label">Location</span>
            <span className="detail-value">{event.location}</span>
          </div>
        </div>

        {viewType !== 'available_gigs' && (
          <button className="arrow-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {renderFooter()}
    </div>
  );
};

export default Event;
