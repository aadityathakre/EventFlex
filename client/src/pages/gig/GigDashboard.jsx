import React from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "../../components/TopNavbar.jsx";

const ModuleCard = ({ title, description, image, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer w-full md:w-[30%] bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden group"
  >
    <div className="relative h-32 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-pink-600/30" />
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

function GigDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <TopNavbar title="Gig Dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-40">
            <img src="/cards_images/gigs.png" alt="Gig" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30" />
            <div className="absolute bottom-4 left-6">
              <h2 className="text-2xl font-bold text-white drop-shadow">Welcome, Gig</h2>
              <p className="text-white/90 text-sm">Manage your profile, wallet, pools, attendance, and chat</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-6">
              <ModuleCard
                title="Profile"
                description="View and edit your profile"
                image="/cards_images/gigs.png"
                onClick={() => navigate("/gig/profile")}
              />
              <ModuleCard
                title="Wallet"
                description="Check balance and withdraw"
                image="/cards_images/wallet.png"
                onClick={() => navigate("/gig/wallet")}
              />
              <ModuleCard
                title="Join Pool"
                description="Find and apply to organizer pools"
                image="/cards_images/pool.png"
                onClick={() => navigate("/gig/pools")}
              />
              <ModuleCard
                title="Attendance"
                description="Check-in/out and view history"
                image="/cards_images/escrow.png"
                onClick={() => navigate("/gig/attendance")}
              />
              <ModuleCard
                title="Chat"
                description="Conversations with organizers"
                image="/cards_images/host.png"
                onClick={() => navigate("/gig/chat")}
              />
              <ModuleCard
                title="My Events"
                description="Accepted events and assignments"
                image="/cards_images/poolApplication.png"
                onClick={() => navigate("/gig/events")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GigDashboard;