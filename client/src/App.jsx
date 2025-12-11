import { useState } from "react";
import "./app.css";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/ForgotPaassword.jsx";
import { Router, Routes, Route } from "react-router-dom";
import Razorpay from "./pages/razorpay.jsx";
import Landing from "./pages/Landing.jsx";
import GigDashboard from "./pages/gig/Dashboard.jsx";

// Host imports
import HostLayout from "./layouts/HostLayout.jsx";
import HostDashboard from "./pages/host/Dashboard.jsx";
import FindOrganizers from "./pages/host/FindOrganizers.jsx";
import HostEvents from "./pages/host/Events.jsx";
import CreateEvent from "./pages/host/CreateEvent.jsx";
import HostEventDetails from "./pages/host/EventDetails.jsx";
import HostMessages from "./pages/host/Messages.jsx";
import HostWallet from "./pages/host/Wallet.jsx";

// Organizer imports
import OrganizerLayout from "./layouts/OrganizerLayout.jsx";
import OrganizerDashboard from "./pages/organizer/Dashboard.jsx";
import OrganizerApplications from "./pages/organizer/Applications.jsx";
import OrganizerEvents from "./pages/organizer/Events.jsx";
import OrganizerEventDetails from "./pages/organizer/EventDetails.jsx";
import OrganizerMessages from "./pages/organizer/Messages.jsx";
import OrganizerNotifications from "./pages/organizer/Notifications.jsx";
import OrganizerWallet from "./pages/organizer/Wallet.jsx";

export const serverURL = "http://localhost:8080/api/v1";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path='/register' element={<Register/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/forgot-password' element={<ForgotPassword/>} />
      {/* Add other routes here */}
      <Route path='/razorpay' element={<Razorpay/>} />

      {/* Gig pages */}
      <Route path="/gig/" element={<GigDashboard />} />

      {/* Host pages */}
      <Route path="/host" element={<HostLayout />}>
        <Route path="dashboard" element={<HostDashboard />} />
        <Route path="find-organizers" element={<FindOrganizers />} />
        <Route path="events" element={<HostEvents />} />
        <Route path="events/create" element={<CreateEvent />} />
        <Route path="events/:id" element={<HostEventDetails />} />
        <Route path="messages" element={<HostMessages />} />
        <Route path="wallet" element={<HostWallet />} />
      </Route>

      {/* Organizer pages */}
      <Route path="/organizer" element={<OrganizerLayout />}>
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="applications" element={<OrganizerApplications />} />
        <Route path="events" element={<OrganizerEvents />} />
        <Route path="events/:id" element={<OrganizerEventDetails />} />
        <Route path="messages" element={<OrganizerMessages />} />
        <Route path="notifications" element={<OrganizerNotifications />} />
        <Route path="wallet" element={<OrganizerWallet />} />
      </Route>

    </Routes>
  );
}

export default App;
