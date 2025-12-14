import { useState } from "react";
import "./app.css";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/ForgotPaassword.jsx";
import HostDashboard from "./pages/HostDashboard.jsx";
import HostProfileView from "./pages/HostProfileView.jsx";
import HostProfileEdit from "./pages/HostProfileEdit.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Razorpay from "./pages/razorpay.jsx";
import HostEventCreate from "./pages/HostEventCreate.jsx";
import HostEventsList from "./pages/HostEventsList.jsx";
import HostEventDetail from "./pages/HostEventDetail.jsx";
import HostEventEdit from "./pages/HostEventEdit.jsx";
import HostOrganizers from "./pages/HostOrganizers.jsx";
import HostPayments from "./pages/HostPayments.jsx";

export const serverURL = `${import.meta.env.VITE_SERVER_URL}:${import.meta.env.VITE_PORT}/api/v1`;

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/register', '/login', '/forgot-password'].includes(location.pathname);

  return (
    <div className="relative">
      {/* Always render Home, but blur it when auth pages are open */}
      <div className={isAuthPage ? "blur-sm pointer-events-none select-none" : ""}>
        <Home />
      </div>
      
      {/* Render auth pages as modals on top */}
      {isAuthPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => navigate("/")}></div>
          <div className="relative z-10 w-full max-w-lg">
            {location.pathname === '/register' && <Register />}
            {location.pathname === '/login' && <Login />}
            {location.pathname === '/forgot-password' && <ForgotPassword />}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/register' element={<AppContent/>} />
      <Route path='/login' element={<AppContent/>} />
      <Route path='/forgot-password' element={<AppContent/>} />
      <Route path='/razorpay' element={<Razorpay/>} />
      
      {/* Protected Host Routes */}
      <Route 
        path='/host/dashboard' 
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostDashboard />
          </ProtectedRoute>
        } 
      />
      {/* Host Profile View Route */}
      <Route
        path='/host/profile'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostProfileView />
          </ProtectedRoute>
        }
      />
      {/* Host Profile Edit Route */}
      <Route
        path='/host/profile/edit'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostProfileEdit />
          </ProtectedRoute>
        }
      />

      {/* Host Event Routes */}
      <Route
        path='/host/events/create'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostEventCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path='/host/events'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostEventsList />
          </ProtectedRoute>
        }
      />
      <Route
        path='/host/events/:id'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostEventDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path='/host/events/:id/edit'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostEventEdit />
          </ProtectedRoute>
        }
      />

      {/* Host Organizers & Payments */}
      <Route
        path='/host/organizers'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostOrganizers />
          </ProtectedRoute>
        }
      />
      <Route
        path='/host/payments'
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostPayments />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
