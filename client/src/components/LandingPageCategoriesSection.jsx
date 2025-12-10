import React from 'react';
import './LandingPageCategoriesSection.scss';

const LandingPageCategoriesSection = () => {
  const categories = [
    'MULTI-PURPOSE',
    'WEDDING CELEBRATION',
    'BIRTHDAY PARTY',
    'DINNER HOUSE',
    'NIGHTOUT',
  ];

  const venues = [
    {
      name: 'Resort Palace',
      price: '₹4000/hr',
    },
    {
      name: 'Resort Palace',
      price: '₹4000/hr',
    },
    {
      name: 'Resort Palace',
      price: '₹4000/hr',
    },
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">
        <h2 className="section-title">BROWSE BY CATEGORIES</h2>

        <div className="categories-tabs">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`category-tab ${index === 0 ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="venues-grid">
          {venues.map((venue, index) => (
            <div key={index} className="venue-card">
              <div className="venue-image-placeholder"></div>
              <div className="venue-info">
                <h3 className="venue-name">{venue.name}</h3>
                <p className="venue-price">Starts from {venue.price}</p>
              </div>
            </div>
          ))}

          <button className="next-button">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8L20 16L12 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingPageCategoriesSection;
