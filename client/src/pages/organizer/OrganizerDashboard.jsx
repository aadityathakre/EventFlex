import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../../App";
import TopNavbar from "../../components/TopNavbar.jsx";
import { getCardImage, getEventTypeImage } from "../../utils/imageMaps.js";
import {
  FaCalendarCheck,
  FaInbox,
  FaWallet,
  FaTools,
  FaUsers,
  FaComments,
  FaStar,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";

function OrganizerDashboard() {
  const navigate = useNavigate();
  
  const [recentEvents, setRecentEvents] = useState([]);
  const [viewAllEvents, setViewAllEvents] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${serverURL}/organizer/pools`, { withCredentials: true });
        const pools = res.data?.data || [];
        
        // Map to event+pool structure
        const eventsData = pools.map(p => {
            if (!p.event) return null;
            return {
                ...p.event,
                poolId: p._id,
                poolName: p.name,
                gigsCount: p.gigs?.length || 0,
                // Check if budget is number or decimal object
                budget: p.event.budget?.$numberDecimal || p.event.budget || "N/A"
            };
        }).filter(Boolean);

        // Filter active/completed
        const relevant = eventsData.filter(e => ['active', 'completed'].includes(e.status));

        // Sort: Active first, then by date desc
        relevant.sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (b.status === 'active' && a.status !== 'active') return 1;
            return new Date(b.updatedAt || b.start_date) - new Date(a.updatedAt || a.start_date);
        });

        setAllEvents(relevant);
        setRecentEvents(relevant.slice(0, 3));
      } catch (e) {
        console.warn("Failed to fetch events", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Top Navbar */}
      <TopNavbar title="My Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Heading */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Features
          </h2>
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
            />
          </div>
          <div className="basis-[30%] shrink-0">
            <ModuleCard
              title="Feedback"
              description="Ratings and reviews"
              image={getCardImage("feedback")}
              onClick={() => navigate("/organizer/feedbacks")}
              icon={<FaStar className="text-purple-600" />}
            />
          </div>
        </div>

        {/* Recent Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Events</h2>
            <button 
              onClick={() => setViewAllEvents(true)}
              className="text-purple-600 font-semibold hover:text-purple-800 text-sm"
            >
              View All Events
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>
          ) : recentEvents.length === 0 ? (
            <p className="text-gray-500 italic">No recent events found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentEvents.map((ev) => (
                <div key={ev._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="h-32 bg-gray-200 relative">
                     <img 
                       src={getEventTypeImage(ev.event_type)} 
                       alt={ev.title}
                       className="w-full h-full object-cover"
                     />
                     <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase ${
                       ev.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                     }`}>
                       {ev.status}
                     </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{ev.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(ev.start_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><FaUsers className="text-gray-400"/> {ev.gigsCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Events Overlay */}
        {viewAllEvents && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-800">All Events</h2>
                  <button onClick={() => setViewAllEvents(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <FaTimes className="text-gray-600 text-xl" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allEvents.map((ev) => (
                      <div key={ev._id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:translate-y-[-4px] transition-transform duration-300">
                         <div className="h-40 relative">
                           <img 
                             src={getEventTypeImage(ev.event_type)} 
                             alt={ev.title}
                             className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                           <div className="absolute bottom-3 left-4 right-4 text-white">
                             <h3 className="font-bold text-lg truncate">{ev.title}</h3>
                             <p className="text-xs opacity-90">{ev.location || "No location"}</p>
                           </div>
                           <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase ${
                              ev.status === 'active' ? 'bg-green-500 text-white' : 'bg-white/90 text-gray-700'
                           }`}>
                             {ev.status}
                           </div>
                         </div>
                         
                         <div className="p-5 flex-1 flex flex-col gap-4">
                           <div className="grid grid-cols-2 gap-4">
                             <div className="bg-purple-50 p-3 rounded-xl text-center">
                               <p className="text-xs text-purple-600 font-bold uppercase mb-1">Pool</p>
                               <p className="text-sm font-semibold text-gray-800 truncate">{ev.poolName || "N/A"}</p>
                             </div>
                             <div className="bg-indigo-50 p-3 rounded-xl text-center">
                               <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Budget</p>
                               <p className="text-sm font-semibold text-gray-800">₹{ev.budget}</p>
                             </div>
                           </div>
                           
                           <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                             <div className="flex items-center gap-2 text-sm text-gray-500">
                               <FaUsers className="text-gray-400"/>
                               <span>{ev.gigsCount} Gigs</span>
                             </div>
                             <button 
                               onClick={() => {
                                 setViewAllEvents(false);
                                 navigate("/organizer/pools");
                               }}
                               className="text-purple-600 font-bold text-sm hover:underline flex items-center gap-1"
                             >
                               Manage <FaArrowRight className="text-xs"/>
                             </button>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrganizerDashboard;
