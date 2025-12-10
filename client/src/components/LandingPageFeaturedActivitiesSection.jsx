import React from 'react';
import { Link } from 'react-router-dom';
import { FEATURED_ACTIVITIES } from '../constants';
import './LandingPageFeaturedActivitiesSection.scss';

const LandingPageFeaturedActivitiesSection = () => {
  return (
    <section className="featured-activities-section">
      <div className="featured-activities-container">
        <h2 className="section-title">FEATURED ACTIVITIES</h2>

        <div className="activities-grid">
          {FEATURED_ACTIVITIES.map((activity) => (
            <Link key={activity.id} to={activity.link} className="activity-card">
              <div className="activity-image-placeholder"></div>
              <div className="activity-name">{activity.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPageFeaturedActivitiesSection;
