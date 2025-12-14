import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BROWSE_CATEGORIES, VENUES_DATA } from '../constants';
import './LandingPageCategoriesSection.scss';

const LandingPageCategoriesSection = () => {
  const [activeCategory, setActiveCategory] = useState(BROWSE_CATEGORIES[0].value);
  const [currentSlide, setCurrentSlide] = useState(0);

  const venues = VENUES_DATA[activeCategory] || [];
  const venuesPerSlide = 3;
  const totalSlides = Math.ceil(venues.length / venuesPerSlide);

  const handleCategoryChange = (categoryValue) => {
    setActiveCategory(categoryValue);
    setCurrentSlide(0);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const displayedVenues = venues.slice(
    currentSlide * venuesPerSlide,
    (currentSlide + 1) * venuesPerSlide
  );

  return (
    <section className="categories-section">
      <div className="categories-container">
        <h2 className="section-title">BROWSE BY CATEGORIES</h2>

        <div className="categories-tabs">
          {BROWSE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.value ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="venues-grid-wrapper">
          {totalSlides > 1 && currentSlide > 0 && (
            <button className="prev-button" onClick={handlePrevSlide}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 8L12 16L20 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <div className="venues-grid">
            {displayedVenues.map((venue) => (
              <Link key={venue.id} to={venue.link} className="venue-card">
                <div className="venue-image-placeholder"></div>
                <div className="venue-info">
                  <h3 className="venue-name">{venue.name}</h3>
                  <p className="venue-price">Starts from {venue.price}</p>
                </div>
              </Link>
            ))}
          </div>

          {totalSlides > 1 && currentSlide < totalSlides - 1 && (
            <button className="next-button" onClick={handleNextSlide}>
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
          )}
        </div>
      </div>
    </section>
  );
};

export default LandingPageCategoriesSection;
