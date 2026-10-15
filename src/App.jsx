import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CADModal from './components/CADModal';
import VendorAuthScreen from './pages/VendorAuth/VendorAuthScreen';
import SupplierPortal from './pages/Supplier/SupplierPortal';
import AccountPage from './pages/Account/AccountPage';

export default function App() {
  const { currentUser, authChecked, dbLoading } = useApp();
  const location = useLocation();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (!authChecked) {
    return (
      <main className="container" role="status" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading Vendor Session...</p>
      </main>
    );
  }

  // If not logged in, immediately render the dedicated Vendor Login & Registration portal
  if (!currentUser) {
    return (
      <div className="app-root">
        <VendorAuthScreen />
        <Toast />
      </div>
    );
  }

  // When logged in as Vendor, show the Vendor Workspace
  return (
    <div className="app-root">
      <Navbar />

      <main className="container" id="app-container" style={{ padding: '2rem clamp(20px, 4vw, 64px) 5rem' }}>
        {dbLoading && <p role="status" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Refreshing facility status...</p>}
        
        <Routes>
          <Route path="/" element={<Navigate to="/vendor" replace />} />
          <Route path="/home" element={<Navigate to="/vendor" replace />} />
          <Route path="/login" element={<Navigate to="/vendor" replace />} />
          <Route path="/signup" element={<Navigate to="/vendor" replace />} />
          <Route path="/vendor" element={<SupplierPortal />} />
          <Route path="/supplier" element={<Navigate to="/vendor" replace />} />
          <Route path="/account/:profileId" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/vendor" replace />} />
        </Routes>
      </main>

      <Toast />
      <CADModal />
    </div>
  );
}
