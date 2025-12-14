import { useState } from "react";
import "./app.css";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/ForgotPaassword.jsx";
import { Router, Routes, Route, Navigate } from "react-router-dom";
import Razorpay from "./pages/razorpay.jsx";
import Landing from "./pages/Landing.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Host imports
import HostLayout from "./layouts/HostLayout.jsx";
import HostDashboard from "./pages/host/Dashboard.jsx";
import FindOrganizers from "./pages/host/FindOrganizers.jsx";
import HostEvents from "./pages/host/Events.jsx";
import CreateEvent from "./pages/host/CreateEvent.jsx";
import EditEvent from "./pages/host/EditEvent.jsx";
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

// Gig imports
import GigLayout from "./layouts/GigLayout.jsx";
import GigDashboard from "./pages/gig/Dashboard.jsx";
import FindNearbyEvents from "./pages/gig/FindNearbyEvents.jsx";
import GigEvents from "./pages/gig/Events.jsx";
import GigEventDetails from "./pages/gig/EventDetails.jsx";
import GigMessages from "./pages/gig/Messages.jsx";
import GigNotifications from "./pages/gig/Notifications.jsx";
import GigWallet from "./pages/gig/Wallet.jsx";

// Admin imports
import AdminLayout from "./components/AdminLayout.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminRegister from "./pages/admin/Register.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminKYC from "./pages/admin/KYC.jsx";
import AdminDisputes from "./pages/admin/Disputes.jsx";
import AdminAnalytics from "./pages/admin/Analytics.jsx";
import AdminNotifications from "./pages/admin/Notifications.jsx";
import AdminAuditLogs from "./pages/admin/AuditLogs.jsx";

export const serverURL = "http://localhost:8080/api/v1";

function App() {
  return (
    <AuthProvider>
      <Routes>
      <Route path="/" element={<Landing />} />

      <Route path='/register' element={<Register/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/forgot-password' element={<ForgotPassword/>} />
      {/* Add other routes here */}
      <Route path='/razorpay' element={<Razorpay/>} />

      {/* Admin auth pages */}
      <Route path='/admin/login' element={<AdminLogin/>} />
      <Route path='/admin/register' element={<AdminRegister/>} />

      {/* Gig pages */}
      <Route path="/gig" element={<GigLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<GigDashboard />} />
        <Route path="nearby-events" element={<FindNearbyEvents />} />
        <Route path="my-events" element={<GigEvents />} />
        <Route path="my-events/:id" element={<GigEventDetails />} />
        <Route path="messages" element={<GigMessages />} />
        <Route path="notifications" element={<GigNotifications />} />
        <Route path="wallet" element={<GigWallet />} />
      </Route>

      {/* Host pages */}
      <Route path="/host" element={<HostLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HostDashboard />} />
        <Route path="find-organizers" element={<FindOrganizers />} />
        <Route path="events" element={<HostEvents />} />
        <Route path="events/create" element={<CreateEvent />} />
        <Route path="events/:id/edit" element={<EditEvent />} />
        <Route path="events/:id" element={<HostEventDetails />} />
        <Route path="messages" element={<HostMessages />} />
        <Route path="wallet" element={<HostWallet />} />
      </Route>

      {/* Organizer pages */}
      <Route path="/organizer" element={<OrganizerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="applications" element={<OrganizerApplications />} />
        <Route path="events" element={<OrganizerEvents />} />
        <Route path="events/:id" element={<OrganizerEventDetails />} />
        <Route path="messages" element={<OrganizerMessages />} />
        <Route path="notifications" element={<OrganizerNotifications />} />
        <Route path="wallet" element={<OrganizerWallet />} />
      </Route>

      {/* Admin pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="kyc" element={<AdminKYC />} />
        <Route path="disputes" element={<AdminDisputes />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>

      </Routes>
    </AuthProvider>
  );
}

export default App;
