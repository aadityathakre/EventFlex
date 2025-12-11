import React, { useState } from 'react';
import './Notifications.scss';

function GigNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'Your application for Wedding Event has been accepted.',
      read: false,
      timestamp: '1 hour ago',
    },
    {
      id: 2,
      message: 'New event available nearby: Corporate Conference.',
      read: false,
      timestamp: '3 hours ago',
    },
    {
      id: 3,
      message: 'Payment of $300 has been received for Birthday Party.',
      read: true,
      timestamp: '1 day ago',
    },
    {
      id: 4,
      message: 'Your application for Tech Summit has been rejected.',
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

export default GigNotifications;
