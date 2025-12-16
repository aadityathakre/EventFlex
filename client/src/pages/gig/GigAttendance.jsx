import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function GigAttendance() {
  const { showToast } = useToast();
  const [myEvents, setMyEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [disputeEventId, setDisputeEventId] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/gigs/my-events`, { withCredentials: true });
      setMyEvents(res.data?.data || []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${serverURL}/gigs/attendance-history`, { withCredentials: true });
      setAttendance(res.data?.data || []);
    } catch {}
  };

  const checkIn = async (eventId) => {
    try {
      const res = await axios.post(`${serverURL}/gigs/check-in/${eventId}`, {}, { withCredentials: true });
      showToast(res.data?.message || "Checked in", "success");
      fetchMyEvents();
      fetchAttendance();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to check in", "error");
    }
  };

  const checkOut = async (eventId) => {
    try {
      const res = await axios.post(`${serverURL}/gigs/check-out/${eventId}`, {}, { withCredentials: true });
      showToast(res.data?.message || "Checked out", "success");
      fetchMyEvents();
      fetchAttendance();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to check out", "error");
    }
  };

  const submitDispute = async () => {
    if (!disputeEventId || !disputeReason.trim()) {
      showToast("Enter a reason for dispute", "error");
      return;
    }
    try {
      const res = await axios.post(`${serverURL}/gigs/raise-dispute/${disputeEventId}`, { reason: disputeReason }, { withCredentials: true });
      showToast(res.data?.message || "Dispute raised", "success");
      setDisputeEventId(null);
      setDisputeReason("");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to raise dispute", "error");
    }
  };

  useEffect(() => { fetchMyEvents(); fetchAttendance(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Attendance" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Attendance</h3>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("active")} className={`px-4 py-2 rounded-lg border ${activeTab === "active" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent" : ""}`}>Active</button>
              <button onClick={() => setActiveTab("upcoming")} className={`px-4 py-2 rounded-lg border ${activeTab === "upcoming" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent" : ""}`}>Upcoming</button>
              <button onClick={() => setActiveTab("completed")} className={`px-4 py-2 rounded-lg border ${activeTab === "completed" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent" : ""}`}>Completed</button>
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : myEvents.length === 0 ? (
            <p className="text-gray-600">No events assigned.</p>
          ) : (
            <>
              {activeTab === "active" && (
              <>
              <h4 className="text-lg font-semibold mt-2 mb-2">Active</h4>
              <div className="space-y-3">
              {myEvents.filter((ev) => {
                const now = new Date();
                const startAt = ev?.event?.start_date ? new Date(ev.event.start_date) : null;
                const endAt = ev?.event?.end_date ? new Date(ev.event.end_date) : null;
                return startAt && endAt && now >= startAt && now <= endAt;
              }).map((ev) => {
                const eventId = ev?.event?._id || ev?.event || ev?._id;
                const att = attendance.find((a) => String(a?.event?._id || a?.event) === String(eventId));
                const inProgress = !!att && !!att.check_in_time && !att.check_out_time;
                const now = new Date();
                const startAt = ev?.event?.start_date ? new Date(ev.event.start_date) : null;
                const endAt = ev?.event?.end_date ? new Date(ev.event.end_date) : null;
                const eventStarted = startAt ? now >= startAt : false;
                const eventEnded = endAt ? now > endAt : false;
                const hours = att?.hours_worked?.$numberDecimal
                  ? parseFloat(att.hours_worked.$numberDecimal)
                  : att?.hours_worked
                  ? parseFloat(att.hours_worked)
                  : 0;
                const canReCheckIn = !!att && !!att.check_out_time && Number.isFinite(hours) && hours < (5 / 60);
                return (
                <div key={ev._id} className="border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ev?.event?.title || ev?.name || "Event"}</p>
                    <p className="text-sm text-gray-600">
                      Status: {eventEnded ? "Event completed" : inProgress ? "You are in event now" : att?.check_out_time ? (canReCheckIn ? "Eligible for re-check-in (<5 min)" : "Attendance complete") : "Not checked in"}
                    </p>
                    {att?.check_out_time && (
                      <p className="text-xs text-gray-600">Hours worked: {Number.isFinite(hours) ? hours.toFixed(2) : "-"}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 border rounded-md" onClick={() => setSelectedEvent(ev)}>Details</button>
                    <button
                      className={`px-3 py-2 ${
                        eventEnded || inProgress || (!canReCheckIn && !!att?.check_out_time)
                          ? "bg-gray-200 text-gray-700"
                          : "bg-emerald-600 text-white"
                      } rounded-md`}
                      onClick={() => checkIn(eventId)}
                      disabled={eventEnded || inProgress || (!eventStarted && !canReCheckIn) || (!canReCheckIn && !!att?.check_out_time)}
                      title={
                        !eventStarted && !canReCheckIn
                          ? "Event not started yet"
                          : eventEnded
                          ? "Event ended"
                          : inProgress
                          ? "Already checked in"
                          : !canReCheckIn && !!att?.check_out_time
                          ? "Attendance already completed (>=5 min)"
                          : ""
                      }
                    >
                      Check In
                    </button>
                    <button
                      className={`px-3 py-2 ${inProgress && !eventEnded ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-700"} rounded-md`}
                      onClick={() => checkOut(eventId)}
                      disabled={!inProgress || eventEnded}
                    >
                      Check Out
                    </button>
                    <button
                      className="px-3 py-2 border rounded-md"
                      onClick={() => setDisputeEventId(eventId)}
                      title="Raise dispute"
                    >
                      Raise Dispute
                    </button>
                    <button
                      className="px-3 py-2 border rounded-md"
                      onClick={() => window.location.href = "/gig/chat"}
                      title="Chat with organizer"
                    >
                      Chat
                    </button>
                    {eventEnded && (
                      <button
                        className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                        onClick={() => setSelectedEvent({ ...ev, giveFeedback: true })}
                        title="Give feedback"
                      >
                        Give Feedback
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
              </div>
              </>
              )}
              {activeTab === "upcoming" && (
                <>
                <h4 className="text-lg font-semibold mt-6 mb-2">Upcoming</h4>
                <div className="space-y-3">
                  {myEvents.filter((ev) => {
                  const now = new Date();
                  const startAt = ev?.event?.start_date ? new Date(ev.event.start_date) : null;
                  return startAt && now < startAt;
                }).map((ev) => (
                  <div key={ev._id} className="border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{ev?.event?.title || ev?.name || "Event"}</p>
                      <p className="text-sm text-gray-600">Status: Upcoming</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 border rounded-md" onClick={() => setSelectedEvent(ev)}>Details</button>
                      <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md" disabled>Check In</button>
                      <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md" disabled>Check Out</button>
                    </div>
                  </div>
                ))}
                </div>
                </>
              )}
              {activeTab === "completed" && (
                <>
                <h4 className="text-lg font-semibold mt-6 mb-2">Completed</h4>
                <div className="space-y-3">
                  {myEvents.filter((ev) => {
                  const now = new Date();
                  const endAt = ev?.event?.end_date ? new Date(ev.event.end_date) : null;
                  return endAt && now > endAt;
                }).map((ev) => {
                  const eventId = ev?.event?._id || ev?.event || ev?._id;
                  const att = attendance.find((a) => String(a?.event?._id || a?.event) === String(eventId));
                  const hours = att?.hours_worked?.$numberDecimal
                    ? parseFloat(att.hours_worked.$numberDecimal)
                    : att?.hours_worked
                    ? parseFloat(att.hours_worked)
                    : 0;
                  return (
                    <div key={ev._id} className="border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{ev?.event?.title || ev?.name || "Event"}</p>
                        <p className="text-sm text-gray-600">Status: Event completed</p>
                        {Number.isFinite(hours) && <p className="text-xs text-gray-600">Hours worked: {hours.toFixed(2)}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-2 border rounded-md" onClick={() => setSelectedEvent(ev)}>Details</button>
                        <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md" disabled>Check In</button>
                        <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md" disabled>Check Out</button>
                        <button
                          className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                          onClick={() => setSelectedEvent({ ...ev, giveFeedback: true })}
                        >
                          Give Feedback
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
                </>
              )}
            </>
          )}
        </div>

        {disputeEventId && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h4 className="font-semibold mb-2">Raise Dispute</h4>
            <label className="block text-sm text-gray-600 mb-1">Reason</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
            />
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-rose-600 text-white rounded-md" onClick={submitDispute}>Submit</button>
              <button className="px-4 py-2 border rounded-md" onClick={() => { setDisputeEventId(null); setDisputeReason(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h4 className="font-semibold mb-2">Event Details</h4>
            <p className="text-sm text-gray-700">{selectedEvent?.description || "No details provided."}</p>
            <div className="mt-4">
              <button className="px-4 py-2 border rounded-md" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        )}
        {selectedEvent?.giveFeedback && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h4 className="font-semibold mb-2">Give Feedback</h4>
            <FeedbackForm eventId={selectedEvent?.event?._id || selectedEvent?._id} onClose={() => setSelectedEvent(null)} />
          </div>
        )}
      </main>
    </div>
  );
}

function FeedbackForm({ eventId, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = async () => {
    try {
      const res = await axios.post(`${serverURL}/gigs/feedback/${eventId}`, { rating, comment }, { withCredentials: true });
      alert(res.data?.message || "Feedback submitted");
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to submit feedback");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Rating (1-5)</label>
          <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(parseInt(e.target.value, 10))} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={3} />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md" onClick={submit}>Submit</button>
        <button className="px-4 py-2 border rounded-md" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
export default GigAttendance;
