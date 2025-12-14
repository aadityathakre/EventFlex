import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getEventTypeImage } from "../../utils/imageMaps.js";

function OrganizerHostStatus() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("invited"); // invited | requested | rejected
  const [poolModal, setPoolModal] = useState({ open: false, app: null, name: "", description: "" });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/applications`, { withCredentials: true });
      setApplications(res.data?.data || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const invitedApps = useMemo(
    () => applications.filter((a) => a.application_status === "pending"),
    [applications]
  );
  const requestedApps = useMemo(
    () => applications.filter((a) => a.application_status !== "pending"),
    [applications]
  );
  const rejectedApps = useMemo(
    () => applications.filter((a) => a.application_status === "rejected"),
    [applications]
  );

  const acceptInvite = async (appId) => {
    try {
      await axios.post(`${serverURL}/organizer/events/accept-invitation/${appId}`, {}, { withCredentials: true });
      await fetchApplications();
      showToast("Invitation accepted", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to accept invitation", "error");
    }
  };

  const rejectInvite = async (appId) => {
    try {
      await axios.post(`${serverURL}/organizer/events/reject-invitation/${appId}`, {}, { withCredentials: true });
      await fetchApplications();
      showToast("Invitation rejected", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to reject invitation", "error");
    }
  };

  const openPoolModal = async (app) => {
    // Check if organizer pool already exists for event to disable creation
    try {
      const r = await axios.get(`${serverURL}/organizer/org-pools/by-event/${app?.event?._id}`, { withCredentials: true });
      if (r.data?.data) {
        showToast("Pool already exists for this event", "error");
        return;
      }
    } catch {}
    setPoolModal({ open: true, app, name: `Pool for ${app?.event?.title || "Event"}`, description: "Gig pool for event" });
  };

  const createPool = async () => {
    const { app, name, description } = poolModal;
    if (!name?.trim()) {
      showToast("Pool name is required", "error");
      return;
    }
    try {
      await axios.post(
        `${serverURL}/organizer/pools/create`,
        { name, eventId: app.event?._id, description },
        { withCredentials: true }
      );
      showToast("Pool created", "success");
      setPoolModal({ open: false, app: null, name: "", description: "" });
      await fetchApplications();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to create pool", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Host Invitations & Requests" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Status</h2>
            <button onClick={fetchApplications} className="px-3 py-2 text-sm border rounded-lg">Refresh</button>
          </div>
          {loading && <div className="mt-4 animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>}
          {error && <p className="text-red-600 mt-3">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab("invited")}
              className={`px-3 py-2 text-sm rounded-lg ${activeTab === "invited" ? "bg-purple-600 text-white" : "border"}`}
            >
              Invited
            </button>
            <button
              onClick={() => setActiveTab("requested")}
              className={`px-3 py-2 text-sm rounded-lg ${activeTab === "requested" ? "bg-indigo-600 text-white" : "border"}`}
            >
              Requested
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-2 text-sm rounded-lg ${activeTab === "rejected" ? "bg-pink-600 text-white" : "border"}`}
            >
              Rejected
            </button>
          </div>
        </div>

        {activeTab === "invited" ? (
          <div>
            {invitedApps.length === 0 ? (
              <p className="text-gray-600">No invitations.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {invitedApps.map((a) => (
                  <div key={a._id} className="w-[30%] bg-white rounded-2xl shadow overflow-hidden mb-4">
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={getEventTypeImage(a?.event?.event_type)}
                        alt={a?.event?.title || "Event"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30" />
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{a?.event?.title || "Event"}</p>
                        <p className="text-sm text-gray-600">Status: {a.application_status}</p>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => rejectInvite(a._id)} className="px-3 py-2 text-sm border rounded-lg">Reject</button>
                        <button onClick={() => acceptInvite(a._id)} className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Accept</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {requestedApps.length === 0 ? (
              <p className="text-gray-600">No requests yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {requestedApps.map((a) => (
                  <div key={a._id} className="w-[30%] bg-white rounded-2xl shadow overflow-hidden mb-4">
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={getEventTypeImage(a?.event?.event_type)}
                        alt={a?.event?.title || "Event"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30" />
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{a?.event?.title || "Event"}</p>
                        <p className="text-sm text-gray-600">Status: {a.application_status}</p>
                      </div>
                      {a.application_status === "accepted" && (
                        <div>
                          <button onClick={() => openPoolModal(a)} className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Create Pool</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "rejected" && (
          <div>
            {rejectedApps.length === 0 ? (
              <p className="text-gray-600">No rejected items.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {rejectedApps.map((a) => (
                  <div key={a._id} className="w-[30%] bg-white rounded-2xl shadow overflow-hidden mb-4">
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={getEventTypeImage(a?.event?.event_type)}
                        alt={a?.event?.title || "Event"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30" />
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{a?.event?.title || "Event"}</p>
                        <p className="text-sm text-gray-600">Status: {a.application_status}</p>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs bg-pink-100 text-pink-700">Rejected</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {poolModal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <h4 className="text-xl font-bold mb-2">Create Pool</h4>
              <p className="text-sm text-gray-600 mb-4">Event: {poolModal.app?.event?.title}</p>
              <div className="space-y-3">
                <input
                  value={poolModal.name}
                  onChange={(e) => setPoolModal((m) => ({ ...m, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Pool name"
                />
                <textarea
                  value={poolModal.description}
                  onChange={(e) => setPoolModal((m) => ({ ...m, description: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Pool description"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setPoolModal({ open: false, app: null, name: "", description: "" })} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={createPool} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Create</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrganizerHostStatus;