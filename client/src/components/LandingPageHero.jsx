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
            Find & Book Spaces for Your<br />
            Creative Events
          </h1>

          <div className="hero-search-wrapper">
            <HeroSearch />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPageHero;
