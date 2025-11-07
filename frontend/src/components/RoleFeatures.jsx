import React from 'react';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';

const RoleFeatures = ({ role }) => {
  if (!role) return null;

  const handleCall = async (method, url, body) => {
    try {
      let res;
      if (method === 'get') res = await apiClient.get(url);
      else if (method === 'post') res = await apiClient.post(url, body || {});
      else if (method === 'put') res = await apiClient.put(url, body || {});
      else if (method === 'delete') res = await apiClient.delete(url);
      toast.success('Success — check console for data');
      // Log to console for developer
      // eslint-disable-next-line no-console
      console.log('API response', url, res);
    } catch (err) {
      // Log error to console only (no user-facing toast)
      const msg = err?.response?.data?.message || err.message || 'Request failed';
      // eslint-disable-next-line no-console
      console.error('API error:', url, msg, err);
    }
  };

  if (role === 'gig') {
    const features = [
      { key: 'my-events', label: 'My Events', action: () => handleCall('get', '/gigs/my-events') },
      { key: 'nearby', label: 'Nearby Events', action: () => handleCall('get', '/gigs/nearby-events') },
      { key: 'join-pool', label: 'Join Pool', action: () => { const id = window.prompt('Pool ID'); if (id) handleCall('post', `/gigs/join-pool/${id}`); } },
      { key: 'wallet', label: 'Wallet', action: () => handleCall('get', '/gigs/wallet') },
      { key: 'withdraw', label: 'Withdraw', action: () => { const amt = window.prompt('Amount to withdraw'); if (amt) handleCall('post', '/gigs/withdraw', { amount: amt }); } },
      { key: 'reminders', label: 'Reminders', action: () => handleCall('get', '/gigs/reminders') },
      { key: 'profile', label: 'Profile', action: () => handleCall('get', '/gigs/profile') },
      { key: 'badges', label: 'Badges', action: () => handleCall('get', '/gigs/badges') },
      { key: 'dashboard', label: 'Dashboard', action: () => handleCall('get', '/gigs/dashboard') },
    ];

    return (
      <div className="mt-3">
        <h4 className="text-sm font-semibold mb-2">Gig quick actions</h4>
        <div className="grid grid-cols-3 gap-2">
          {features.map((f) => (
            <button key={f.key} onClick={f.action} className="btn btn-outline text-xs py-1">
              {f.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (role === 'host') {
    const features = [
      { key: 'create-event', label: 'Create Event', action: () => { const title = window.prompt('Event title'); if (title) handleCall('post', '/host/events/create', { title }); } },
      { key: 'my-events', label: 'My Events', action: () => handleCall('get', '/host/events') },
      { key: 'invite-organizer', label: 'Invite Organizer', action: () => { const email = window.prompt('Organizer email'); if (email) handleCall('post', '/host/invite-organizer', { email }); } },
      { key: 'deposit', label: 'Deposit Escrow', action: () => { const amt = window.prompt('Amount to deposit'); if (amt) handleCall('post', '/host/payment/deposit', { amount: amt }); } },
      { key: 'verify-attendance', label: 'Verify Attendance', action: () => { const eventId = window.prompt('Event ID'); if (eventId) handleCall('post', `/host/verify-attendance/${eventId}`); } },
      { key: 'wallet', label: 'Wallet Balance', action: () => handleCall('get', '/host/wallet/balance') },
      { key: 'dashboard', label: 'Dashboard', action: () => handleCall('get', '/host/dashboard') },
    ];

    return (
      <div className="mt-3">
        <h4 className="text-sm font-semibold mb-2">Host quick actions</h4>
        <div className="grid grid-cols-3 gap-2">
          {features.map((f) => (
            <button key={f.key} onClick={f.action} className="btn btn-outline text-xs py-1">
              {f.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (role === 'organizer') {
    const features = [
      { key: 'create-pool', label: 'Create Pool', action: () => { const name = window.prompt('Pool name'); if (name) handleCall('post', '/organizer/pools/create', { name }); } },
      { key: 'manage-pools', label: 'Manage Pools', action: () => handleCall('get', '/organizer/pools/1') },
      { key: 'create-event', label: 'Create Event', action: () => { const title = window.prompt('Event title'); if (title) handleCall('post', '/organizer/events/create', { title }); } },
      { key: 'wallet', label: 'Wallet', action: () => handleCall('get', '/organizer/wallet') },
      { key: 'withdraw', label: 'Withdraw', action: () => { const amt = window.prompt('Amount to withdraw'); if (amt) handleCall('post', '/organizer/withdraw', { amount: amt }); } },
      { key: 'notifications', label: 'Notifications', action: () => handleCall('get', '/organizer/notifications') },
      { key: 'dashboard', label: 'Dashboard', action: () => handleCall('get', '/organizer/leaderboard') },
    ];

    return (
      <div className="mt-3">
        <h4 className="text-sm font-semibold mb-2">Organizer quick actions</h4>
        <div className="grid grid-cols-3 gap-2">
          {features.map((f) => (
            <button key={f.key} onClick={f.action} className="btn btn-outline text-xs py-1">
              {f.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default RoleFeatures;
