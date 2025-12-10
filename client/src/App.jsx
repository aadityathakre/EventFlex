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
import EventDetails from "./pages/host/EventDetails.jsx";
import HostMessages from "./pages/host/Messages.jsx";
import HostWallet from "./pages/host/Wallet.jsx";

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
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="messages" element={<HostMessages />} />
        <Route path="wallet" element={<HostWallet />} />
      </Route>

    </Routes>
  );
}

export default App;
