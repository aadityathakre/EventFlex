import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function GigAttendance() {
  const { showToast } = useToast();
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const checkIn = async (eventId) => {
    try {
      const res = await axios.post(`${serverURL}/gigs/check-in/${eventId}`, {}, { withCredentials: true });
      showToast(res.data?.message || "Checked in", "success");
      fetchMyEvents();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to check in", "error");
    }
  };

  const checkOut = async (eventId) => {
    try {
      const res = await axios.post(`${serverURL}/gigs/check-out/${eventId}`, {}, { withCredentials: true });
      showToast(res.data?.message || "Checked out", "success");
      fetchMyEvents();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to check out", "error");
    }
  };

  useEffect(() => { fetchMyEvents(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Attendance" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-4">My Events</h3>
          {loading ? (
            <p>Loading...</p>
          ) : myEvents.length === 0 ? (
            <p className="text-gray-600">No events assigned.</p>
          ) : (
            <div className="space-y-3">
              {myEvents.map((ev) => (
                <div key={ev._id} className="border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ev?.name || ev?.event_name || "Event"}</p>
                    <p className="text-sm text-gray-600">Status: {ev?.attendance_status || "-"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 border rounded-md" onClick={() => setSelectedEvent(ev)}>Details</button>
                    <button className="px-3 py-2 bg-emerald-600 text-white rounded-md" onClick={() => checkIn(ev._id)}>Check In</button>
                    <button className="px-3 py-2 bg-rose-600 text-white rounded-md" onClick={() => checkOut(ev._id)}>Check Out</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedEvent && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h4 className="font-semibold mb-2">Event Details</h4>
            <p className="text-sm text-gray-700">{selectedEvent?.description || "No details provided."}</p>
            <div className="mt-4">
              <button className="px-4 py-2 border rounded-md" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default GigAttendance;