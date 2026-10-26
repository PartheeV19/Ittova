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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  supplier: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  staff: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  finance_partner: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  material_partner: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" />
    </svg>
  ),
};

export default function Navbar() {
  const { currentUser, currentView, setCurrentView, openMyAccount, logout, visitorProfile, clearVisitorProfile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnCadPage = location.pathname === '/cad-analyzer';

  const [showLogoutPopdown, setShowLogoutPopdown] = useState(false);
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
            <div ref={portalsMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className={`nav-item-link ${['customer', 'vendor', 'finance', 'materials'].includes(currentView) ? 'active' : ''}`}
                onClick={() => setShowPortalsMenu(v => !v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <span>Portals &amp; Onboarding</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showPortalsMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showPortalsMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  minWidth: '290px',
                  background: 'var(--surface, #ffffff)',
                  border: '1px solid var(--line, #e2e8f0)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  padding: '8px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/customer'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'customer' ? 'var(--paper, #f0fdf4)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🏢</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Customer Portal</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>Procure parts, upload CAD drawings, corporate KYC</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/vendor'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'vendor' ? 'var(--paper, #eff6ff)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Vendor Platform</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>CNC machine envelopes, active RFQs, facility onboarding</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/finance'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'finance_partner' ? 'var(--paper, #faf5ff)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🏦</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Financier &amp; NBFC Hub</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>PO factoring, vendor advance lines, escrow credit</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/materials'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'material_partner' ? 'var(--paper, #fffbeb)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🔬</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Material &amp; NABL Console</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>Billet allocations, MTR 3.1 certs, NABL lab tests</div>
                    </div>
                  </button>
                </div>
              )}
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
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`nav-item-link ${['customer', 'vendor', 'finance', 'materials'].includes(currentView) ? 'active' : ''}`}
                onClick={() => setShowPortalsMenu(v => !v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <span>Switch Portal</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showPortalsMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showPortalsMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  minWidth: '290px',
                  background: 'var(--surface, #ffffff)',
                  border: '1px solid var(--line, #e2e8f0)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  padding: '8px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/customer'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'customer' ? 'var(--paper, #f0fdf4)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🏢</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Customer Portal</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>Procure parts, upload CAD drawings, corporate KYC</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/vendor'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'vendor' ? 'var(--paper, #eff6ff)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Vendor Platform</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>CNC machine envelopes, active RFQs, facility onboarding</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/finance'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'finance_partner' ? 'var(--paper, #faf5ff)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🏦</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Financier &amp; NBFC Hub</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>PO factoring, vendor advance lines, escrow credit</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowPortalsMenu(false); navigate('/materials'); }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', background: currentView === 'material_partner' ? 'var(--paper, #fffbeb)' : 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🔬</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Material &amp; NABL Console</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>Billet allocations, MTR 3.1 certs, NABL lab tests</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

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

              {/* User Dropdown / Drop Box */}
              <div ref={logoutRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="nav-user-chip-btn"
                  onClick={() => setShowLogoutPopdown(v => !v)}
                  title={`${currentUser?.name || 'Account'} • ${selectedRole}`}
                  aria-label="User Account Menu"
                  aria-expanded={showLogoutPopdown}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a3a5c 0%, #2563ab 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}>
                    {currentUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    color: 'var(--ink, #102a43)',
                    maxWidth: '160px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {currentUser?.name || 'My Account'}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{
                      transform: showLogoutPopdown ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      opacity: 0.6,
                      flexShrink: 0
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <button
                  className="nav-logout-btn"
                  onClick={() => setShowLogoutPopdown(v => !v)}
                  title="Sign Out / Account Menu"
                  aria-label="Account Options"
                  aria-expanded={showLogoutPopdown}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>

                {showLogoutPopdown && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    minWidth: '250px',
                    maxWidth: '320px',
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
                    {/* Arrow pointer */}
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
                      {/* Avatar circle */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1a3a5c 0%, #2563ab 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        letterSpacing: '-0.02em',
                      }}>
                        {currentUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        {/* Full name */}
                        <div style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: 'var(--text, #102a43)',
                          lineHeight: 1.25,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {currentUser?.name}
                        </div>

                        {/* Company or email subtitle */}
                        {(currentUser?.company || currentUser?.email) && (
                          <div style={{
                            fontSize: '0.74rem',
                            color: 'var(--muted, #64748b)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {currentUser?.company ? `${currentUser.company} • ` : ''}{currentUser?.email || ''}
                          </div>
                        )}

                        {/* Selected Role badge */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          marginTop: '6px',
                          padding: '3px 8px 3px 6px',
                          background: 'var(--paper, #f0f4ff)',
                          border: '1px solid var(--line, #e2e8f0)',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--accent, #1a3a5c)',
                          letterSpacing: '0.01em',
                          maxWidth: '100%',
                        }}>
                          <span style={{ opacity: 0.8, display: 'flex', flexShrink: 0 }}>
                            {ROLE_ICONS[currentUser?.role] || ROLE_ICONS.customer}
                          </span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--line, #e2e8f0)', paddingTop: '10px', fontSize: '0.83rem', color: 'var(--muted, #64748b)' }}>
                      Sign out of your workspace?
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { setShowLogoutPopdown(false); logout(); }}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          background: '#c0392b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#a93226'}
                        onMouseLeave={e => e.currentTarget.style.background = '#c0392b'}
                      >
                        Yes, sign out
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLogoutPopdown(false)}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          background: 'var(--paper, #f8fafc)',
                          color: 'var(--text, #102a43)',
                          border: '1px solid var(--line, #e2e8f0)',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--line, #e2e8f0)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--paper, #f8fafc)'}
                      >
                        Cancel
                      </button>
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
