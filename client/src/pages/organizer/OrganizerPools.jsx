import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getEventTypeImage } from "../../utils/imageMaps.js";

function OrganizerPools() {
  const { showToast } = useToast();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [editPoolId, setEditPoolId] = useState("");
  const [editPoolName, setEditPoolName] = useState("");
  const [editPoolDesc, setEditPoolDesc] = useState("");

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/pools`, { withCredentials: true });
      setPools(res.data?.data || []);
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Failed to load pools", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const startEditPool = (pool) => {
    setEditPoolId(pool._id);
    setEditPoolName(pool.name || "");
    setEditPoolDesc(pool.description || "");
  };
  const cancelEditPool = () => {
    setEditPoolId("");
    setEditPoolName("");
    setEditPoolDesc("");
  };
  const saveEditPool = async () => {
    try {
      const res = await axios.put(
        `${serverURL}/organizer/pools/${editPoolId}`,
        { name: editPoolName, description: editPoolDesc },
        { withCredentials: true }
      );
      setPools((prev) => prev.map((p) => (p._id === editPoolId ? res.data?.data : p)));
      cancelEditPool();
      showToast("Pool updated", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update pool", "error");
    }
  };

  const chatWithGig = async (gigId, eventId, poolId) => {
    try {
      await axios.post(
        `${serverURL}/organizer/pools/chat/${gigId}`,
        { eventId, poolId, message_text: "Hello, welcome to the pool!" },
        { withCredentials: true }
      );
      showToast("Message sent to gig", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to send message", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="My Pools" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Organizer Pools</h2>
          <button onClick={fetchPools} className="px-3 py-2 text-sm border rounded-lg">Refresh</button>
        </div>

        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
        ) : pools.length === 0 ? (
          <p className="text-gray-600">No pools yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((p) => (
              <div key={p._id} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={p?.event?.banner_url || getEventTypeImage(p?.event?.event_type)}
                    alt={p?.event?.title || "Event"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30" />
                </div>
                <div className="p-5">
                  {editPoolId === p._id ? (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900">Edit Pool</h3>
                      <input
                        value={editPoolName}
                        onChange={(e) => setEditPoolName(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                        placeholder="Pool name"
                      />
                      <textarea
                        value={editPoolDesc}
                        onChange={(e) => setEditPoolDesc(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                        placeholder="Description"
                        rows={3}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={cancelEditPool} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
                        <button onClick={saveEditPool} className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-600">Event: {p?.event?.title || "-"}</p>
                      <p className="text-sm text-gray-600">Gigs joined: {p?.gigs?.length || 0}</p>
                      <div className="flex items-center justify-between mt-3">
                        <button onClick={() => startEditPool(p)} className="px-3 py-2 text-sm border rounded-lg">Edit</button>
                        <button
                          onClick={() => setSelectedPoolId(selectedPoolId === p._id ? "" : p._id)}
                          className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg"
                        >
                          Show Gigs
                        </button>
                      </div>
                    </>
                  )}
                  {selectedPoolId === p._id && (
                    <div className="mt-3 space-y-2">
                      {(p.gigs || []).length === 0 ? (
                        <p className="text-gray-600">No gigs in this pool.</p>
                      ) : (
                        p.gigs.map((g) => (
                          <div key={g._id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img src={g.avatar} alt={g.fullName} className="w-8 h-8 rounded-full object-cover" />
                              <span className="text-sm font-medium">{g.fullName || `${g.first_name} ${g.last_name}`}</span>
                            </div>
                            <button onClick={() => chatWithGig(g._id, p?.event?._id, p._id)} className="px-3 py-1 text-xs border rounded-lg">Chat</button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default OrganizerPools;