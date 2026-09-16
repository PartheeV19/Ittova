import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CADModal from './components/CADModal';
import LoginScreen from './pages/Login/LoginScreen';
import Home from './pages/Home/Home';
import CustomerPortal from './pages/Customer/CustomerPortal';
import SupplierPortal from './pages/Supplier/SupplierPortal';
import StaffPortal from './pages/Staff/StaffPortal';
import AdminPortal from './pages/Admin/AdminPortal';

export default function App() {
  const { currentUser, currentView } = useApp();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // If no user is logged in, show login screen
  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <Toast />
      </>
    );
  }

  return (
    <div className="app-root">
      <Navbar />

      <main className="container" id="app-container" style={{ paddingBottom: '5rem' }}>
        {currentUser.role === 'customer' && <CustomerPortal />}
        {currentUser.role === 'supplier' && <SupplierPortal />}
        {currentUser.role === 'staff'    && <StaffPortal />}
        {currentUser.role === 'admin'    && <AdminPortal />}
      </main>

      <Toast />
      <CADModal />
    </div>
  );
}
