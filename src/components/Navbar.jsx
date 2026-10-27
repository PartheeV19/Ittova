import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ROLE_LABELS = {
  customer: 'Customer Portal',
  supplier: 'Vendor Platform',
  staff:    'Operations Console',
  admin: 'Admin Console',
  finance_partner: 'Financier & NBFC Hub',
  material_partner: 'Raw Materials & Lab Console',
};

const ROLE_DISPLAY_NAMES = {
  customer: 'Industrial Buyer / OEM',
  supplier: 'Manufacturing Facility / Vendor',
  finance_partner: 'Bank / NBFC Financier',
  material_partner: 'Raw Material & Testing Partner',
  staff: 'Operations Console',
  admin: 'Admin Console',
};

const ROLE_ICONS = {
  customer: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  supplier: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/><line x1="8" y1="14" x2="16" y2="14"/>
    </svg>
  ),
  staff: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  finance_partner: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      <path d="M7 15h2"/><path d="M15 15h2"/>
    </svg>
  ),
  material_partner: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" />
    </svg>
  ),
};

const PORTAL_MENU_ITEMS = [
  {
    key: 'customer',
    path: '/customer',
    title: 'Customer Portal',
    badge: 'OEM / Buyer',
    desc: 'Procure precision components, submit confidential CAD & track DFM toolpaths',
    icon: ROLE_ICONS.customer
  },
  {
    key: 'supplier',
    path: '/vendor',
    title: 'Vendor Platform',
    badge: 'Manufacturing',
    desc: 'Register CNC machines, axes, working envelopes & receive verified PO releases',
    icon: ROLE_ICONS.supplier
  },
  {
    key: 'finance_partner',
    path: '/finance',
    title: 'Financier & NBFC Hub',
    badge: 'Capital / Escrow',
    desc: 'Underwrite PO factoring, tripartite escrow settlement & vendor advance capital',
    icon: ROLE_ICONS.finance_partner
  },
  {
    key: 'material_partner',
    path: '/materials',
    title: 'Material & NABL Console',
    badge: 'Testing / Stock',
    desc: 'Allocate certified billets, provide MTR 3.1 heat traceability & NABL test certs',
    icon: ROLE_ICONS.material_partner
  }
];

export default function Navbar() {
  const { currentUser, currentView, setCurrentView, openMyAccount, logout, visitorProfile, clearVisitorProfile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnCadPage = location.pathname === '/cad-analyzer';

  const [showLogoutPopdown, setShowLogoutPopdown] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [showVisitorPopdown, setShowVisitorPopdown] = useState(false);
  const [showPortalsMenu, setShowPortalsMenu] = useState(false);
  const logoutRef = useRef(null);
  const visitorRef = useRef(null);
  const portalsMenuRef = useRef(null);

  // Close popdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (showLogoutPopdown && logoutRef.current && !logoutRef.current.contains(e.target)) {
        setShowLogoutPopdown(false);
        setConfirmingSignOut(false);
      }
      if (showVisitorPopdown && visitorRef.current && !visitorRef.current.contains(e.target)) {
        setShowVisitorPopdown(false);
      }
      if (showPortalsMenu && portalsMenuRef.current && !portalsMenuRef.current.contains(e.target)) {
        setShowPortalsMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLogoutPopdown, showVisitorPopdown, showPortalsMenu]);

  const roleLabel = ROLE_LABELS[currentUser?.role] || '';
  const selectedRole = currentUser?.participantRole
    || visitorProfile?.role
    || ROLE_DISPLAY_NAMES[currentUser?.role]
    || roleLabel
    || currentUser?.role
    || 'Participant';

  const subRole = currentUser?.subRole
    ? currentUser.subRole.replace(/_/g, ' ')
    : null;

  const getWorkspaceView = (role) => {
    if (role === 'supplier') return 'vendor';
    if (role === 'finance_partner') return 'finance';
    if (role === 'material_partner') return 'materials';
    return role;
  };

  const navigateToSection = (sectionId) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderPortalsDropdown = () => (
    <div className="nav-portal-dropdown" role="menu" aria-label="Portals Navigation">
      <div className="nav-portal-dropdown-arrow" />
      <div className="nav-portal-dropdown-header">
        <span className="nav-portal-dropdown-title">Enterprise Ecosystem</span>
        <span className="nav-portal-dropdown-chip">4 Dedicated Portals</span>
      </div>

      <div className="nav-portal-list">
        {PORTAL_MENU_ITEMS.map((item) => {
          const isActive = currentView === item.key || location.pathname === item.path || (item.key === 'supplier' && currentView === 'vendor');
          return (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className={`nav-portal-option ${isActive ? 'active' : ''}`}
              onClick={() => {
                setShowPortalsMenu(false);
                navigate(item.path);
              }}
            >
              <div className="nav-portal-icon-box">
                {item.icon}
              </div>
              <div className="nav-portal-text">
                <div className="nav-portal-row">
                  <span className="nav-portal-name">{item.title}</span>
                  {isActive ? (
                    <span className="nav-portal-active-pill">ACTIVE</span>
                  ) : (
                    <span className="nav-portal-badge-tag">{item.badge}</span>
                  )}
                </div>
                <div className="nav-portal-desc">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="nav-portal-dropdown-footer">
        <span className="nav-portal-footer-note">Confidential Execution • Tripartite Escrow</span>
        <span className="status-live-dot" style={{ width: 6, height: 6 }} />
      </div>
    </div>
  );

  return (
    <>
      <div className="topline" />
      <header className="enterprise-navbar">
        {/* Brand Section */}
        <button type="button" aria-label="Go to overview or workspace"
          className="nav-brand-section"
          onClick={() => setCurrentView(currentUser ? (currentView === 'home' ? getWorkspaceView(currentUser.role) : 'home') : 'home')}
        >
          <span className="nav-brand-title">
            IT<span className="brand-accent-o">O</span>VA
          </span>
        </button>

        {/* Center Navigation Links */}
        {!currentUser ? (
          <nav className="nav-center-menu">
            <button
              type="button"
              className={`nav-item-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Overview
            </button>
            <button
              type="button"
              className="nav-item-link"
              onClick={() => navigateToSection('how')}
            >
              How <span className="brand-word">IT<span className="brand-accent-o">O</span>VA</span> Works
            </button>
            <button
              type="button"
              className="nav-item-link"
              onClick={() => navigateToSection('network')}
            >
              Our Network
            </button>
            <button
              type="button"
              className="nav-item-link"
              onClick={() => navigateToSection('about')}
            >
              Why <span className="brand-word">IT<span className="brand-accent-o">O</span>VA</span>
            </button>
            
            {/* 4 Dedicated Portals Dropdown */}
            <div ref={!currentUser ? portalsMenuRef : null} style={{ position: 'relative' }}>
              <button
                type="button"
                className={`nav-item-link ${['customer', 'vendor', 'finance', 'materials'].includes(currentView) ? 'active' : ''}`}
                onClick={() => setShowPortalsMenu(v => !v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                aria-expanded={showPortalsMenu}
              >
                <span>Portals &amp; Onboarding</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showPortalsMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showPortalsMenu && renderPortalsDropdown()}
            </div>

            <button
              type="button"
              className={`nav-item-link ${isOnCadPage ? 'active' : ''}`}
              onClick={() => navigate('/cad-analyzer')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
              </svg>
              CAD Analyzer
            </button>
          </nav>
        ) : (
          <nav className="nav-center-menu">
            <button
              type="button"
              className={`nav-item-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Platform Overview
            </button>
            {['customer', 'supplier'].includes(currentUser.role) && currentUser.id && (
              <button
                type="button"
                className={`nav-item-link ${currentView === 'account' ? 'active' : ''}`}
                onClick={() => openMyAccount()}
              >
                My Account
              </button>
            )}
            <button
              type="button"
              className={`nav-item-link ${isOnCadPage ? 'active' : ''}`}
              onClick={() => navigate('/cad-analyzer')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
              </svg>
              CAD Analyzer
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="nav-actions">
          {!currentUser ? (
            <>
              {visitorProfile && (
                <div ref={visitorRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="visitor-badge-pill"
                    onClick={() => setShowVisitorPopdown(v => !v)}
                    title={`Role: ${visitorProfile.role} • ${visitorProfile.company}`}
                    aria-expanded={showVisitorPopdown}
                    style={{ cursor: 'pointer', fontFamily: 'inherit', background: 'var(--paper)', border: '1px solid var(--line)' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                    </svg>
                    <span>{visitorProfile.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>({visitorProfile.company})</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{
                        transform: showVisitorPopdown ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                        opacity: 0.6,
                        marginLeft: '2px'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showVisitorPopdown && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      minWidth: '240px',
                      background: 'var(--surface, #fff)',
                      border: '1px solid var(--line, #e2e8f0)',
                      borderRadius: '10px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                      padding: '16px',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '18px',
                        width: '12px',
                        height: '12px',
                        background: 'var(--surface, #fff)',
                        border: '1px solid var(--line, #e2e8f0)',
                        borderBottom: 'none',
                        borderRight: 'none',
                        transform: 'rotate(45deg)',
                      }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1a3a5c 0%, #2563ab 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}>
                          {visitorProfile.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text, #102a43)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {visitorProfile.name}
                          </div>
                          {visitorProfile.company && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--muted, #64748b)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {visitorProfile.company}
                            </div>
                          )}
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '5px',
                            padding: '2px 8px',
                            background: 'var(--paper, #f0f4ff)',
                            border: '1px solid var(--line, #e2e8f0)',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--accent, #1a3a5c)',
                          }}>
                            {visitorProfile.role}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--line, #e2e8f0)', paddingTop: '10px' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-dark"
                          style={{ flex: 1, padding: '7px 0', fontSize: '0.82rem' }}
                          onClick={() => { setShowVisitorPopdown(false); setCurrentView('login'); }}
                        >
                          Launch Portal
                        </button>
                        <button
                          type="button"
                          style={{
                            flex: 1,
                            padding: '7px 0',
                            fontSize: '0.82rem',
                            background: 'var(--paper, #f8fafc)',
                            color: 'var(--text, #102a43)',
                            border: '1px solid var(--line, #e2e8f0)',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => { setShowVisitorPopdown(false); clearVisitorProfile(); }}
                        >
                          Switch
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                className="btn btn-sm btn-dark"
                onClick={() => setCurrentView('login')}
              >
                Launch Portal &rarr;
              </button>
            </>
          ) : (
            <>
              {currentView !== 'home' && (
                <span className="nav-portal-badge">
                  {ROLE_ICONS[currentUser?.role] || ROLE_ICONS.customer}
                  <span>{roleLabel}</span>
                  {subRole && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--red)', marginLeft: '4px', fontWeight: 800 }}>
                      ({subRole})
                    </span>
                  )}
                </span>
              )}

              {/* User Profile Dropdown */}
              <div ref={logoutRef} className="nav-profile-menu">
                <button
                  type="button"
                  className={`nav-user-chip-btn ${showLogoutPopdown ? 'is-open' : ''}`}
                  onClick={() => {
                    if (showLogoutPopdown) setConfirmingSignOut(false);
                    setShowLogoutPopdown(value => !value);
                  }}
                  title={`${currentUser?.name || 'Account'} • ${selectedRole}`}
                  aria-label="User account menu"
                  aria-expanded={showLogoutPopdown}
                >
                  <span className="nav-user-avatar">
                    {currentUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                  <span className="nav-user-chip-copy">
                    <span className="nav-user-chip-name">{currentUser?.name || 'My Account'}</span>
                    <span className="nav-user-chip-role">{selectedRole}</span>
                  </span>
                  <svg className={`nav-user-chevron ${showLogoutPopdown ? 'is-open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showLogoutPopdown && (
                  <div className="nav-profile-dropdown" role="menu" aria-label="User profile options">
                    <div className="nav-profile-header">
                      <div className="nav-profile-avatar">
                        {currentUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="nav-profile-identity">
                        <strong>{currentUser?.name || 'Account'}</strong>
                        <span>{currentUser?.company || currentUser?.email || ''}</span>
                      </div>
                    </div>

                    <div className="nav-profile-roleline">
                      <span className="nav-profile-role-icon">
                        {ROLE_ICONS[currentUser?.role] || ROLE_ICONS.customer}
                      </span>
                      <span>{selectedRole}</span>
                    </div>

                    {['customer', 'supplier', 'finance_partner', 'material_partner'].includes(currentUser.role) && (
                      <button
                        type="button"
                        role="menuitem"
                        className="nav-profile-role-action"
                        onClick={() => { setShowLogoutPopdown(false); setConfirmingSignOut(false); setCurrentView('change-role'); }}
                      >
                        <span className="nav-profile-action-mark" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4Z" />
                          </svg>
                        </span>
                        <span className="nav-profile-action-copy">
                          <strong>Change Role</strong>
                          <small>OTP verification · 15-day cooldown</small>
                        </span>
                        <svg className="nav-profile-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    )}

                    <div className="nav-profile-footer">
                      {!confirmingSignOut ? (
                        <button
                          type="button"
                          className="nav-profile-signout"
                          role="menuitem"
                          onClick={() => setConfirmingSignOut(true)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M10 17l5-5-5-5" />
                            <path d="M15 12H3" />
                            <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                          </svg>
                          Sign out
                        </button>
                      ) : (
                        <div className="nav-profile-confirm-signout">
                          <span>Sign out of your workspace?</span>
                          <div className="nav-profile-footer-actions">
                            <button
                              type="button"
                              className="nav-profile-signout-confirm"
                              onClick={() => { setShowLogoutPopdown(false); setConfirmingSignOut(false); logout(); }}
                            >
                              Sign out
                            </button>
                            <button
                              type="button"
                              className="nav-profile-cancel"
                              onClick={() => setConfirmingSignOut(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
