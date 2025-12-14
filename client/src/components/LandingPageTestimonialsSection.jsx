import React from 'react';
import './LandingPageTestimonialsSection.scss';

const LandingPageTestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Event Host',
      avatar: null,
      rating: 5,
      text: 'EventFlex made organizing my corporate event seamless. The organizers were professional and the gig workers were skilled. Everything was handled perfectly!',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Event Organizer',
      avatar: null,
      rating: 5,
      text: 'As an organizer, this platform has connected me with amazing hosts and talented gig workers. The escrow system ensures everyone gets paid fairly and on time.',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Gig Worker',
      avatar: null,
      rating: 5,
      text: 'I love browsing events and applying to teams that match my skills. The messaging system makes communication easy, and payments are always secure.',
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Event Host',
      avatar: null,
      rating: 5,
      text: 'The platform makes it incredibly easy to find experienced organizers. My wedding was flawlessly executed thanks to the talented team I hired here.',
    },
    {
      id: 5,
      name: 'Jessica Martinez',
      role: 'Event Organizer',
      avatar: null,
      rating: 5,
      text: 'Building teams has never been easier. I can quickly create pools, review applications, and communicate with gig workers all in one place.',
    },
    {
      id: 6,
      name: 'Ryan Williams',
      role: 'Gig Worker',
      avatar: null,
      rating: 5,
      text: 'The application process is straightforward and the escrow payment system gives me confidence. I have worked on 20+ events through this platform.',
    },
  ];

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">
          Join thousands of hosts, organizers, and gig workers who trust EventFlex for their events
        </p>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  ) : (
                    <span className="avatar-initials">{getInitials(testimonial.name)}</span>
                  )}
                </div>
                <div className="testimonial-info">
                  <h4 className="testimonial-name">{testimonial.name}</h4>
                  <p className="testimonial-role">{testimonial.role}</p>
                </div>
              </div>

              <div className="testimonial-rating">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <svg
                    key={index}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>

              <p className="testimonial-text">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPageTestimonialsSection;
