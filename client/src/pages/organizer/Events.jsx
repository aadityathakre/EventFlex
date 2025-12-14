import React from 'react';
import { useNavigate } from 'react-router-dom';
import Event from '../../components/Event';
import './Events.scss';

function OrganizerEvents() {
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
      pools: 0,
    },
    {
      id: 2,
      title: 'Wedding #2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
      startDate: '23 Nov 2025',
      startTime: '1:00 AM',
      endDate: '25 Nov 2025',
      endTime: '11:00 AM',
      location: 'location addresss',
      pools: 1,
    },
  ];

  const handleEventClick = (event) => {
    navigate(`/organizer/events/${event.id}`);
  };

  const handleManage = (event) => {
    navigate(`/organizer/events/${event.id}`);
  };

  const handleCreatePool = () => {
    console.log('Create new pool');
  };

  return (
    <div className="organizer-events">
      <div className="events-header">
        <h1>Manage your Events</h1>
        {/* <button className="create-pool-button" onClick={handleCreatePool}>
          Create new Pool
        </button> */}
      </div>

      <div className="events-list">
        {events.map((event) => (
          <Event
            key={event.id}
            event={event}
            viewType="pools"
            onManage={handleManage}
            onClick={handleEventClick}
          />
        ))}
      </div>
    </div>
  );
}

export default OrganizerEvents;
