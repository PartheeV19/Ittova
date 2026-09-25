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
import StaffPortal from './pages/Staff/StaffPortal';

export default function App() {
  const { currentUser, visitorProfile, saveVisitorProfile } = useApp();
  const location = useLocation();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, visitorProfile]);

  // If visitor has not provided their basic details yet, show the starting page
  if (!visitorProfile) {
    return (
      <div className="app-root">
        <StartingGate onComplete={saveVisitorProfile} />
        <Toast />
      </div>
    );
  }

  const renderWorkspace = () => (
    <main className="container" id="app-container" style={{ padding: '2.5rem clamp(20px, 4vw, 64px) 5rem' }}>
      {currentUser?.role === 'customer' && <CustomerPortal />}
      {currentUser?.role === 'supplier' && <SupplierPortal />}
      {currentUser?.role === 'staff' && <StaffPortal />}
    </main>
  );

  return (
    <div className="app-root">
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={currentUser ? renderWorkspace() : <LoginScreen />} />
        <Route path="/customer" element={currentUser ? renderWorkspace() : <LoginScreen />} />
        <Route path="/vendor" element={currentUser ? renderWorkspace() : <LoginScreen />} />
        <Route path="/supplier" element={<Navigate to="/vendor" replace />} />
        <Route path="/staff" element={currentUser ? renderWorkspace() : <LoginScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <Toast />
      <CADModal />
    </div>
  );
}
