import React, { useEffect, useState } from "react";
import axios from "axios";
import TopNavbar from "../../components/TopNavbar.jsx";
import { serverURL } from "../../App";
import { useToast } from "../../context/ToastContext.jsx";

function GigFeedbacks() {
  const { showToast } = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/gigs/feedbacks`, { withCredentials: true });
      setFeedbacks(res.data?.data || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load feedbacks");
      showToast(e?.response?.data?.message || "Failed to load feedbacks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Feedback & Ratings" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Feedbacks</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-gray-600">No feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f) => (
                <div key={f._id} className="border rounded-xl p-4">
                  <p className="font-semibold">{f?.event?.title || "Event"}</p>
                  <p className="text-sm text-gray-600">Rating: {f.rating}/5</p>
                  <p className="text-sm text-gray-700 mt-1">{f.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">At: {new Date(f.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GigFeedbacks;
