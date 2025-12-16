import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { getEventTypeImage } from "../../utils/imageMaps.js";
import { useToast } from "../../context/ToastContext.jsx";

function HostEventsList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming | active | completed
  const [ratingModal, setRatingModal] = useState({ open: false, eventId: null, organizerId: null, rating: 5, review_text: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${serverURL}/host/events`, { withCredentials: true });
        setEvents(res.data?.data || []);
        setError(null);
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to fetch events";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refresh = async () => {
    try {
      const res = await axios.get(`${serverURL}/host/events`, { withCredentials: true });
      setEvents(res.data?.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to refresh events";
      setError(msg);
      showToast(msg, "error");
    }
  };

  const handleDelete = async (eventId) => {
    const confirm = window.confirm("Delete this event? This action can’t be undone.");
    if (!confirm) return;
    try {
      setDeletingId(eventId);
      await axios.delete(`${serverURL}/host/events/${eventId}`, { withCredentials: true });
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete event";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const now = new Date();
  const grouped = useMemo(() => {
    const upcoming = [];
    const active = [];
    const completed = [];
    for (const ev of events) {
      const s = ev?.start_date ? new Date(ev.start_date) : null;
      const e = ev?.end_date ? new Date(ev.end_date) : null;
      if (ev.status === "completed" || (e && now > e)) completed.push(ev);
      else if (s && e && now >= s && now <= e) active.push(ev);
      else upcoming.push(ev);
    }
    return { upcoming, active, completed };
  }, [events]);

  const markCompleted = async (eventId) => {
    try {
      await axios.put(`${serverURL}/host/events/complete/${eventId}`, {}, { withCredentials: true });
      showToast("Event marked as completed", "success");
      refresh();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to mark completed", "error");
    }
  };

  const openRate = (ev) => {
    if (!ev.organizer) {
      showToast("Organizer not assigned", "error");
      return;
    }
    setRatingModal({ open: true, eventId: ev._id, organizerId: ev.organizer, rating: 5, review_text: "" });
  };

  const submitRating = async () => {
    try {
      await axios.post(`${serverURL}/host/reviews/rating`, {
        eventId: ratingModal.eventId,
        organizerId: ratingModal.organizerId,
        rating: ratingModal.rating,
        review_text: ratingModal.review_text,
      }, { withCredentials: true });
      setRatingModal({ open: false, eventId: null, organizerId: null, rating: 5, review_text: "" });
      showToast("Rating submitted", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to submit rating", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Your Events</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate("/host/dashboard")} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition">Dashboard</button>
            <button onClick={() => navigate("/host/events/create")} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow">Create Event</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-4">{error}</div>
        )}

        {events.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow p-12">
            <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
            <button onClick={() => navigate("/host/events/create")} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow">
              Create Your First Event
            </button>
          </div>
        ) : (
          <>
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap items-center gap-3">
            <button onClick={() => setActiveTab("upcoming")} className={`px-4 py-2 rounded-lg border ${activeTab === "upcoming" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent" : ""}`}>Upcoming</button>
            <button onClick={() => setActiveTab("active")} className={`px-4 py-2 rounded-lg border ${activeTab === "active" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent" : ""}`}>Active</button>
            <button onClick={() => setActiveTab("completed")} className={`px-4 py-2 rounded-lg border ${activeTab === "completed" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent" : ""}`}>Completed</button>
            <button onClick={refresh} className="ml-auto px-3 py-2 text-sm border rounded-lg">Refresh</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "upcoming" ? grouped.upcoming : activeTab === "active" ? grouped.active : grouped.completed).map((ev) => (
              <div key={ev._id} className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={getEventTypeImage(ev.event_type)}
                    alt={ev.event_type || "Event"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">{ev.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ev.event_type?.toUpperCase()}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(ev.start_date).toLocaleString()} — {new Date(ev.end_date).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      ev.status === "published"
                        ? "bg-blue-100 text-blue-800"
                        : ev.status === "in_progress"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 p-4 border-t">
                  <button onClick={() => navigate(`/host/events/${ev._id}`)} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition">
                    View Event
                  </button>
                  {activeTab === "active" && (
                    <button onClick={() => markCompleted(ev._id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                      Mark Completed
                    </button>
                  )}
                  {activeTab === "completed" && (
                    <>
                    <button
                      onClick={() => handleDelete(ev._id)}
                      disabled={deletingId === ev._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === ev._id ? "Deleting..." : "Delete"}
                    </button>
                    {ev.organizer && (
                      <button onClick={() => openRate(ev)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold">
                        Rate Organizer
                      </button>
                    )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </main>
      {ratingModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setRatingModal({ open: false, eventId: null, organizerId: null, rating: 5, review_text: "" })}></div>
          <div className="relative z-10 bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h4 className="text-lg font-semibold mb-4">Rate Organizer</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rating (1-5)</label>
                <input type="number" min={1} max={5} value={ratingModal.rating} onChange={(e) => setRatingModal((m) => ({ ...m, rating: parseInt(e.target.value, 10) }))} className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Review</label>
                <textarea value={ratingModal.review_text} onChange={(e) => setRatingModal((m) => ({ ...m, review_text: e.target.value }))} rows={3} className="border rounded-lg px-3 py-2 w-full" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setRatingModal({ open: false, eventId: null, organizerId: null, rating: 5, review_text: "" })} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={submitRating} className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostEventsList;
