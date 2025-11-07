import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { organizerService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';

const Messages = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await organizerService.getInvitations();
      const data = res?.invitations || res?.data?.invitations || [];
      setInvitations(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Subscribe to real-time notifications so new invites show up immediately
  useEffect(() => {
    const unsubscribe = notificationService.on('notification', (notification) => {
      try {
        if (notification?.type === 'organizer_invitation') {
          load();
        }
      } catch (err) {
        console.error('notification handler error', err);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleAccept = async (id) => {
    try {
      await organizerService.acceptInvitation(id);
      toast.success('Invitation accepted');
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept');
    }
  };

  const handleReject = async (id) => {
    try {
      await organizerService.rejectInvitation(id);
      toast.success('Invitation rejected');
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject');
    }
  };

  return (
    <Layout role="organizer">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Messages & Invitations</h2>
        {loading && <div>Loading...</div>}
        {!loading && invitations.length === 0 && (
          <div>No messages or invitations</div>
        )}

        <div className="space-y-4">
          {invitations.map(inv => (
            <div key={inv._id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{inv.pool_name}</h3>
                  <p className="text-sm text-gray-600">Event: {inv.event?.title || '—'}</p>
                  <p className="text-sm text-gray-600">Host: {inv.event?.host || '—'}</p>
                  <p className="text-sm mt-2">Capacity: {inv.max_capacity}</p>
                  <p className="text-sm">Pay Range: {JSON.stringify(inv.pay_range)}</p>
                  <p className="text-sm">Required Skills: {JSON.stringify(inv.required_skills)}</p>
                </div>
                <div className="space-x-2">
                  {inv.status === 'open' && (
                    <>
                      <button onClick={() => handleAccept(inv._id)} className="btn btn-teal">Approve</button>
                      <button onClick={() => handleReject(inv._id)} className="btn btn-outline text-red-600">Deny</button>
                    </>
                  )}
                  {inv.status === 'active' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded">Assigned</span>
                  )}
                  {inv.status === 'rejected' && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded">Rejected</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
