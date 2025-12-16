import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import { useAuth } from "../../context/AuthContext";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getEventTypeImage, getCardImage } from "../../utils/imageMaps.js";
import {
  FaCalendarCheck,
  FaUsers,
  FaWallet,
  FaInbox,
  FaComments,
  FaTools,
} from "react-icons/fa";

function OrganizerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();


  const [activeModule, setActiveModule] = useState(null); // 'events' | 'hostStatus' | 'myPools' | 'applications' | 'manageGigs'

  // Persist active module across re-renders and navigation
  useEffect(() => {
  const saved = sessionStorage.getItem("org_active_module");
  if (saved && saved !== "wallet") {
    setActiveModule(saved);
  } else if (saved === "wallet") {
    sessionStorage.removeItem("org_active_module");
  }
  }, []);

  useEffect(() => {
  if (activeModule) {
    sessionStorage.setItem("org_active_module", activeModule);
  } else {
    sessionStorage.removeItem("org_active_module");
  }
  }, [activeModule]);

  // Shared UI helpers
  const ModuleCard = ({ title, description, image, onClick, icon, badgeIcon }) => (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30"></div>
        {badgeIcon && (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-purple-600">
            {badgeIcon}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );

  // 1) Get all events
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [details, setDetails] = useState(null);
  const activeEvents = useMemo(() => (events || []).filter((ev) => ev?.status !== "completed"), [events]);
  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/events/all`, {
        withCredentials: true,
      });
      setEvents(res.data?.data || []);
      setEventsError(null);
    } catch (e) {
      setEventsError("Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };
  const requestEvent = async (event) => {
    try {
      await axios.post(
        `${serverURL}/organizer/events/request-host/${event._id}`,
        { eventId: event._id, cover_letter: "Interested to organize this event." },
        { withCredentials: true }
      );
      showToast("Request sent successfully", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to send request", "error");
    }
  };
  const loadEventDetails = async (eventId) => {
    try {
      const res = await axios.get(`${serverURL}/organizer/events/${eventId}`, {
        withCredentials: true,
      });
      setDetails(res.data?.data);
    } catch (e) {
      showToast("Failed to fetch event details", "error");
    }
  };

  // 2) Host status (Invited vs Requested)
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState(null);
  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/applications`, {
        withCredentials: true,
      });
      setApplications(res.data?.data || []);
      setAppsError(null);
    } catch (e) {
      setAppsError("Failed to load applications");
    } finally {
      setAppsLoading(false);
    }
  };
  const invitedApps = useMemo(
    () => applications.filter((a) => a.application_status === "pending"),
    [applications]
  );
  const requestedApps = useMemo(
    () => applications.filter((a) => a.application_status !== "pending"),
    [applications]
  );
  const acceptInvite = async (appId) => {
    try {
      await axios.post(
        `${serverURL}/organizer/events/accept-invitation/${appId}`,
        {},
        { withCredentials: true }
      );
      await fetchApplications();
      showToast("Invitation accepted", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to accept invitation", "error");
    }
  };
  const rejectInvite = async (appId) => {
    try {
      await axios.post(
        `${serverURL}/organizer/events/reject-invitation/${appId}`,
        {},
        { withCredentials: true }
      );
      await fetchApplications();
      showToast("Invitation rejected", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to reject invitation", "error");
    }
  };
  const createPoolForApp = async (app) => {
    const name = `Pool for ${app?.event?.title || "Event"}`;
    const description = "Gig pool for event";
    try {
      await axios.post(
        `${serverURL}/organizer/pools/create`,
        { name, eventId: app.event?._id, description },
        { withCredentials: true }
      );
      showToast("Pool created successfully", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to create pool", "error");
    }
  };

  // Wallet is handled via dedicated page (/organizer/wallet). Dashboard no longer renders wallet inline.

  // 4) My Pools
  const [myPools, setMyPools] = useState([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const fetchMyPools = async () => {
    setPoolsLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/pools`, {
        withCredentials: true,
      });
      setMyPools(res.data?.data || []);
    } catch {
      // ignore
    } finally {
      setPoolsLoading(false);
    }
  };
  const [editPoolId, setEditPoolId] = useState("");
  const [editPoolName, setEditPoolName] = useState("");
  const [editPoolDesc, setEditPoolDesc] = useState("");
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
      setMyPools((prev) => prev.map((p) => (p._id === editPoolId ? res.data?.data : p)));
      cancelEditPool();
      showToast("Pool updated", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update pool", "error");
    }
  };

  // 5) Pool applications
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [poolApps, setPoolApps] = useState([]);
  const [poolAppsLoading, setPoolAppsLoading] = useState(false);
  const fetchPoolApps = async (poolId) => {
    if (!poolId) return;
    setPoolAppsLoading(true);
    try {
      const res = await axios.get(`${serverURL}/organizer/pools/${poolId}/applications`, {
        withCredentials: true,
      });
      setPoolApps(res.data?.data || []);
    } catch {
      // ignore
    } finally {
      setPoolAppsLoading(false);
    }
  };
  const reviewPoolApp = async (app, action) => {
    try {
      // get organizer pool for capacity check
      const eventId = myPools.find((p) => p._id === app.pool)?.event?._id;
      let orgPoolId = null;
      if (eventId) {
        const orgPoolRes = await axios.get(
          `${serverURL}/organizer/org-pools/by-event/${eventId}`,
          { withCredentials: true }
        ).catch(() => null);
        orgPoolId = orgPoolRes?.data?.data?._id || null;
      }
      await axios.post(
        `${serverURL}/organizer/applications/${app._id}/review`,
        { action, orgPoolId },
        { withCredentials: true }
      );
      await fetchPoolApps(selectedPoolId);
      showToast(action === "approve" ? "Gig approved and added" : "Gig application rejected", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to review application", "error");
    }
  };

  // 6) Manage gigs (chat)
  const chatWithGig = async (gigId, eventId, poolId) => {
    try {
      const res = await axios.post(
        `${serverURL}/organizer/pools/chat/${gigId}`,
        { eventId, poolId },
        { withCredentials: true }
      );
      const convId = res.data?.data?.conversation?._id;
      if (convId) {
        navigate(`/organizer/chat/${convId}`);
        showToast("Chat ready", "success");
      } else {
        showToast("Chat ready", "success");
      }
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to send message", "error");
    }
  };

  // Auto-load some data when module opens
  useEffect(() => {
    if (activeModule === "events") fetchEvents();
    if (activeModule === "hostStatus") fetchApplications();
    if (activeModule === "myPools" || activeModule === "applications" || activeModule === "manageGigs") fetchMyPools();
  }, [activeModule]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Top Navbar */}
      <TopNavbar title="My Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Heading */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Features</h2>
          <p className="text-gray-600 mt-1">Quick access to organizer tools.</p>
        </div>

        {/* Module Buttons */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="basis-[30%] shrink-0">
            <ModuleCard
            title="Get All Events"
            description="Browse and request to organize"
            image={getCardImage("events")}
            onClick={() => navigate("/organizer/events")}
            icon={<FaCalendarCheck className="text-purple-600" />}
            />
          </div>
          <div className="basis-[30%] shrink-0">
            <ModuleCard
            title="Host Status"
            description="Invitations and requests"
            image={getCardImage("hostStatus")}
            onClick={() => navigate("/organizer/host-status")}
            icon={<FaInbox className="text-purple-600" />}
            />
          </div>
          <div className="basis-[30%] shrink-0">
            <ModuleCard
            title="Wallet"
            description="Balance and withdraw"
            image={getCardImage("wallet")}
            onClick={() => navigate("/organizer/wallet")}
            icon={<FaWallet className="text-purple-600" />}
            />
          </div>
          <div className="basis-[30%] shrink-0">
            <ModuleCard
            title="My Pool"
            description="Edit pools and view gigs"
            image={getCardImage("myPools")}
            onClick={() => navigate("/organizer/pools")}
            icon={<FaTools className="text-purple-600" />}
            badgeIcon={<FaComments />}
            />
          </div>
          <div className="basis-[30%] shrink-0">
            <ModuleCard
            title="Pool Applications"
            description="Review gig applications"
            image={getCardImage("poolApplications")}
            onClick={() => navigate("/organizer/pool-applications")}
            icon={<FaUsers className="text-purple-600" />}
            />
          </div>
          <div className="basis-[30%] shrink-0">
            <ModuleCard
            title="Manage Gigs"
            description="View gigs and chat"
            image={getCardImage("manageGigs")}
            onClick={() => navigate("/organizer/manage-gigs")}
            icon={<FaComments className="text-purple-600" />}
            // badgeIcon={<FaComments />}
            />
          </div>
        </div>

        {/* Module Content */}
        {activeModule === "events" && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Active Events</h3>
              {eventsLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              )}
            </div>
            {eventsError && <p className="text-red-600 mb-4">{eventsError}</p>}
            {activeEvents.length === 0 ? (
              <p className="text-gray-600">No events found.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {activeEvents.map((e) => (
                  <div key={e._id} className="w-[30%] border rounded-xl p-4 hover:shadow-md transition relative">
                    <img
                      src={getEventTypeImage(e.event_type)}
                      alt={e.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      loading="lazy"
                    />
                    <p className="font-semibold text-gray-900">{e.title}</p>
                    <p className="text-sm text-gray-600">{e.description?.slice(0, 90) || "Event"}</p>
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => loadEventDetails(e._id)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                      >
                        More Details
                      </button>
                      <button
                        onClick={() => requestEvent(e)}
                        className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow"
                      >
                        Request to Organize
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {details && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
                  <h4 className="text-lg font-bold mb-2">{details?.title}</h4>
                  <p className="text-gray-600 mb-4">{details?.description}</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Start: {details?.start_date?.slice(0, 10) || "-"}</p>
                    <p>End: {details?.end_date?.slice(0, 10) || "-"}</p>
                    <p>Location: {details?.location?.city || details?.location?.address || "-"}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => setDetails(null)} className="px-4 py-2 border rounded-lg">Close</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeModule === "hostStatus" && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => fetchApplications()}>Refresh</button>
            </div>
            {appsLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : appsError ? (
              <p className="text-red-600">{appsError}</p>
            ) : (
              <div className="w-full">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Invited</h4>
                  {invitedApps.length === 0 ? (
                    <p className="text-gray-600">No invitations.</p>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {invitedApps.map((a) => (
                        <div key={a._id} className="w-[30%] border rounded-xl p-4 mb-3">
                          <img
                            src={getEventTypeImage(a?.event?.event_type)}
                            alt={a?.event?.title || "Event"}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                            loading="lazy"
                          />
                          <p className="font-semibold">{a?.event?.title || "Event"}</p>
                          <p className="text-sm text-gray-600">Status: {a.application_status}</p>
                          <div className="flex items-center justify-end space-x-2 mt-3">
                            <button onClick={() => rejectInvite(a._id)} className="px-3 py-2 text-sm border rounded-lg">Reject</button>
                            <button onClick={() => acceptInvite(a._id)} className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Accept</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Requested</h4>
                  {requestedApps.length === 0 ? (
                    <p className="text-gray-600">No requests yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {requestedApps.map((a) => (
                        <div key={a._id} className="w-[30%] border rounded-xl p-4 mb-3">
                          <img
                            src={getEventTypeImage(a?.event?.event_type)}
                            alt={a?.event?.title || "Event"}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                            loading="lazy"
                          />
                          <p className="font-semibold">{a?.event?.title || "Event"}</p>
                          <p className="text-sm text-gray-600">Status: {a.application_status}</p>
                          {a.application_status === "accepted" && (
                            <div className="mt-2 text-right">
                              <button onClick={() => createPoolForApp(a)} className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Create Pool</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Wallet module removed from dashboard; visit /organizer/wallet */}

        {activeModule === "myPools" && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            {poolsLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : myPools.length === 0 ? (
              <p className="text-gray-600">No pools yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {myPools.map((p) => (
                  <div key={p._id} className="w-[30%] border rounded-xl p-4">
                    <img
                      src={getEventTypeImage(p?.event?.event_type)}
                      alt={p?.event?.title || "Event"}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                      loading="lazy"
                    />
                    {editPoolId === p._id ? (
                      <div className="space-y-3">
                        <h5 className="font-semibold">Edit Pool</h5>
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
                        <p className="font-semibold text-gray-900">{p.name}</p>
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
                                  <button onClick={() => chatWithGig(g._id, p?.event?._id, p._id)} className="px-3 py-1 text-xs border rounded-lg">Chat with Gig</button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeModule === "applications" && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <select
                value={selectedPoolId}
                onChange={(e) => {
                  setSelectedPoolId(e.target.value);
                  fetchPoolApps(e.target.value);
                }}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select a pool</option>
                {myPools.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p?.event?.title || "Event"})
                  </option>
                ))}
              </select>
              <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => fetchPoolApps(selectedPoolId)}>
                Refresh
              </button>
            </div>
            {poolAppsLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : selectedPoolId && poolApps.length === 0 ? (
              <p className="text-gray-600">No applications for this pool.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {poolApps.map((a) => (
                  <div key={a._id} className="w-[30%] border rounded-xl p-4">
                    <img
                      src={getEventTypeImage(myPools.find((p) => p._id === a.pool)?.event?.event_type)}
                      alt={(myPools.find((p) => p._id === a.pool)?.event?.title) || "Event"}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                      loading="lazy"
                    />
                    <div className="flex items-center space-x-2 mb-2">
                      <img src={a?.gig?.avatar} alt={a?.gig?.fullName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold">{a?.gig?.fullName || `${a?.gig?.first_name} ${a?.gig?.last_name}`}</p>
                        <p className="text-sm text-gray-600">Proposed: ₹ {(a?.proposed_rate?.$numberDecimal || a?.proposed_rate)?.toString?.() || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => reviewPoolApp(a, "reject")} className="px-3 py-2 text-sm border rounded-lg">Reject</button>
                      <button onClick={() => reviewPoolApp(a, "approve")} className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">Accept</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeModule === "manageGigs" && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            {poolsLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : myPools.length === 0 ? (
              <p className="text-gray-600">No pools to manage.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {myPools.map((p) => (
                  <div key={p._id} className="w-[30%] border rounded-xl p-4">
                    <img
                      src={getEventTypeImage(p?.event?.event_type)}
                      alt={p?.event?.title || "Event"}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                      loading="lazy"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-gray-600">{p?.event?.title}</p>
                      </div>
                      <button
                        onClick={() => setSelectedPoolId(selectedPoolId === p._id ? "" : p._id)}
                        className="px-3 py-2 text-sm border rounded-lg"
                      >
                        Gigs
                      </button>
                    </div>
                    {selectedPoolId === p._id && (
                      <div className="mt-3 space-y-2">
                        {(p.gigs || []).length === 0 ? (
                          <p className="text-gray-600">No gigs joined.</p>
                        ) : (
                          p.gigs.map((g) => (
                            <div key={g._id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img src={g.avatar} alt={g.fullName} className="w-8 h-8 rounded-full object-cover" />
                                <span className="text-sm font-medium">{g.fullName || `${g.first_name} ${g.last_name}`}</span>
                              </div>
                              <button onClick={() => chatWithGig(g._id, p?.event?._id, p._id)} className="px-3 py-1 text-xs border rounded-lg">Chat with Gig</button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default OrganizerDashboard;
