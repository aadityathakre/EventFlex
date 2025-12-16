import React, { useEffect, useState } from "react";
import axios from "axios";
import TopNavbar from "../../components/TopNavbar.jsx";
import { serverURL } from "../../App";
import { useToast } from "../../context/ToastContext.jsx";

function GigBadges() {
  const { showToast } = useToast();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/gigs/badges`, { withCredentials: true });
      const items = res.data?.data || [];
      setBadges(items);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load badges");
      showToast(e?.response?.data?.message || "Failed to load badges", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="My Badges" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Badges</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : badges.length === 0 ? (
            <p className="text-gray-600">No badges awarded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {badges.map((b) => (
                <div key={b._id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{b?.badge?.badge_name || "Badge"}</p>
                      <p className="text-xs text-gray-600">Awarded: {new Date(b.awarded_at || b.createdAt).toLocaleString()}</p>
                    </div>
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

export default GigBadges;
