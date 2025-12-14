import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { FaUsers, FaArrowLeft, FaPaperPlane } from "react-icons/fa";

function HostOrganizers() {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const availableEvents = events.filter((evt) => !evt.organizer);
  const [assignedPools, setAssignedPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [inviteState, setInviteState] = useState({ organizerId: null, eventId: "", cover: "" });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [orgRes, evtRes, poolRes] = await Promise.all([
          axios.get(`${serverURL}/host/organizers/all`, { withCredentials: true }),
          axios.get(`${serverURL}/host/events`, { withCredentials: true }),
          axios.get(`${serverURL}/host/organizer`, { withCredentials: true }),
        ]);
        setOrganizers(orgRes.data?.data || []);
        setEvents(evtRes.data?.data || []);
        setAssignedPools(poolRes.data?.data || []);
        setError(null);
      } catch (err) {
        console.error("Organizer page load error:", err);
        setError(err.response?.data?.message || "Failed to load organizers");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const filteredOrganizers = organizers.filter((o) => {
    const text = `${o.fullName || o.name || ""} ${o.email || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const startInvite = (organizerId) => {
    setInviteState({ organizerId, eventId: "", cover: "" });
  };

  const sendInvite = async () => {
    if (!inviteState.organizerId || !inviteState.eventId) {
      setError("Select an event to invite organizer");
      return;
    }
    const selectedEvent = events.find((e) => e._id === inviteState.eventId);
    if (selectedEvent?.organizer) {
      setError("This event already has an organizer assigned");
      return;
    }
    try {
      setInviting(true);
      const payload = { eventId: inviteState.eventId, cover_letter: inviteState.cover };
      await axios.post(`${serverURL}/host/invite-organizer/${inviteState.organizerId}`, payload, { withCredentials: true });
      setInviteState({ organizerId: null, eventId: "", cover: "" });
      // Refresh assigned pools
      const poolRes = await axios.get(`${serverURL}/host/organizer`, { withCredentials: true });
      setAssignedPools(poolRes.data?.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send invite";
      setError(msg);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-purple-600">
                <FaArrowLeft />
              </button>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Find Organizers
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">All Organizers</h3>
            <div className="flex items-center space-x-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="border rounded-lg px-3 py-2 text-sm w-64"
              />
            </div>
          </div>

          {filteredOrganizers.length === 0 ? (
            <p className="text-gray-600">No organizers found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrganizers.map((o) => (
                <div key={o._id} className="border rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FaUsers className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{o.fullName || o.name || "Organizer"}</p>
                      <p className="text-sm text-gray-600">{o.email}</p>
                    </div>
                  </div>

                  {inviteState.organizerId === o._id ? (
                    <div className="space-y-2 mt-3">
                      <select
                        value={inviteState.eventId}
                        onChange={(e) => setInviteState((s) => ({ ...s, eventId: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select event</option>
                        {availableEvents.map((evt) => (
                          <option key={evt._id} value={evt._id}>{evt.title}</option>
                        ))}
                      </select>
                      {availableEvents.length === 0 && (
                        <p className="text-xs text-amber-600">All your events already have assigned organizers.</p>
                      )}
                      <textarea
                        value={inviteState.cover}
                        onChange={(e) => setInviteState((s) => ({ ...s, cover: e.target.value }))}
                        placeholder="Cover letter (optional)"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={sendInvite}
                          disabled={inviting}
                          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm flex items-center space-x-2 hover:shadow"
                        >
                          <FaPaperPlane />
                          <span>{inviting ? "Sending..." : "Send Invite"}</span>
                        </button>
                        <button
                          onClick={() => setInviteState({ organizerId: null, eventId: "", cover: "" })}
                          className="px-3 py-2 border rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : availableEvents.length > 0 ? (
                    <button
                      onClick={() => startInvite(o._id)}
                      className="mt-3 px-3 py-2 border-2 border-purple-600 text-purple-600 rounded-lg text-sm hover:bg-purple-50"
                    >
                      Invite to Event
                    </button>
                  ) : (
                    <div className="mt-3 text-xs text-gray-600">No events available for invites.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned Organizers</h3>
          {assignedPools.length === 0 ? (
            <p className="text-gray-600">No assigned organizers yet.</p>
          ) : (
            <div className="space-y-3">
              {assignedPools.map((p) => (
                <div key={p._id} className="border rounded-xl p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{p?.event?.title || "Event"}</p>
                      <p className="text-sm text-gray-600">Organizer: {p?.organizer?.email || ""}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/host/events/${p?.event?._id}`)}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                      View Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HostOrganizers;