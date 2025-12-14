import React from 'react';
import './LandingPageRolesSection.scss';

const LandingPageRolesSection = () => {
  const roles = [
    {
      id: 'hosts',
      title: 'For Hosts',
      description: 'Post your event and connect with professional organizers who can bring your vision to life.',
      features: [
        'Post unlimited events',
        'Browse and invite experienced organizers',
        'Secure escrow payment system',
        'Real-time messaging with organizers',
        'Track event progress and milestones',
        'Review and rate organizers',
      ],
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="14" r="2" fill="currentColor"/>
        </svg>
      ),
    },
    {
      id: 'organizers',
      title: 'For Organizers',
      description: 'Manage events professionally by building skilled teams and delivering exceptional experiences.',
      features: [
        'Receive invitations from hosts',
        'Create and manage event teams/pools',
        'Review gig worker applications',
        'Communicate with team members',
        'Assign roles and responsibilities',
        'Earn competitive rates with secure payments',
      ],
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 21V5C16 3.89543 16.8954 3 18 3H20C21.1046 3 22 3.89543 22 5V21" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 21V12C2 10.8954 2.89543 10 4 10H6C7.10457 10 8 10.8954 8 12V21" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 21V8C9 6.89543 9.89543 6 11 6H13C14.1046 6 15 6.89543 15 8V21" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 21H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'gig-workers',
      title: 'For Gig Workers',
      description: 'Find exciting event opportunities, showcase your skills, and get paid for what you love doing.',
      features: [
        'Browse available event pools',
        'Apply to teams matching your skills',
        'Build your professional profile',
        'Direct messaging with organizers',
        'Flexible work opportunities',
        'Guaranteed payments through escrow',
      ],
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 21V19C3 16.7909 4.79086 15 7 15H11C13.2091 15 15 16.7909 15 19V21" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M21 21V19C21 16.7909 19.2091 15 17 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="roles-section">
      <div className="roles-container">
        <h2 className="section-title">Built for Everyone in Events</h2>
        <p className="section-subtitle">
          Whether you're hosting, organizing, or working events, EventFlex has the tools you need
        </p>

        <div className="roles-grid">
          {roles.map((role) => (
            <div key={role.id} id={role.id} className="role-card">
              <div className="role-icon">{role.icon}</div>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-description">{role.description}</p>

              <ul className="role-features">
                {role.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPageRolesSection;
