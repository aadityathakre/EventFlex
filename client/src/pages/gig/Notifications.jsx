import React, { useState, useEffect } from 'react';
import { getNotifications } from '../../api/gig';
import './Notifications.scss';

function GigNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getNotifications();

      // Extract notifications from response
      const notificationsData = response.data.data || response.data.notifications || [];

      // Transform notifications to match component structure
      const transformedNotifications = notificationsData.map((notification) => {
        // Format timestamp
        const getTimeAgo = (dateStr) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
          if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
          return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        };

        return {
          id: notification._id,
          message: notification.message || notification.content || '',
          read: notification.is_read || notification.read || false,
          timestamp: getTimeAgo(notification.createdAt || notification.created_at),
          type: notification.type,
          // Store original data
          rawData: notification,
        };
      });

      setNotifications(transformedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

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
        {notifications.length > 0 && (
          <button className="mark-all-read-button" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications yet</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default GigNotifications;
