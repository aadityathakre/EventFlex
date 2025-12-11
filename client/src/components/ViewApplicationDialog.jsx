import React from 'react';
import Dialog from './Dialog';
import './ViewApplicationDialog.scss';

const ViewApplicationDialog = ({ isOpen, onClose, application, onAccept, onReject }) => {
  if (!application) return null;

  const applicantDetails = {
    name: 'Iswaran',
    avatar: 'IS',
    email: 'iswaran@mail.com',
    phone: '+91 8725293840',
    bio: 'I can manage tech & sound systems.',
    location: 'MP, IN',
    rating: 4,
    proposedRate: '$180',
    coverMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(application);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(application);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="view-application-dialog">
      <div className="dialog-content">
        <div className="applicant-sidebar">
          <h2 className="sidebar-title">Review Application</h2>

          <div className="applicant-info">
            <div className="applicant-avatar">
              <span className="avatar-text">{applicantDetails.avatar}</span>
            </div>
            <h3 className="applicant-name">{applicantDetails.name}</h3>
          </div>

          <div className="applicant-details">
            <div className="detail-section">
              <span className="detail-label">EMAIL</span>
              <span className="detail-value">{applicantDetails.email}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">PHONE</span>
              <span className="detail-value">{applicantDetails.phone}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">BIO</span>
              <span className="detail-value">{applicantDetails.bio}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">LOCATION</span>
              <span className="detail-value">{applicantDetails.location}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">RATING</span>
              <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className={`star ${index < applicantDetails.rating ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="application-main">
          <div className="application-section">
            <h3 className="section-title">APPLICATION</h3>

            <div className="application-detail">
              <span className="detail-label">Proposed rate</span>
              <span className="detail-value large">{applicantDetails.proposedRate}</span>
            </div>

            <div className="application-detail">
              <span className="detail-label">Cover message</span>
              <p className="detail-text">{applicantDetails.coverMessage}</p>
            </div>
          </div>

          <div className="action-buttons">
            <button className="reject-button" onClick={handleReject}>
              Reject application
            </button>
            <button className="accept-button" onClick={handleAccept}>
              Accept application
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ViewApplicationDialog;
