import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import the Home component for testing
import Home from './pages/Home';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Help from './pages/help';

// Gig Worker Pages
import GigDashboard from './pages/gig/Dashboard';
import GigEvents from './pages/gig/Events';
import GigNearbyEvents from './pages/gig/NearbyEvents';
import GigPools from './pages/gig/Pools';
import GigOrganizerPools from './pages/gig/OrganizerPools';
import PoolDetails from './pages/gig/PoolDetails';
import GigWallet from './pages/gig/Wallet';
import GigProfile from './pages/gig/Profile';
import PoolApplicationForm from './components/PoolApplicationForm';
import Withdraw from './pages/gig/Withdraw';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import OrganizerEvents from './pages/organizer/Events';
import OrganizerPools from './pages/organizer/Pools';
import OrganizerWallet from './pages/organizer/Wallet';
import ManagePool from './pages/organizer/ManagePool';
import PoolApplicationsView from './components/PoolApplicationsView';

// Host Pages
import HostDashboard from './pages/host/Dashboard';
import HostEvents from './pages/host/Events';
import HostPayments from './pages/host/Payments';
import CreateEvent from './pages/host/CreateEvent';
import HostMessages from './pages/host/Messages';
import Reviews from './pages/host/Reviews';
import ManageEvents from './pages/host/ManageEvents';
import EventDetails from './pages/host/EventDetails';
import EditEvent from './pages/host/EditEvent';
import Organizers from './pages/host/Organizers';

// Admin Pages
// import AdminDashboard from './pages/admin/Dashboard';
import AdminVerification from './pages/admin/Verification';
import Dispute from './pages/admin/Disputes';

// // Home/Landing
// import Home from './pages/Home';

const OrganizerMessagesLazy = lazy(() => import('./pages/organizer/Messages'));

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
    
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Gig Worker Routes */}
        <Route
          path="/dashboard/gig"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/events"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/nearby"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigNearbyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/pools"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigOrganizerPools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/pools/:poolId"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <PoolDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pools/:poolId/apply"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <PoolApplicationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/wallet"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/profile"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/withdraw"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <Withdraw />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/gigs"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/skills"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gig/messages"
          element={
            <ProtectedRoute allowedRoles={['gig']}>
              <GigDashboard />
            </ProtectedRoute>
          }
        />

      {/* help */}
        <Route path="/help" element={<Help />} />

        {/* Organizer Routes */}
        <Route
          path="/dashboard/organizer"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/events"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/pools"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerPools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/pools/:poolId/applications"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <PoolApplicationsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/pools/manage/:id"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <ManagePool />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/wallet"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/gigs"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/documents"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/tracking"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organizer/messages"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              {/* Messages page: host invitations and messages */}
              <Suspense fallback={<div>Loading...</div>}>
                <OrganizerMessagesLazy />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Host Routes */}
        <Route
          path="/dashboard/host"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/events"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/events/:id"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/events/create"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/messages"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <HostMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/organizers"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <Organizers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/manage-events"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/payments"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostPayments />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/host/reviews"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <Reviews />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        {/* <Route
          path="/admin/dashboard"
          element={
            // <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            // </ProtectedRoute>
          }
        /> */}
        <Route
          path="/admin/dashboard/verification"
          element={
            // <ProtectedRoute allowedRoles={['admin']}>
              <AdminVerification />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/disputes"
          element={
            // <ProtectedRoute allowedRoles={['admin']}>
              <Dispute />
            // </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
  ;
}

export default App;

