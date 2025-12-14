import React, { useState } from 'react';
import Dialog from './Dialog';
import './ApplyGigDialog.scss';

const ApplyGigDialog = ({ isOpen, onClose, gig }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    proposedRate: '',
    coverLetter: '',
  });

  if (!gig) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit application:', formData);
    setStep(1);
    setFormData({ proposedRate: '', coverLetter: '' });
    onClose();
  };

  const handleCancel = () => {
    setStep(1);
    setFormData({ proposedRate: '', coverLetter: '' });
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel} className="apply-gig-dialog">
      <div className="dialog-content">
        <div className="gig-sidebar">
          <h2 className="sidebar-title">Apply for Gig</h2>

          <div className="gig-details">
            <div className="detail-section">
              <span className="detail-label">GIG</span>
              <span className="detail-value">{gig.event?.title} / {gig.title}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">LOCATION</span>
              <span className="detail-value">{gig.event?.location || 'MP, IN'}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">START TIME</span>
              <span className="detail-value">{gig.event?.startDate} from {gig.event?.startTime}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">END TIME</span>
              <span className="detail-value">{gig.event?.endDate} from {gig.event?.endTime}</span>
            </div>
          </div>

          <div className="organizer-section">
            <span className="detail-label">ORGANIZER</span>
            <div className="organizer-info">
              <div className="organizer-avatar">
                <span className="avatar-text">IS</span>
              </div>
              <span className="organizer-name">{gig.event?.organizer?.name || 'Iswaran'}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">RATING</span>
              <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className={`star ${index < (gig.event?.organizer?.rating || 4) ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="application-main">
          {step === 1 ? (
            <>
              <div className="application-section">
                <h3 className="section-title">APPLICATION</h3>

                <div className="application-detail">
                  <h4 className="detail-heading">ABOUT EVENT</h4>
                  <p className="detail-text">{gig.event?.description}</p>
                </div>

                <div className="application-detail">
                  <h4 className="detail-heading">ABOUT GIG</h4>
                  <p className="detail-text">{gig.description}</p>

                  {gig.responsibilities && (
                    <>
                      <p className="detail-subheading">Responsibilities -</p>
                      <ol className="responsibilities-list">
                        {gig.responsibilities.map((resp, index) => (
                          <li key={index}>{resp}</li>
                        ))}
                      </ol>
                    </>
                  )}
                </div>
              </div>

              <div className="action-buttons">
                <button className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="next-button" onClick={handleNext}>
                  Write application
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="application-section">
                <h3 className="section-title">APPLICATION</h3>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>PROPOSE RATE</label>
                    <input
                      type="text"
                      name="proposedRate"
                      placeholder="Enter your proposed rate"
                      value={formData.proposedRate}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>COVER LETTER</label>
                    <textarea
                      name="coverLetter"
                      placeholder="Write your cover letter..."
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="8"
                      required
                    />
                  </div>

                  <div className="action-buttons">
                    <button type="button" className="cancel-button" onClick={handleBack}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-button">
                      Send proposal
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ApplyGigDialog;
