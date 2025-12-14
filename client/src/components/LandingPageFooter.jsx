import React from 'react';
import './LandingPageFooter.scss';

const LandingPageFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-heading">FOR YOU</h3>
            <ul className="footer-links">
              <li><a href="#browse-venues">BROWSE VENUES</a></li>
              <li><a href="#explore-activities">EXPLORE ACTIVITIES</a></li>
              <li><a href="#signup">SIGNUP</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">FOR ORGANIZERS</h3>
            <ul className="footer-links">
              <li><a href="#list-venue">LIST YOUR VENUE</a></li>
              <li><a href="#explore-oppt">EXPLORE OPPT.</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-logo">
            <span className="logo-text">EVENTFLEX</span>
          </div>

          <div className="footer-copyright">
            <span className="copyright-symbol">©</span>
            <span className="copyright-text">Copyright 2025</span>
          </div>

          <div className="footer-legal-links">
            <a href="#refund">Refund</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPageFooter;
