import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import StartingGate from './pages/StartingGate/StartingGate';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CADModal from './components/CADModal';
import LoginScreen from './pages/Login/LoginScreen';
import Home from './pages/Home/Home';
import CustomerPortal from './pages/Customer/CustomerPortal';
import SupplierPortal from './pages/Supplier/SupplierPortal';
import AdminPortal from './pages/Admin/AdminPortal';
import StaffPortal from './pages/Staff/StaffPortal';

export default function App() {
  const { currentUser, authChecked, dbLoading, visitorProfile, saveVisitorProfile } = useApp();
  const location = useLocation();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, visitorProfile]);

  if (!authChecked) return <main className="container" role="status">Loading your session...</main>;

  // If visitor has not provided their basic details yet, show the starting page
  if (!visitorProfile && !currentUser) {
    return (
      <div className="app-root">
        <StartingGate onComplete={saveVisitorProfile} />
        <Toast />
      </div>
    );
  }

  const renderWorkspace = () => (
    <main className="container" id="app-container" style={{ padding: '2.5rem clamp(20px, 4vw, 64px) 5rem' }}>
      {dbLoading && <p role="status">Refreshing workspace...</p>}
      {currentUser?.role === 'admin' && <AdminPortal />}
      {currentUser?.role === 'customer' && <CustomerPortal />}
      {currentUser?.role === 'supplier' && <SupplierPortal />}
      {currentUser?.role === 'staff' && <StaffPortal />}
    </main>
  );

  const workspacePath = { customer: '/customer', supplier: '/vendor', staff: '/staff', admin: '/admin' }[currentUser?.role];
  const portal = () => !currentUser ? <LoginScreen /> : location.pathname !== workspacePath ? <Navigate to={workspacePath || '/home'} replace /> : renderWorkspace();

  return (
    <div className="app-root">
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={currentUser ? <Navigate to="/home" replace /> : <LoginScreen />} />
        <Route path="/customer" element={portal()} />
        <Route path="/vendor" element={portal()} />
        <Route path="/supplier" element={<Navigate to="/vendor" replace />} />
        <Route path="/admin" element={currentUser ? portal() : <Navigate to="/login" replace />} />
        <Route path="/staff" element={currentUser ? portal() : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <Toast />
      <CADModal />
    </div>
  );
}
