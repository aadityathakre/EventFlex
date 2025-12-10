import React from 'react';
import Event from '../../components/Event';
import './Events.scss';

function HostEvents() {
  // Sample events data
  const events = [
    {
      title: 'Wedding #1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
      startDate: '23 Nov 2025',
      startTime: '1:00 AM',
      endDate: '25 Nov 2025',
      endTime: '11:00 AM',
      location: 'location addresss',
      organizers: 0,
    },
    {
      title: 'Wedding #2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
      startDate: '23 Nov 2025',
      startTime: '1:00 AM',
      endDate: '25 Nov 2025',
      endTime: '11:00 AM',
      location: 'location addresss',
      organizers: 4,
    },
  ];

  const handleManage = (event) => {
    console.log('Manage event:', event);
  };

  const handleCreateEvent = () => {
    console.log('Create new event');
  };

  return (
    <div className="host-events">
      <div className="events-header">
        <h1>Manage your Events</h1>
        <button className="create-event-button" onClick={handleCreateEvent}>
          Create a new Event
        </button>
      </div>

      <div className="events-list">
        {events.map((event, index) => (
          <Event
            key={index}
            event={event}
            viewType="organizers"
            onManage={handleManage}
          />
        ))}
      </div>
    </div>
  );
}

export default HostEvents;
