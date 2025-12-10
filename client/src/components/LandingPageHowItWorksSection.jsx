import React from 'react';
import './LandingPageHowItWorksSection.scss';

const LandingPageHowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Browse your Venue',
      description: 'Find your best suiting venue from our thousand of locations',
    },
    {
      number: '02',
      title: 'Book the Palace',
      description: 'After comparing and getting best, book your venue.',
    },
    {
      number: '03',
      title: 'Enjoy with your friends & family',
      description: 'Bring your peoples, & Enjoy your visit.',
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <h2 className="section-title">How it Works?</h2>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPageHowItWorksSection;
