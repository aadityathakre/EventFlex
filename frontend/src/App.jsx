import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Gig Worker Pages
import GigDashboard from './pages/gig/Dashboard';
import GigEvents from './pages/gig/Events';
import GigNearbyEvents from './pages/gig/NearbyEvents';
import GigPools from './pages/gig/Pools';
import GigWallet from './pages/gig/Wallet';
import GigProfile from './pages/gig/Profile';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import OrganizerEvents from './pages/organizer/Events';
import OrganizerPools from './pages/organizer/Pools';
import OrganizerWallet from './pages/organizer/Wallet';

// Host Pages
import HostDashboard from './pages/host/Dashboard';
import HostEvents from './pages/host/Events';
import HostOrganizers from './pages/host/Organizers';
import HostPayments from './pages/host/Payments';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminKYC from './pages/admin/KYC';
import AdminDisputes from './pages/admin/Disputes';
import AdminAnalytics from './pages/admin/Analytics';
import AdminVerification from './pages/admin/Verification';

// Host Pages
import HostLegalCompliance from './pages/host/LegalCompliance';

// Home/Landing
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
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
              <GigPools />
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
              <OrganizerDashboard />
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
          path="/dashboard/host/organizers"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostOrganizers />
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
          path="/dashboard/host/legal-compliance"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostLegalCompliance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/manage-events"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/host/reviews"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/kyc"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminKYC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/disputes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDisputes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/verification"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminVerification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/disputes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDisputes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminVerification />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

