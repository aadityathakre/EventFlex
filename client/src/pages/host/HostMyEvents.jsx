import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaStar } from "react-icons/fa";
import { getEventTypeImage } from "../../utils/imageMaps.js";

function HostMyEvents() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [completingId, setCompletingId] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, eventId: null, organizerId: null, rating: 5, review_text: "" });

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/host/events`, { withCredentials: true });
      setEvents(res.data?.data || []);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events
  const now = new Date();
  const activeEvents = events.filter(e => {
    const start = new Date(e.start_date);
    const end = new Date(e.end_date);
    return e.status !== "completed" && start <= now && end > now; // Or status === 'in_progress'
  });

  const upcomingEvents = events.filter(e => {
    const start = new Date(e.start_date);
    return e.status !== "completed" && start > now;
  });

  const completedEvents = events.filter(e => e.status === "completed");

  const handleMarkComplete = async (eventId) => {
    if (!window.confirm("Are you sure you want to mark this event as completed?")) return;
    setCompletingId(eventId);
    try {
      await axios.put(`${serverURL}/host/events/complete/${eventId}`, {}, { withCredentials: true });
      showToast("Event marked as completed", "success");
      fetchEvents();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to complete event", "error");
    } finally {
      setCompletingId(null);
    }
  };

  const openFeedback = (event) => {
    // Check if organizer is already populated in event object
    if (event.organizer && event.organizer._id) {
       setFeedbackModal({ 
           open: true, 
           eventId: event._id, 
           organizerId: event.organizer._id, 
           rating: 5, 
           review_text: "" 
       });
       return;
    }

    // Fallback: fetch assigned organizer for this event
    axios.get(`${serverURL}/host/organizer?eventId=${event._id}`, { withCredentials: true })
      .then(res => {
        const pools = res.data?.data || [];
        const pool = pools.find(p => p.event?._id === event._id || p.event === event._id);
        if (pool && pool.organizer) {
           setFeedbackModal({ open: true, eventId: event._id, organizerId: pool.organizer._id, rating: 5, review_text: "" });
        } else {
           showToast("No organizer assigned to rate", "info");
        }
      })
      .catch(() => showToast("Could not find organizer details", "error"));
  };

  const submitFeedback = async () => {
    try {
      await axios.post(`${serverURL}/host/reviews/rating`, {
        eventId: feedbackModal.eventId,
        organizerId: feedbackModal.organizerId,
        rating: feedbackModal.rating,
        review_text: feedbackModal.review_text,
      }, { withCredentials: true });
      showToast("Feedback submitted successfully", "success");
      setFeedbackModal({ open: false, eventId: null, organizerId: null, rating: 5, review_text: "" });
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to submit feedback", "error");
    }
  };

  const renderEventCard = (event, type) => (
    <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={getEventTypeImage(event.event_type)} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 capitalize">
          {event.event_type}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="text-indigo-500" />
            <span>{new Date(event.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="text-indigo-500" />
            <span>{new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            event.status === 'completed' ? 'bg-green-100 text-green-700' :
            event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {event.status.replace('_', ' ')}
          </span>

          <div className="flex gap-2">
            {type !== 'completed' && (
              <button 
                onClick={() => handleMarkComplete(event._id)}
                disabled={completingId === event._id}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {completingId === event._id ? 'Completing...' : 'Mark Complete'}
              </button>
            )}
            {type === 'completed' && (
              <button 
                onClick={() => openFeedback(event)}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <FaStar /> Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="My Events" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 w-fit mx-auto">
          {['active', 'upcoming', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              } capitalize`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'active' && activeEvents.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-12">No active events currently running.</p>
            )}
            {activeTab === 'upcoming' && upcomingEvents.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-12">No upcoming events scheduled.</p>
            )}
            {activeTab === 'completed' && completedEvents.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-12">No completed events yet.</p>
            )}

            {activeTab === 'active' && activeEvents.map(e => renderEventCard(e, 'active'))}
            {activeTab === 'upcoming' && upcomingEvents.map(e => renderEventCard(e, 'upcoming'))}
            {activeTab === 'completed' && completedEvents.map(e => renderEventCard(e, 'completed'))}
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Organizer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackModal(m => ({ ...m, rating: star }))}
                      className={`text-2xl transition-colors ${star <= feedbackModal.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea
                  value={feedbackModal.review_text}
                  onChange={(e) => setFeedbackModal(m => ({ ...m, review_text: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setFeedbackModal({ open: false, eventId: null, organizerId: null, rating: 5, review_text: "" })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostMyEvents;
