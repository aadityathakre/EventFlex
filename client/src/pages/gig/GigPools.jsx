import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function GigPools() {
  const { showToast } = useToast();
  const [nearby, setNearby] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [rate, setRate] = useState(0);
  const [cover, setCover] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      // Demo coordinates; replace with real location later
      const res = await axios.get(`${serverURL}/gigs/nearby-events`, {
        withCredentials: true,
        // If backend expects coordinates in body, switch to POST. Using GET here based on route.
      });
      const data = res.data?.data || [];
      setNearby(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to fetch nearby pools", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (poolId) => {
    try {
      const res = await axios.get(`${serverURL}/gigs/organizer-pool/${poolId}`, { withCredentials: true });
      setDetails(res.data?.data || null);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to fetch pool details", "error");
    }
  };

  const join = async (poolId) => {
    try {
      const res = await axios.post(
        `${serverURL}/gigs/join-pool/${poolId}`,
        { proposed_rate: rate || 0, cover_message: cover },
        { withCredentials: true }
      );
      showToast(res.data?.message || "Applied to pool", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to apply", "error");
    }
  };

  useEffect(() => { fetchNearby(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Join Organizer Pools" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-4">Nearby Pools</h3>
          {loading ? (
            <p>Loading...</p>
          ) : nearby.length === 0 ? (
            <p className="text-gray-600">No pools found nearby.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearby.map((pool) => (
                <div key={pool._id} className="border rounded-xl p-4">
                  <p className="font-semibold">{pool?.event_name || pool?.event || "Organizer Pool"}</p>
                  <p className="text-sm text-gray-600">Capacity: {pool?.capacity || "-"}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="px-3 py-2 border rounded-md"
                      onClick={() => { setSelected(pool._id); fetchDetails(pool._id); }}
                    >
                      View Details
                    </button>
                    <button
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                      onClick={() => setSelected(pool._id)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h4 className="font-semibold mb-2">Application</h4>
            {details ? (
              <p className="text-sm text-gray-700 mb-3">Event: {details?.orgPool?.event || "-"}</p>
            ) : (
              <p className="text-sm text-gray-500 mb-3">Loading pool details...</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Proposed Rate (INR)</label>
                <input type="number" min={0} step="1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cover Message</label>
                <textarea value={cover} onChange={(e) => setCover(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={3} />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-md" onClick={() => join(selected)}>Submit</button>
              <button className="px-4 py-2 border rounded-md" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default GigPools;