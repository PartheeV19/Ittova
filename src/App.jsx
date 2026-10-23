import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CADModal from './components/CADModal';
import LoginScreen from './pages/Login/LoginScreen';
import SupplierPortal from './pages/Supplier/SupplierPortal';
import AccountPage from './pages/Account/AccountPage';
import CADAnalyzerPage from './pages/CADAnalyzer/CADAnalyzerPage';

export default function App() {
  const { currentUser, authChecked, dbLoading } = useApp();
  const location = useLocation();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (!authChecked) return <main className="container" role="status">Loading your session...</main>;

  // If not logged in, directly show the Vendor Login/Signup screen
  if (!currentUser) {
    return (
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/cad-analyzer" element={<CADAnalyzerPage />} />
          <Route path="*" element={<LoginScreen />} />
        </Routes>
        <Toast />
      </div>
    );
  }

  const renderWorkspace = () => (
    <main className="container" id="app-container" style={{ padding: '2.5rem clamp(20px, 4vw, 64px) 5rem' }}>
      {dbLoading && <p role="status">Refreshing workspace...</p>}
      <SupplierPortal />
    </main>
  );

  return (
    <div className="app-root">
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/vendor" replace />} />
        <Route path="/home" element={<Navigate to="/vendor" replace />} />
        <Route path="/login" element={<Navigate to="/vendor" replace />} />
        <Route path="/account/:profileId" element={<AccountPage />} />
        <Route path="/cad-analyzer" element={<CADAnalyzerPage />} />
        <Route path="/vendor" element={renderWorkspace()} />
        <Route path="/supplier" element={<Navigate to="/vendor" replace />} />
        <Route path="*" element={<Navigate to="/vendor" replace />} />
      </Routes>

      <Toast />
      <CADModal />
    </div>
  );
}
