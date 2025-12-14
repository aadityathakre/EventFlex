import React, { useState, useEffect } from 'react';
import { getNotifications, broadcastNotification, notifyUser, getAllRoles } from '../../api/admin';
import './Notifications.scss';

const AdminNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showUserNotifyModal, setShowUserNotifyModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    type: 'system',
  });
  const [userNotifyForm, setUserNotifyForm] = useState({
    userId: '',
    message: '',
    type: 'system',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getNotifications();

      const data = response.data.data || response.data.notifications || [];

      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllRoles();
      const data = response.data.data || response.data;

      // Transform users data
      let allUsers = [];
      if (Array.isArray(data)) {
        allUsers = data;
      } else if (typeof data === 'object') {
        Object.keys(data).forEach(role => {
          if (Array.isArray(data[role])) {
            allUsers = [...allUsers, ...data[role].map(user => ({ ...user, role }))];
          }
        });
      }

      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();

    if (!broadcastForm.message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await broadcastNotification({
        message: broadcastForm.message,
        type: broadcastForm.type,
      });

      alert('Broadcast sent successfully to all users');
      setBroadcastForm({ message: '', type: 'system' });
      setShowBroadcastModal(false);
      fetchNotifications();
    } catch (err) {
      console.error('Error broadcasting notification:', err);
      alert(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleUserNotify = async (e) => {
    e.preventDefault();

    if (!userNotifyForm.userId) {
      alert('Please select a user');
      return;
    }

    if (!userNotifyForm.message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await notifyUser(userNotifyForm.userId, {
        message: userNotifyForm.message,
        type: userNotifyForm.type,
      });

      alert('Notification sent successfully');
      setUserNotifyForm({ userId: '', message: '', type: 'system' });
      setShowUserNotifyModal(false);
      fetchNotifications();
    } catch (err) {
      console.error('Error sending notification:', err);
      alert(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getUserName = (user) => {
    if (!user) return 'All Users';
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'N/A';
  };

  if (loading) {
    return (
      <div className="admin-notifications">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-notifications">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      <div className="page-header">
        <h1>Notifications</h1>
        <div className="header-actions">
          <button className="btn-broadcast" onClick={() => setShowBroadcastModal(true)}>
            Broadcast to All
          </button>
          <button className="btn-notify-user" onClick={() => setShowUserNotifyModal(true)}>
            Notify User
          </button>
        </div>
      </div>

      {/* Notification History */}
      <div className="notifications-section">
        <h2>Notification History</h2>

        {notifications.length === 0 ? (
          <div className="empty-state">No notifications sent yet</div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification._id || notification.id} className="notification-card">
                <div className="notification-header">
                  <span className={`notification-type type-${notification.type}`}>
                    {notification.type || 'system'}
                  </span>
                  <span className="notification-date">{formatDate(notification.createdAt || notification.created_at)}</span>
                </div>

                <div className="notification-content">
                  <p className="notification-message">{notification.message || notification.content}</p>
                  <div className="notification-meta">
                    <span className="recipient">
                      To: {getUserName(notification.recipient || notification.user)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Broadcast Notification</h2>
              <button className="btn-close" onClick={() => setShowBroadcastModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="modal-body">
              <div className="form-group">
                <label htmlFor="broadcast-type">Notification Type</label>
                <select
                  id="broadcast-type"
                  className="form-control"
                  value={broadcastForm.type}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                >
                  <option value="system">System</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="broadcast-message">Message</label>
                <textarea
                  id="broadcast-message"
                  className="form-control"
                  placeholder="Enter your message..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowBroadcastModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-send" disabled={sending}>
                  {sending ? 'Sending...' : 'Send to All Users'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Notify Modal */}
      {showUserNotifyModal && (
        <div className="modal-overlay" onClick={() => setShowUserNotifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Notification to User</h2>
              <button className="btn-close" onClick={() => setShowUserNotifyModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUserNotify} className="modal-body">
              <div className="form-group">
                <label htmlFor="user-select">Select User</label>
                <select
                  id="user-select"
                  className="form-control"
                  value={userNotifyForm.userId}
                  onChange={(e) => setUserNotifyForm({ ...userNotifyForm, userId: e.target.value })}
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user._id || user.id} value={user._id || user.id}>
                      {getUserName(user)} - {user.email} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="user-notify-type">Notification Type</label>
                <select
                  id="user-notify-type"
                  className="form-control"
                  value={userNotifyForm.type}
                  onChange={(e) => setUserNotifyForm({ ...userNotifyForm, type: e.target.value })}
                >
                  <option value="system">System</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="user-notify-message">Message</label>
                <textarea
                  id="user-notify-message"
                  className="form-control"
                  placeholder="Enter your message..."
                  value={userNotifyForm.message}
                  onChange={(e) => setUserNotifyForm({ ...userNotifyForm, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowUserNotifyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-send" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
