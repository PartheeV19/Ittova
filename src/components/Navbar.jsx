import React from 'react';
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

  const roleLabel = ROLE_LABELS[currentUser?.role] || '';
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
            <button 
              type="button"
              className="nav-item-link"
              onClick={() => setCurrentView('login')}
            >
              Portals
            </button>
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
            <button 
              type="button"
              className={`nav-item-link ${currentView === getWorkspaceView(currentUser.role) ? 'active' : ''}`}
              onClick={() => setCurrentView(getWorkspaceView(currentUser.role))}
            >
              Active Workspace
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
                <span className="visitor-badge-pill" title={`Role: ${visitorProfile.role} • ${visitorProfile.company}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                  </svg>
                  <span>{visitorProfile.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>({visitorProfile.company})</span>
                  <button 
                    type="button" 
                    className="visitor-switch-btn" 
                    onClick={clearVisitorProfile}
                    title="Change visitor details"
                  >
                    Switch
                  </button>
                </span>
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
                  {ROLE_ICONS[currentUser?.role]}
                  <span>{roleLabel}</span>
                  {subRole && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--red)', marginLeft: '4px', fontWeight: 800 }}>
                      ({subRole})
                    </span>
                  )}
                </span>
              )}

              <span className="nav-user-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                </svg>
                <span>{currentUser?.name}</span>
              </span>

              <button 
                className="nav-logout-btn" 
                onClick={logout} 
                title="Sign Out"
                aria-label="Sign Out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
}
