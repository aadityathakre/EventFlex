import React from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonPrimary from './ButtonPrimary';
import './NavigationBar.scss';

const NavigationBar = ({ onOpenAuth }) => {
  const navigate = useNavigate();

  const handleHostEvent = () => {
    if (onOpenAuth) {
      onOpenAuth('register');
    }
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-text">EVENTFLEX</span>
        </div>

        <div className="nav-links">
          <a href="#hosts" className="nav-link">FOR HOSTS</a>
          <a href="#organizers" className="nav-link">FOR ORGANIZERS</a>
          <a href="#gig-workers" className="nav-link">FOR GIG WORKERS</a>
          <a onClick={() => navigate('/admin/login')} className="nav-link admin-link">ADMIN</a>
        </div>

        <div className="nav-cta">
          <ButtonPrimary onClick={handleHostEvent}>Host Event</ButtonPrimary>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
