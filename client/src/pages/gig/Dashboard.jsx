import React from 'react';
import Sidebar from '../../components/Sidebar';
import Event from '../../components/Event';
import './Dashboard.scss';

function GigDashboard() {
    // Sample event data
    const sampleEvents = [
        {
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
            title: 'Wedding #2',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel rhoncus magna. Suspendisse augue arcu, euismod a sapien sed, imperdiet facilisis ex.',
            startDate: '23 Nov 2025',
            startTime: '1:00 AM',
            endDate: '25 Nov 2025',
            endTime: '11:00 AM',
            location: 'location addresss',
            organizer: {
                name: 'Iswaran',
                rating: 4,
            },
            availableGigs: [
                {
                    title: 'Sounding system management',
                    description: '4 Peoples required to manage the sounding system, play sounds, and manage the sound level.',
                    applied: 40,
                },
                {
                    title: 'Crowd management',
                    description: '3 Peoples required to manage the crowd welcome, and seatings.',
                    applied: 10,
                },
            ],
        },
        {
            title: 'Wedding #3',
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

    const handleManage = (event) => {
        console.log('Manage event:', event);
    };

    const handleApply = (event, gig) => {
        console.log('Apply to gig:', gig, 'in event:', event);
    };

    return (
        <div className="gig-dashboard">
            <Sidebar />
            <div className="dashboard-content">
                <h1>Dashboard</h1>

                <div className="events-list">
                    <Event
                        event={sampleEvents[0]}
                        viewType="pools"
                        onManage={handleManage}
                    />

                    <Event
                        event={sampleEvents[1]}
                        viewType="available_gigs"
                        onApply={handleApply}
                    />

                    <Event
                        event={sampleEvents[2]}
                        viewType="gigs"
                    />
                </div>
            </div>
        </div>
    );
}

export default GigDashboard;