import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import { useNavigate } from "react-router-dom";

function HostOrganizerPools() {
  const navigate = useNavigate();
  const [assignedPools, setAssignedPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPools = async () => {
    try {
      const res = await axios.get(`${serverURL}/host/organizer`, { withCredentials: true });
      setAssignedPools(res.data?.data || []);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch organizer pools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizer pools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => navigate(-1)} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold">Back</button>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Organizer Pools</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}
        {assignedPools.length === 0 ? (
          <p className="text-gray-600">No organizer pools yet.</p>
        ) : (
          <div className="space-y-3">
            {assignedPools.map((p) => (
              <div key={p._id} className="p-4 border rounded-lg flex items-center justify-between bg-white">
                <div>
                  <p className="font-medium text-gray-900">{p.pool_name || p?.event?.title}</p>
                  <p className="text-sm text-gray-600">Event: {p?.event?.title} • Organizer: {p?.organizer?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/host/events/${p?.event?._id}`)} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">View Event</button>
                  <button onClick={async () => {
                    try {
                      const res = await axios.post(`${serverURL}/host/chat`, { organizerId: p?.organizer?._id, eventId: p?.event?._id, poolId: p?._id }, { withCredentials: true });
                      const convId = res.data?.data?.conversation?._id;
                      if (convId) navigate(`/host/chat/${convId}`);
                    } catch (e) {
                      setError(e.response?.data?.message || 'Failed to start chat');
                    }
                  }} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg">Chat with organizer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HostOrganizerPools;