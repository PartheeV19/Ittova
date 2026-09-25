import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const ROLE_TABS = [
  {
    key: 'customer',
    label: 'Customer Portal',
    shortLabel: 'Customer',
    badge: 'Buyers & OEMs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key: 'vendor',
    label: 'Vendor Portal',
    shortLabel: 'Vendor',
    badge: 'Manufacturing Facilities',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
];

export default function LoginScreen() {
  const { db, login, showToast, setCurrentView, navigateBack, currentView } = useApp();
  const [activeTab, setActiveTab] = useState('customer');
  const [customerId, setCustomerId] = useState(db.customers[0]?.id || '');
  const [vendorId, setVendorId] = useState(db.vendors[0]?.id || '');
  const [registerMode, setRegisterMode] = useState(false);

  useEffect(() => {
    if (currentView === 'vendor') {
      setActiveTab('vendor');
    } else {
      setActiveTab('customer');
    }
  }, [currentView]);

  // Switch tab resets registerMode
  const handleTabChange = (tabKey) => {
    const nextTab = tabKey === 'vendor' ? 'vendor' : 'customer';
    setActiveTab(nextTab);
    setCurrentView(nextTab);
    setRegisterMode(false);
  };

  const handleLogin = () => {
    if (activeTab === 'customer') {
      if (registerMode || db.customers.length === 0) {
        login({ role: 'customer', id: '', name: 'New Corporate Customer', subRole: null });
        return;
      }
      if (!customerId) {
        showToast('Please select a corporate customer account or start registration.');
        return;
      }
      const cust = db.customers.find(c => c.id === customerId);
      login({ role: 'customer', id: customerId, name: cust?.name || 'Corporate Customer', subRole: null });
    } else if (activeTab === 'vendor') {
      if (registerMode || db.vendors.length === 0) {
        login({ role: 'supplier', id: '', name: 'New Manufacturing Facility', subRole: null });
        return;
      }
      if (!vendorId) {
        showToast('Please select a facility or start facility onboarding.');
        return;
      }
      const vend = db.vendors.find(v => v.id === vendorId);
      login({ role: 'supplier', id: vendorId, name: vend?.name || 'Manufacturing Facility', subRole: null });
    }
  };

  const selectedRoleMeta = ROLE_TABS.find(r => r.key === activeTab);
  const hasAccounts = activeTab === 'customer' ? db.customers.length > 0 : db.vendors.length > 0;

  return (
    <div className="enterprise-auth-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Utility Bar with In-App Back Navigation */}
      <header className="auth-top-bar" style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--line)' }}>
        <button 
          type="button" 
          className="btn-link" 
          onClick={navigateBack}
          style={{ fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ink)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Overview
        </button>
      </header>

      {/* Centered Auth Card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div className="auth-terminal-card" style={{ maxWidth: '490px', width: '100%' }}>
          <div className="terminal-header" style={{ padding: '1.5rem 2rem 1.25rem' }}>
            <div className="terminal-title-row">
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Portal Sign-In</h2>
              <span className="terminal-badge">{selectedRoleMeta?.badge}</span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
              Select an authorized portal to access verified CAD workflows, RFQ bidding, and order tracking.
            </p>
          </div>

          {/* 2 Role Tabs: Customer and Vendor only */}
          <div className="role-tabs-bar" role="tablist">
            {ROLE_TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`role-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                <span className="role-tab-icon">{tab.icon}</span>
                <span className="role-tab-text">{tab.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Form Body */}
          <div className="terminal-form-body" style={{ padding: '1.75rem 2rem' }}>
            {/* 1. CUSTOMER TAB */}
            {activeTab === 'customer' && (
              <div className="form-group-block">
                {!registerMode && hasAccounts ? (
                  <>
                    <label htmlFor="customer-account-select">Select Corporate Account</label>
                    <select 
                      id="customer-account-select"
                      value={customerId} 
                      onChange={e => setCustomerId(e.target.value)}
                    >
                      {db.customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>

                    <div style={{ marginTop: '0.9rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      New organization?{' '}
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setRegisterMode(true)}
                        style={{ fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Register New Customer &rarr;
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>
                      New Corporate Customer Onboarding
                    </div>
                    <p style={{ margin: '6px 0 10px', fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                      Register your company details, upload Master CAD/BOM requirements, and complete industrial KYC verification.
                    </p>
                    {hasAccounts && (
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setRegisterMode(false)}
                        style={{ fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        &larr; Return to account selection
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. VENDOR TAB */}
            {activeTab === 'vendor' && (
              <div className="form-group-block">
                {!registerMode && hasAccounts ? (
                  <>
                    <label htmlFor="vendor-facility-select">Select Manufacturing Facility</label>
                    <select 
                      id="vendor-facility-select"
                      value={vendorId} 
                      onChange={e => setVendorId(e.target.value)}
                    >
                      {db.vendors.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.id})
                        </option>
                      ))}
                    </select>

                    <div style={{ marginTop: '0.9rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      New manufacturing facility?{' '}
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setRegisterMode(true)}
                        style={{ fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Onboard New Facility &rarr;
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: 'var(--r-md)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>
                      Supplier Facility Onboarding
                    </div>
                    <p style={{ margin: '6px 0 10px', fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                      Register your machine matrix (CNC turning, 4/5-axis VMC, laser cutting), hourly rates, and working envelopes.
                    </p>
                    {hasAccounts && (
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setRegisterMode(false)}
                        style={{ fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        &larr; Return to facility selection
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Single Primary Action Button */}
            <button
              type="button"
              className="btn-auth-primary"
              onClick={handleLogin}
              style={{ marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>
                {activeTab === 'customer' 
                  ? (registerMode || !hasAccounts ? 'Start Customer Registration' : 'Enter Customer Workspace')
                  : (registerMode || !hasAccounts ? 'Start Facility Onboarding' : 'Enter Vendor Workspace')}
              </span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        &copy; {new Date().getFullYear()} ITOVA Technologies &bull; Accountable Industrial Execution
      </footer>
    </div>
  );
}
