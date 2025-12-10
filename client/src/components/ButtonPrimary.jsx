import React from 'react';
import './ButtonPrimary.scss';

const ButtonPrimary = ({ children, onClick, type = 'button', disabled = false, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button-primary ${className}`}
    >
      {children}
    </button>
  );
};

export default ButtonPrimary;
