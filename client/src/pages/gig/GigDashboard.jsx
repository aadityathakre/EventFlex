import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { FaCalendarAlt, FaWallet, FaSignOutAlt, FaUserCircle, FaBell, FaComments } from "react-icons/fa";

function GigDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, eventsRes] = await Promise.all([
          axios.get(`${serverURL}/gigs/dashboard`, { withCredentials: true }),
          axios.get(`${serverURL}/gigs/my-events`, { withCredentials: true }),
        ]);
        setStats(dashRes.data?.data || null);
        setEvents(eventsRes.data?.data || []);
        setError(null);
      } catch (err) {
        console.error("Gig dashboard error:", err);
        setError(err.response?.data?.message || "Failed to load gig dashboard");
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const formatCurrencyINR = (val) => {
    const n = typeof val === "object" && val?.$numberDecimal ? parseFloat(val.$numberDecimal) : parseFloat(val || 0);
    if (isNaN(n)) return "₹0.00";
    return `₹${n.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const recentEvents = [...events].slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="My Dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name || "Gig"}!
          </h2>
          <p className="text-gray-600">Manage your gigs and track your activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalEvents ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Available Balance (INR)</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrencyINR(stats?.totalEarnings)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaWallet className="text-indigo-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{typeof stats?.averageRating === "number" ? stats.averageRating.toFixed(1) : "-"}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <FaComments className="text-pink-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions tailored for Gigs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => navigate("/gig/wallet")} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-40 overflow-hidden">
                <img src="/cards_images/wallet.png" alt="Wallet" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/40 via-purple-600/30 to-pink-600/20 opacity-60"></div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Wallet</h4>
                <p className="text-gray-600 mb-4">Check balance and withdraw</p>
              </div>
            </div>
            <div onClick={() => navigate("/gig/pools")} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-40 overflow-hidden">
                <img src="/cards_images/pool.png" alt="Join Pool" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 via-indigo-600/30 to-pink-600/20 opacity-60"></div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Join Pool</h4>
                <p className="text-gray-600 mb-4">Find and apply to organizer pools</p>
              </div>
            </div>
            <div onClick={() => navigate("/gig/attendance")} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-40 overflow-hidden">
                <img src="/cards_images/escrow.png" alt="Attendance" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-600/40 via-indigo-600/30 to-purple-600/20 opacity-60"></div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Attendance</h4>
                <p className="text-gray-600 mb-4">Check-in/out and view history</p>
              </div>
            </div>
            <div onClick={() => navigate("/gig/attendance")} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-40 overflow-hidden">
                <img src="/cards_images/poolApplication.png" alt="My Events" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 via-indigo-600/30 to-pink-600/20 opacity-60"></div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">My Events</h4>
                <p className="text-gray-600 mb-4">Accepted events and assignments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events (Accepted Assignments) */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Recent Events</h3>
            <button
              onClick={() => navigate("/gig/pools")}
              className="text-purple-600 hover:text-indigo-600 font-semibold"
            >
              View All
            </button>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No accepted events yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((pool) => (
                <div key={pool._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
                  <div>
                    <h4 className="font-semibold text-gray-900">{pool.pool_name || "Assigned Pool"}</h4>
                    {pool.status && (
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        pool.status === "active" ? "bg-green-100 text-green-800" :
                        pool.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}>{pool.status}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/gig/attendance`)} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-all duration-300">
                      View
                    </button>
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

export default GigDashboard;
