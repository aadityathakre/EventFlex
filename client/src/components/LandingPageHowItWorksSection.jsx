import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../constants';
import './LandingPageHowItWorksSection.scss';

const LandingPageHowItWorksSection = () => {
  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <h2 className="section-title">How it Works?</h2>

        <div className="steps-grid">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPageHowItWorksSection;
