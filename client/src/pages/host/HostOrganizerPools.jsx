import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import { useNavigate } from "react-router-dom";
import { getEventTypeImage } from "../../utils/imageMaps.js";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedPools.map((p) => (
              <div key={p._id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden h-72 flex flex-col">
                {/* Banner */}
                <div className="relative h-24 overflow-hidden">
                  {p?.event?.event_type && (
                    <img
                      src={getEventTypeImage(p.event.event_type)}
                      alt={p.event.event_type}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/25 to-pink-600/25" />
                </div>

                {/* Content scroll area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <p className="text-lg font-semibold text-slate-900">{p.pool_name || p?.event?.title}</p>
                  <p className="text-sm text-slate-600">Event: {p?.event?.title}</p>
                  <p className="text-sm text-slate-600">Organizer: {p?.organizer?.email}</p>
                  {p?.max_capacity && (
                    <p className="text-xs text-slate-500">Capacity: {p.max_capacity}</p>
                  )}
                  {p?.required_skills && (
                    <p className="text-xs text-slate-500">Skills: {p.required_skills}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                  <button onClick={() => navigate(`/host/events/${p?.event?._id}`)} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">View Event</button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await axios.post(`${serverURL}/host/chat`, { organizerId: p?.organizer?._id, eventId: p?.event?._id, poolId: p?._id }, { withCredentials: true });
                        const convId = res.data?.data?.conversation?._id;
                        if (convId) navigate(`/host/chat/${convId}`);
                      } catch (e) {
                        setError(e.response?.data?.message || 'Failed to start chat');
                      }
                    }}
                    className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg"
                  >
                    Chat with organizer
                  </button>
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