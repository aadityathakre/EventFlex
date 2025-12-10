import React from 'react';
import ButtonPrimary from './ButtonPrimary';
import './NavigationBar.scss';

const NavigationBar = () => {
  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-text">EVENTFLEX</span>
        </div>

        <div className="nav-links">
          <a href="#organisers" className="nav-link">FOR ORGANISERS</a>
          <a href="#visitors" className="nav-link">FOR VISITORS</a>
          <a href="#staffs" className="nav-link">FOR STAFFS</a>
        </div>

        <div className="nav-cta">
          <ButtonPrimary>Book your Venue</ButtonPrimary>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
