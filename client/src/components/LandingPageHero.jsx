import React from 'react';
import NavigationBar from './NavigationBar';
import HeroSearch from './HeroSearch';
import './LandingPageHero.scss';

const LandingPageHero = ({ onOpenAuth }) => {
  return (
    <section className="landing-hero">
      <NavigationBar onOpenAuth={onOpenAuth} />

      <div className="hero-content">
        <div className="hero-container">
          <h1 className="hero-title">
            Connect with Event Professionals<br />
            for Your Perfect Event
          </h1>
          <p className="hero-subtitle">
            The marketplace for hosts, organizers, and gig workers to collaborate and create unforgettable events
          </p>

          <div className="hero-cta">
            <button className="cta-button primary" onClick={() => onOpenAuth('register')}>
              Get Started
            </button>
            <button className="cta-button secondary" onClick={() => onOpenAuth('login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPageHero;
