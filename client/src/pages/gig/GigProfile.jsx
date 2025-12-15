import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function GigProfile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/gig/profile`, { withCredentials: true });
      setProfile(res.data?.data || null);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="My Profile" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-4">Profile Details</h3>
          {loading ? (
            <p>Loading...</p>
          ) : !profile ? (
            <p className="text-gray-600">No profile data available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{profile?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold">{profile?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{profile?.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{profile?.location || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">KYC Status</p>
                <p className="font-semibold">{profile?.kyc_status || "Not Verified"}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GigProfile;