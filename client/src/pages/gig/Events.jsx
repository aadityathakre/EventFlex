import React from 'react';
import { useNavigate } from 'react-router-dom';
import Event from '../../components/Event';
import './Events.scss';

function GigEvents() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: 'Wedding #1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
      startDate: '23 Nov 2025',
      startTime: '1:00 AM',
      endDate: '25 Nov 2025',
      endTime: '11:00 AM',
      location: 'location addresss',
      gigs: [
        { title: 'Sounding system management' },
        { title: 'Crowd management' },
      ],
    },
    {
      id: 2,
      title: 'Wedding #1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
      startDate: '23 Nov 2025',
      startTime: '1:00 AM',
      endDate: '25 Nov 2025',
      endTime: '11:00 AM',
      location: 'location addresss',
      gigs: [
        { title: 'Sounding system management' },
        { title: 'Crowd management' },
      ],
    },
  ];

  const handleEventClick = (event) => {
    navigate(`/gig/my-events/${event.id}`);
  };

  return (
    <div className="gig-events">
      <h1>Manage your Events</h1>

      <div className="events-list">
        {events.map((event) => (
          <Event
            key={event.id}
            event={event}
            viewType="gigs"
            onClick={handleEventClick}
          />
        ))}
      </div>
    </div>
  );
}

export default GigEvents;
