import React from 'react';
import { useApp } from '../context/AppContext';

const ROLE_LABELS = {
  customer: 'Customer Portal',
  supplier: 'Supplier Network',
  staff:    'Operations Command',
  admin:    'Executive Governance',
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
  admin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
};

export default function Navbar() {
  const { currentUser, currentView, setCurrentView, logout } = useApp();

  const roleLabel = ROLE_LABELS[currentUser?.role] || '';
  const subRole = currentUser?.subRole
    ? currentUser.subRole.replace(/_/g, ' ')
    : null;

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
    <header className="enterprise-navbar">
      {/* Brand Section */}
      <div 
        className="nav-brand-section" 
        onClick={() => setCurrentView(currentUser ? (currentView === 'home' ? (currentUser.role === 'supplier' ? 'vendor' : currentUser.role) : 'home') : 'home')}
      >
        <div className="brand-mark-hex">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"/>
            <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
          </svg>
        </div>
        <div className="nav-brand-meta">
          <span className="nav-brand-title">ITTOVA</span>
          <span className="nav-brand-sub">PRECISION SOURCING</span>
        </div>
      </div>

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
            onClick={() => navigateToSection('quoting-engine')}
          >
            AI Quoting
          </button>
          <button 
            type="button"
            className="nav-item-link"
            onClick={() => navigateToSection('quoting-engine')}
          >
            Capabilities
          </button>
          <button 
            type="button"
            className="nav-item-link"
            onClick={() => setCurrentView('home')}
          >
            Sectors
          </button>
          <button 
            type="button"
            className="nav-item-link"
            onClick={() => setCurrentView('home')}
          >
            Platforms
          </button>
        </nav>
      ) : (
        <nav className="nav-center-menu">
          <button 
            type="button"
            className={`nav-item-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            Website Overview
          </button>
          <button 
            type="button"
            className={`nav-item-link ${currentView !== 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView(currentUser.role === 'supplier' ? 'vendor' : currentUser.role)}
          >
            Portal Workspace
          </button>
        </nav>
      )}

      {/* Right Actions */}
      <div className="nav-actions">
        {!currentUser ? (
          <>
            <span className="status-indicator-pill">
              <span className="status-live-dot" />
              <span>38 Audited Facilities</span>
            </span>
            <button 
              className="btn btn-sm"
              onClick={() => setCurrentView('login')}
            >
              Launch Portal / Sign In &rarr;
            </button>
          </>
        ) : (
          <>
            <span className="nav-portal-badge">
              {ROLE_ICONS[currentUser?.role]}
              <span>{roleLabel}</span>
              {subRole && (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', marginLeft: '4px' }}>
                  ({subRole})
                </span>
              )}
            </span>

            <span className="nav-user-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
              <span>{currentUser?.name}</span>
            </span>

            <button 
              className="nav-logout-btn" 
              onClick={logout} 
              title="Sign Out of Session"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
