import React, { useState } from 'react';
import './HeroSearch.scss';

const HeroSearch = () => {
  const [selectedCategory, setSelectedCategory] = useState('Wedding');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="hero-search">
      <div className="search-category">
        <button className="category-button">
          <span className="category-text">{selectedCategory}</span>
          <svg
            className="dropdown-icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="search-divider"></div>

      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Find your Venue"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <button className="search-button">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default HeroSearch;
