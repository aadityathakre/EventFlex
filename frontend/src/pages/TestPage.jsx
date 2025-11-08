import React from 'react';
import useThemeStore from '../store/themeStore';

const TestPage = () => {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold dark:text-white text-gray-900 mb-6">
          Test Page
        </h1>
        <button 
          onClick={toggleTheme}
          className="px-4 py-2 bg-teal text-white rounded-lg"
        >
          Toggle Theme (Current: {theme})
        </button>
      </div>
    </div>
  );
};

export default TestPage;