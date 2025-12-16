import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import { useNavigate } from "react-router-dom";
import { getEventTypeImage } from "../../utils/imageMaps.js";

function HostOrganizerStatus() {
  const navigate = useNavigate();
  const [appsSummary, setAppsSummary] = useState({ invited: [], requested: [], accepted: [], rejected: [] });
  const [assignedPools, setAssignedPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("invited"); // invited | requested | accepted | rejected
  const [poolForm, setPoolForm] = useState({ open: false, organizerId: "", eventId: "", pool_name: "", max_capacity: 10, required_skills: "", pay_min: "", pay_max: "", lat: "", lng: "" });
  const [orgDetails, setOrgDetails] = useState({ open: false, data: null, loading: false, error: null });

  const fetchAll = async () => {
    try {
      const [appsRes, poolsRes] = await Promise.all([
        axios.get(`${serverURL}/host/organizers/invites`, { withCredentials: true }),
        axios.get(`${serverURL}/host/organizer`, { withCredentials: true }),
      ]);
      setAppsSummary(appsRes.data?.data || { invited: [], requested: [], accepted: [], rejected: [] });
      setAssignedPools(poolsRes.data?.data || []);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load organizer status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const hasPoolForEvent = useMemo(() => {
    const map = new Map();
    assignedPools.forEach((p) => {
      if (p?.event?._id) map.set(p.event._id, p);
    });
    return (eventId) => map.get(eventId);
  }, [assignedPools]);

  const invitedApps = appsSummary.invited || [];
  const requestedApps = appsSummary.requested || [];
  const acceptedApps = appsSummary.accepted || [];
  const rejectedApps = appsSummary.rejected || [];

  const approveApplication = async (appId) => {
    try {
      await axios.post(`${serverURL}/host/approve-organizer/${appId}`, {}, { withCredentials: true });
      await fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to approve organizer");
    }
  };

  const rejectApplication = async (appId) => {
    try {
      await axios.post(`${serverURL}/host/reject-organizer/${appId}`, {}, { withCredentials: true });
      await fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to reject organizer");
    }
  };

  const openPoolForm = (organizerId, eventId) => {
    setPoolForm((f) => ({ ...f, open: true, organizerId, eventId }));
  };

  const openOrganizerDetails = async (organizerId) => {
    setOrgDetails({ open: true, data: null, loading: true, error: null });
    try {
      const res = await axios.get(`${serverURL}/host/organizers/${organizerId}/profile`, { withCredentials: true });
      setOrgDetails({ open: true, data: res.data?.data, loading: false, error: null });
    } catch (e) {
      setOrgDetails({ open: true, data: null, loading: false, error: e.response?.data?.message || "Failed to load organizer" });
    }
  };

  const createPool = async () => {
    const payMin = parseFloat(poolForm.pay_min);
    const payMax = parseFloat(poolForm.pay_max);
    if (!poolForm.pool_name || !poolForm.organizerId || !poolForm.eventId) {
      setError("Provide pool name and linked organizer/event");
      return;
    }
    if (isNaN(payMin) || isNaN(payMax)) {
      setError("Enter valid pay range");
      return;
    }
    const lat = parseFloat(poolForm.lat);
    const lng = parseFloat(poolForm.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError("Enter valid location coordinates");
      return;
    }
    try {
      const payload = {
        organizerId: poolForm.organizerId,
        eventId: poolForm.eventId,
        pool_name: poolForm.pool_name,
        location: { coordinates: [lng, lat] },
        max_capacity: Number(poolForm.max_capacity) || 10,
        required_skills: poolForm.required_skills,
        pay_range: { min: payMin, max: payMax },
      };
      await axios.post(`${serverURL}/host/pools/create`, payload, { withCredentials: true });
      setPoolForm({ open: false, organizerId: "", eventId: "", pool_name: "", max_capacity: 10, required_skills: "", pay_min: "", pay_max: "", lat: "", lng: "" });
      await fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create organizer pool");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizer status...</p>
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
            <h1 className="text-xl font-extrabold  bg-clip-text text-transparent">Organizer Status</h1>
            <div></div>
          </div>
          <div className="m-4 p-4 mb-5 flex items-center gap-2">
            <button onClick={() => setActiveTab("invited")} className={`px-3 py-2 text-sm rounded-lg ${activeTab === "invited" ? "bg-purple-600 text-white" : "border border-purple-200 text-purple-700 hover:bg-purple-50"}`}>Invited</button>
            <button onClick={() => setActiveTab("requested")} className={`px-3 py-2 text-sm rounded-lg ${activeTab === "requested" ? "bg-purple-600 text-white" : "border border-purple-200 text-purple-700 hover:bg-purple-50"}`}>Requested</button>
            <button onClick={() => setActiveTab("accepted")} className={`px-3 py-2 text-sm rounded-lg ${activeTab === "accepted" ? "bg-green-600 text-white" : "border border-green-200 text-green-700 hover:bg-green-50"}`}>Accepted</button>
            <button onClick={() => setActiveTab("rejected")} className={`px-3 py-2 text-sm rounded-lg ${activeTab === "rejected" ? "bg-pink-600 text-white" : "border border-pink-200 text-pink-700 hover:bg-pink-50"}`}>Rejected</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>}

        {activeTab === "invited" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitedApps.length === 0 ? (
              <p className="text-gray-600">No invitations yet.</p>
            ) : (
              invitedApps.map((app) => {
                const pool = hasPoolForEvent(app?.event?._id);
                const statusClass = app.application_status === 'accepted'
                  ? 'bg-green-100 text-green-700'
                  : app.application_status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700';
                return (
                  <div key={app._id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                    {app?.event?.event_type && (
                      <div className="relative h-28 w-full overflow-hidden">
                        <img src={getEventTypeImage(app.event.event_type)} alt={app.event.event_type} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-600/30 via-indigo-600/25 to-pink-600/25" />
                      </div>
                    )}
                    <div className="p-4 flex items-start justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusClass}`}>{app.application_status}</span>
                  </div>
                    {app.application_status === 'pending' && (
                      <p className="text-sm text-slate-500">Invitation sent • Awaiting organizer response</p>
                    )}
                    {app.application_status === 'accepted' && (
                      <div className="px-4 pb-4">
                        {app?.organizer_pool_exists ? (
                          <button disabled className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-600">Organizer pool created</button>
                        ) : (
                          <button onClick={() => openPoolForm(app.applicant?._id, app.event?._id)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">Create Organizer Pool</button>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              await axios.delete(`${serverURL}/host/organizers/applications/${app._id}`, { withCredentials: true });
                              await fetchAll();
                            } catch (e) {
                              setError(e.response?.data?.message || "Failed to delete");
                            }
                          }}
                          className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "requested" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestedApps.length === 0 ? (
              <p className="text-gray-600">No requests yet.</p>
            ) : (
              requestedApps.map((app) => {
                const statusClass = app.application_status === 'accepted'
                  ? 'bg-green-100 text-green-700'
                  : app.application_status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700';
                return (
                  <div key={app._id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                    {app?.event?.event_type && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img src={getEventTypeImage(app.event.event_type)} alt={app.event.event_type} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-600/30 via-indigo-600/25 to-pink-600/25" />
                      </div>
                    )}
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {app?.applicant?.avatar && (
                          <img src={app.applicant.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{app?.event?.title || "Event"}</p>
                          <p className="text-sm text-slate-600">Organizer: {app?.applicant?.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusClass}`}>{app.application_status}</span>
                    </div>
                    {app.application_status === 'pending' && (
                      <div className="px-4 pb-4 flex items-center gap-2">
                        <button onClick={() => approveApplication(app._id)} className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg">Accept</button>
                        <button onClick={() => rejectApplication(app._id)} className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg">Reject</button>
                      </div>
                    )}
                    {app.application_status === 'accepted' && (
                      <div className="px-4 pb-4">
                        {app?.organizer_pool_exists ? (
                          <button disabled className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-600">Organizer pool created</button>
                        ) : (
                          <button onClick={() => openPoolForm(app.applicant?._id, app.event?._id)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">Create Organizer Pool</button>
                        )}
                        <button onClick={() => openOrganizerDetails(app.applicant?._id)} className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">View Organizer</button>
                        <button
                          onClick={async () => {
                            try {
                              await axios.delete(`${serverURL}/host/organizers/applications/${app._id}`, { withCredentials: true });
                              await fetchAll();
                            } catch (e) {
                              setError(e.response?.data?.message || "Failed to delete");
                            }
                          }}
                          className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "accepted" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedApps.length === 0 ? (
              <p className="text-gray-600">No accepted items yet.</p>
            ) : (
              acceptedApps.map((app) => {
                const statusClass = 'bg-green-100 text-green-700';
                return (
                  <div key={app._id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                    {app?.event?.event_type && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img src={getEventTypeImage(app.event.event_type)} alt={app.event.event_type} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-600/30 via-indigo-600/25 to-pink-600/25" />
                      </div>
                    )}
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {app?.applicant?.avatar && (
                          <img src={app.applicant.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{app?.event?.title || "Event"}</p>
                          <p className="text-sm text-slate-600">Organizer: {app?.applicant?.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusClass}`}>{app.application_status}</span>
                    </div>
                    <div className="px-4 pb-4">
                      {app?.organizer_pool_exists ? (
                        <button disabled className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-600">Organizer pool created</button>
                      ) : (
                        <button onClick={() => openPoolForm(app.applicant?._id, app.event?._id)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">Create Organizer Pool</button>
                      )}
                      <button onClick={() => openOrganizerDetails(app.applicant?._id)} className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">View Organizer</button>
                      <button
                        onClick={async () => {
                          try {
                            await axios.delete(`${serverURL}/host/organizers/applications/${app._id}`, { withCredentials: true });
                            await fetchAll();
                          } catch (e) {
                            setError(e.response?.data?.message || "Failed to delete");
                          }
                        }}
                        className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "rejected" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rejectedApps.length === 0 ? (
              <p className="text-gray-600">No rejected items.</p>
            ) : (
              rejectedApps.map((app) => (
                <div key={app._id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                  {app?.event?.event_type && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <img src={getEventTypeImage(app.event.event_type)} alt={app.event.event_type} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-600/30 via-indigo-600/25 to-pink-600/25" />
                    </div>
                  )}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {app?.applicant?.avatar && (
                        <img src={app.applicant.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{app?.event?.title || "Event"}</p>
                        <p className="text-sm text-slate-600">Organizer: {app?.applicant?.email}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 capitalize">{app.application_status}</span>
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => openOrganizerDetails(app.applicant?._id)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">View Organizer</button>
                    <button
                      onClick={async () => {
                        try {
                          await axios.delete(`${serverURL}/host/organizers/applications/${app._id}`, { withCredentials: true });
                          await fetchAll();
                        } catch (e) {
                          setError(e.response?.data?.message || "Failed to delete");
                        }
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {poolForm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPoolForm((f) => ({ ...f, open: false }))}></div>
          <div className="relative z-10 bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h4 className="text-lg font-semibold mb-4">Create Organizer Pool</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input value={poolForm.pool_name} onChange={(e) => setPoolForm((f) => ({ ...f, pool_name: e.target.value }))} placeholder="Pool name" className="border rounded-lg px-3 py-2 text-sm" />
              <input type="number" min="1" value={poolForm.max_capacity} onChange={(e) => setPoolForm((f) => ({ ...f, max_capacity: e.target.value }))} placeholder="Max capacity" className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <input value={poolForm.required_skills} onChange={(e) => setPoolForm((f) => ({ ...f, required_skills: e.target.value }))} placeholder="Required skills (comma-separated)" className="border rounded-lg px-3 py-2 text-sm w-full mb-3" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" value={poolForm.pay_min} onChange={(e) => setPoolForm((f) => ({ ...f, pay_min: e.target.value }))} placeholder="Pay min (₹)" className="border rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={poolForm.pay_max} onChange={(e) => setPoolForm((f) => ({ ...f, pay_max: e.target.value }))} placeholder="Pay max (₹)" className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" value={poolForm.lat} onChange={(e) => setPoolForm((f) => ({ ...f, lat: e.target.value }))} placeholder="Lat" className="border rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={poolForm.lng} onChange={(e) => setPoolForm((f) => ({ ...f, lng: e.target.value }))} placeholder="Lng" className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setPoolForm((f) => ({ ...f, open: false }))} className="px-3 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={createPool} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
      {orgDetails.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOrgDetails({ open: false, data: null, loading: false, error: null })}></div>
          <div className="relative z-10 bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h4 className="text-lg font-semibold mb-4">Organizer Details</h4>
            {orgDetails.loading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>}
            {orgDetails.error && <div className="p-2 bg-red-50 text-red-600 rounded-lg mb-3">{orgDetails.error}</div>}
            {orgDetails.data && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {orgDetails.data.user?.avatar && (
                    <img src={orgDetails.data.user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{orgDetails.data.user?.first_name} {orgDetails.data.user?.last_name}</div>
                    <div className="text-sm text-slate-600">{orgDetails.data.user?.email}</div>
                    <div className="text-sm text-slate-600">{orgDetails.data.user?.phone}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Aadhaar Verified</div>
                    <div className="font-semibold">{orgDetails.data.kyc?.aadhaar_verified ? "Yes" : "No"}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-xs text-slate-500">Aadhaar Number</div>
                    <div className="font-semibold">**** **** **** {orgDetails.data.kyc?.aadhaar_last4 || "--"}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => setOrgDetails({ open: false, data: null, loading: false, error: null })} className="px-4 py-2 border rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostOrganizerStatus;
