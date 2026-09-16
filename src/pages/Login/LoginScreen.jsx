import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const ROLE_TABS = [
  {
    key: 'customer',
    label: 'Corporate Customer',
    shortLabel: 'Customer',
    badge: 'OEM & Tier-1 Buyers',
    desc: 'Release CAD drawings, configure process scopes, compare supplier bids, and track production deliveries.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key: 'supplier',
    label: 'Manufacturing Supplier',
    shortLabel: 'Supplier',
    badge: 'Certified Facilities',
    desc: 'Review routed RFQs, submit automated quotes, accept production POs, and schedule logistics dispatch.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    key: 'staff',
    label: 'Internal Operations',
    shortLabel: 'Operations Staff',
    badge: 'Compliance & Audit',
    desc: 'Specialized underwriting console for KYC audits, CAD process validation, vendor routing, and CMM QA release.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: 'admin',
    label: 'Executive Governance',
    shortLabel: 'Executive Admin',
    badge: 'Treasury & Audit',
    desc: 'Platform ledger oversight, automated vendor payout authorizations, and ecosystem health monitoring.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
];

export default function LoginScreen() {
  const { db, login, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('customer');
  const [customerId, setCustomerId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [adminUser, setAdminUser] = useState('DDD');
  const [adminPass, setAdminPass] = useState('123');

  const handleLogin = () => {
    if (activeTab === 'customer') {
      if (!customerId) { 
        showToast('Please select a corporate account or click Register.'); 
        return; 
      }
      const cust = db.customers.find(c => c.id === customerId);
      login({ role: 'customer', id: customerId, name: cust?.name || 'Corporate Customer', subRole: null });
    } else if (activeTab === 'supplier') {
      if (!vendorId) { 
        showToast('Please select a manufacturing facility or register.'); 
        return; 
      }
      const vend = db.vendors.find(v => v.id === vendorId);
      login({ role: 'supplier', id: vendorId, name: vend?.name || 'Manufacturing Supplier', subRole: null });
    } else if (activeTab === 'staff') {
      if (!staffId) { 
        showToast('Please select a staff member account.'); 
        return; 
      }
      const staff = db.staff.find(s => s.id === staffId);
      login({ role: 'staff', id: staffId, name: staff?.name || 'Staff Officer', subRole: staff?.role });
    } else if (activeTab === 'admin') {
      if (adminUser === 'DDD' && adminPass === '123') {
        login({ role: 'admin', id: 'ADMIN-1', name: 'Executive Administrator (DDD)', subRole: null });
      } else {
        showToast('Invalid credentials. Default: User: DDD | Pass: 123');
      }
    }
  };

  const selectedRoleMeta = ROLE_TABS.find(r => r.key === activeTab);

  return (
    <div className="enterprise-auth-wrapper">
      {/* Top Utility Bar */}
      <header className="auth-top-bar">
        <div className="auth-brand">
          <div className="brand-mark-hex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"/>
              <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
            </svg>
          </div>
          <div className="brand-titles">
            <span className="brand-name">ITTOVA</span>
            <span className="brand-tag">PRECISION SOURCING PLATFORM</span>
          </div>
        </div>
        <div className="auth-security-badges">
          <span className="auth-sec-pill">
            <span className="sec-dot" /> ISO 9001:2015 &amp; AS9100D
          </span>
          <span className="auth-sec-pill">
            <span className="sec-dot" /> SOC-2 TYPE II
          </span>
          <span className="auth-sec-pill">
            <span className="sec-dot" /> TLS 1.3 256-BIT RBAC
          </span>
        </div>
      </header>

      {/* Main Dual-Pane Container */}
      <main className="auth-main-container">
        {/* Left Side: Industrial Overview & Metrics */}
        <section className="auth-context-pane">
          <div className="context-kicker">
            <span className="pulse-indicator" />
            ENTERPRISE MANUFACTURING NETWORK
          </div>
          <h1 className="context-headline">
            Autonomous Sourcing &amp; Quality Engineering
          </h1>
          <p className="context-description">
            ITTOVA connects corporate OEMs directly with pre-audited CNC machining, sheet metal fabrication, and certified inspection centers with zero cross-role leakage.
          </p>

          {/* Metric Grid */}
          <div className="auth-metric-grid">
            <div className="metric-tile">
              <div className="metric-value">99.85%</div>
              <div className="metric-label">Zeiss CMM Conformance</div>
              <div className="metric-sub">ISO/IEC 17025 Certified</div>
            </div>
            <div className="metric-tile">
              <div className="metric-value">&plusmn;0.005mm</div>
              <div className="metric-label">Machining Tolerance</div>
              <div className="metric-sub">5-Axis &amp; Wire EDM Ready</div>
            </div>
            <div className="metric-tile">
              <div className="metric-value">38 Hubs</div>
              <div className="metric-label">Verified Suppliers</div>
              <div className="metric-sub">Geofenced Audit Pass</div>
            </div>
            <div className="metric-tile">
              <div className="metric-value">100%</div>
              <div className="metric-label">Dossier Traceability</div>
              <div className="metric-sub">DIN EN 10204 3.1 MTRs</div>
            </div>
          </div>

          {/* Platform Capability Highlights */}
          <div className="auth-feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <strong>Autonomous DFM &amp; Process Decomposition:</strong> Automatic feature extraction and stage planning for multi-part BOM assemblies.
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <strong>Institutional Credit Underwriting:</strong> Tiered financing (Net 30/60) with automated statutory KYC audit sanctioning.
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <strong>Strict Role-Based Isolation:</strong> Customers, vendors, and operations officers operate in completely segregated workspaces.
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Enterprise Authentication Console */}
        <section className="auth-terminal-pane">
          <div className="auth-terminal-card">
            <div className="terminal-header">
              <div className="terminal-title-row">
                <h2>Workspace Sign-In</h2>
                <span className="terminal-badge">SECURE CONSOLE</span>
              </div>
              <p className="terminal-sub">Select your dedicated stakeholder portal to authenticate into your workspace.</p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="role-tabs-bar" role="tablist">
              {ROLE_TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  className={`role-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="role-tab-icon">{tab.icon}</span>
                  <span className="role-tab-text">{tab.shortLabel}</span>
                </button>
              ))}
            </div>

            {/* Tab Context Banner */}
            <div className="tab-context-banner">
              <div className="tab-context-info">
                <strong>{selectedRoleMeta?.label}</strong>
                <span className="tab-context-badge">{selectedRoleMeta?.badge}</span>
              </div>
              <div className="tab-context-desc">{selectedRoleMeta?.desc}</div>
            </div>

            {/* Form Fields Body */}
            <div className="terminal-form-body">
              {/* CUSTOMER PORTAL */}
              {activeTab === 'customer' && (
                <div className="form-group-block">
                  <label htmlFor="customer-account-select">Corporate OEM Account</label>
                  <select 
                    id="customer-account-select"
                    value={customerId} 
                    onChange={e => setCustomerId(e.target.value)}
                  >
                    <option value="">Choose registered corporate account...</option>
                    {db.customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} &bull; {c.id} [{c.status}]
                      </option>
                    ))}
                  </select>
                  <div className="field-hint">
                    Select an approved corporate customer profile, or launch the statutory onboarding registration below.
                  </div>

                  <div className="auth-alt-action">
                    <span className="alt-text">First time working with ITTOVA?</span>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => {
                        login({ role: 'customer', id: '', name: 'New Corporate Customer', subRole: null });
                      }}
                    >
                      Complete 6-Step KYC Registration &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* SUPPLIER PORTAL */}
              {activeTab === 'supplier' && (
                <div className="form-group-block">
                  <label htmlFor="vendor-facility-select">Certified Manufacturing Facility</label>
                  <select 
                    id="vendor-facility-select"
                    value={vendorId} 
                    onChange={e => setVendorId(e.target.value)}
                  >
                    <option value="">Select audited machining facility...</option>
                    {db.vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} &bull; {v.id} [{v.status}]
                      </option>
                    ))}
                  </select>
                  <div className="field-hint">
                    Access facility orders, spindle schedules, and direct PO dispatch requests.
                  </div>

                  <div className="auth-alt-action">
                    <span className="alt-text">New manufacturing partner?</span>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => {
                        login({ role: 'supplier', id: '', name: 'New Supplier Facility', subRole: null });
                      }}
                    >
                      Submit Facility Audit Registration &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STAFF PORTAL */}
              {activeTab === 'staff' && (
                <div className="form-group-block">
                  <label htmlFor="staff-officer-select">Operations Officer Profile</label>
                  <select 
                    id="staff-officer-select"
                    value={staffId} 
                    onChange={e => setStaffId(e.target.value)}
                  >
                    <option value="">Select operational specialization...</option>
                    {db.staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} &mdash; {s.role.replace(/_/g, ' ')} ({s.id})
                      </option>
                    ))}
                  </select>
                  {staffId && (
                    <div className="staff-specialization-callout">
                      <div className="callout-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        <strong>Active Scope: {db.staff.find(s => s.id === staffId)?.role.replace(/_/g, ' ')}</strong>
                      </div>
                      <div className="callout-text">
                        Session permissions are restricted exclusively to your designated workflow queue.
                      </div>
                    </div>
                  )}
                  <div className="field-hint">
                    Internal role-based audit console. Cross-department actions are isolated by policy.
                  </div>
                </div>
              )}

              {/* ADMIN PORTAL */}
              {activeTab === 'admin' && (
                <div className="form-group-block">
                  <div className="auth-input-grid">
                    <div>
                      <label htmlFor="admin-username">Executive Username</label>
                      <input
                        id="admin-username"
                        type="text"
                        value={adminUser}
                        onChange={e => setAdminUser(e.target.value)}
                        placeholder="Executive Username"
                        autoComplete="username"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-passcode">Security Key / Passcode</label>
                      <input
                        id="admin-passcode"
                        type="password"
                        value={adminPass}
                        onChange={e => setAdminPass(e.target.value)}
                        placeholder="Security Passcode"
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <div className="field-hint">
                    Default demo credentials: <strong>User: DDD</strong> &bull; <strong>Pass: 123</strong>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                className="btn-auth-primary"
                onClick={handleLogin}
              >
                <span>Enter {selectedRoleMeta?.shortLabel} Workspace</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              {/* Footer Audit Guarantee */}
              <div className="terminal-footer-audit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Encrypted Session &bull; Role-Based Access Isolation &bull; Audit Log Active</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Corporate Footer */}
      <footer className="auth-global-footer">
        <div className="footer-content">
          <span>&copy; 2025 ITTOX Technologies &bull; ITTOVA Precision Sourcing System</span>
          <div className="footer-links">
            <span>DIN EN 10204 3.1 Traceability</span>
            <span>&bull;</span>
            <span>ITAR &amp; NDA Compliant</span>
            <span>&bull;</span>
            <span>CMM Inspection Conformance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
