import React, { useState } from 'react';
import './Notifications.scss';

function OrganizerNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'Your Gig Iswaran for tech management in X Team just checked in.',
      read: false,
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      message: 'Your Gig Iswaran for tech management in X Team just checked in.',
      read: false,
      timestamp: '5 hours ago',
    },
    {
      id: 3,
      message: 'New application received for Wedding Event.',
      read: true,
      timestamp: '1 day ago',
    },
    {
      id: 4,
      message: 'Payment of $500 has been processed for Corporate Event.',
      read: true,
      timestamp: '2 days ago',
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true,
    })));
  };

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <button className="mark-all-read-button" onClick={handleMarkAllRead}>
          Mark all read
        </button>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <p className="notification-message">{notification.message}</p>
            {!notification.read && (
              <button
                className="mark-read-button"
                onClick={(e) => handleMarkAsRead(e, notification.id)}
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrganizerNotifications;
