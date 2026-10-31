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
import FinancePartnerPortal from './pages/FinancePartner/FinancePartnerPortal';
import MaterialPartnerPortal from './pages/MaterialPartner/MaterialPartnerPortal';
import AccountPage from './pages/Account/AccountPage';
import CADAnalyzerPage from './pages/CADAnalyzer/CADAnalyzerPage';
import RoleChangePage from './pages/RoleChange/RoleChangePage';


export default function App() {
  const { currentUser, authChecked, dbLoading, visitorProfile, saveVisitorProfile } = useApp();
  const location = useLocation();
  const isCadAnalyzerPage = location.pathname === '/cad-analyzer';

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, visitorProfile]);

  if (!authChecked) return <main className="container" role="status">Loading your session...</main>;

  // If visitor has not provided their basic details yet, show the starting gate
  if (!visitorProfile && !currentUser) {
    if (location.pathname === '/login') {
      return (
        <div className="app-root">
          <LoginScreen />
          <Toast />
        </div>
      );
    }

    return (
      <div className="app-root">
        <StartingGate onComplete={saveVisitorProfile} />
        <Toast />
      </div>
    );
  }

  const renderPortalLayout = (portalElement) => (
    <main className="container" id="app-container" style={{ padding: '2.5rem clamp(20px, 4vw, 64px) 5rem' }}>
      {dbLoading && <p role="status">Refreshing workspace...</p>}
      {portalElement}
    </main>
  );

  return (
    <div className="app-root">
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={currentUser ? <Navigate to="/home" replace /> : <LoginScreen />} />
        <Route path="/change-role" element={currentUser ? <RoleChangePage /> : <Navigate to="/login" replace />} />
        <Route path="/account/:profileId" element={<AccountPage />} />
        <Route path="/cad-analyzer" element={<CADAnalyzerPage />} />
        <Route path="/customer" element={renderPortalLayout(<CustomerPortal />)} />
        <Route path="/vendor" element={renderPortalLayout(<SupplierPortal />)} />
        <Route path="/supplier" element={<Navigate to="/vendor" replace />} />
        <Route path="/finance" element={renderPortalLayout(<FinancePartnerPortal />)} />
        <Route path="/materials" element={renderPortalLayout(<MaterialPartnerPortal />)} />
        <Route path="/register/customer" element={renderPortalLayout(<CustomerPortal />)} />
        <Route path="/register/vendor" element={renderPortalLayout(<SupplierPortal />)} />
        <Route path="/register/finance" element={renderPortalLayout(<FinancePartnerPortal />)} />
        <Route path="/register/materials" element={renderPortalLayout(<MaterialPartnerPortal />)} />
        <Route path="/admin" element={renderPortalLayout(<AdminPortal />)} />
        <Route path="/staff" element={renderPortalLayout(<StaffPortal />)} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <Toast />
      <CADModal />
    </div>
  );
}
