import React, { useState, useRef, useEffect } from 'react';
import { EVENT_CATEGORIES } from '../constants';
import './HeroSearch.scss';

const HeroSearch = () => {
  const [selectedCategory, setSelectedCategory] = useState(EVENT_CATEGORIES[0].label);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.label);
    setIsDropdownOpen(false);
  };

  const handleSearch = () => {
    console.log('Searching for:', { category: selectedCategory, query: searchQuery });
  };

  return (
    <div className="hero-search">
      <div className="search-category" ref={dropdownRef}>
        <button
          className="category-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="category-text">{selectedCategory}</span>
          <svg
            className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
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

        {isDropdownOpen && (
          <div className="category-dropdown">
            {EVENT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`dropdown-item ${selectedCategory === category.label ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="search-divider"></div>

      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Find your Venue"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <button className="search-button" onClick={handleSearch}>
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
