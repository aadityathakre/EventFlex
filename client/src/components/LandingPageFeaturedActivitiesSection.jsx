import React from 'react';
import './LandingPageFeaturedActivitiesSection.scss';

const LandingPageFeaturedActivitiesSection = () => {
  const activities = [
    { name: 'Networking' },
    { name: 'Birthday' },
    { name: 'Outdoor' },
    { name: 'Workshop' },
    { name: 'Conference' },
    { name: 'Dinner Party' },
  ];

  return (
    <section className="featured-activities-section">
      <div className="featured-activities-container">
        <h2 className="section-title">FEATURED ACTIVITIES</h2>

        <div className="activities-grid">
          {activities.map((activity, index) => (
            <div key={index} className="activity-card">
              <div className="activity-image-placeholder"></div>
              <div className="activity-name">{activity.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPageFeaturedActivitiesSection;
