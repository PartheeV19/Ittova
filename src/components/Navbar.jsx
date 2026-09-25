import React from 'react';
import { useApp } from '../context/AppContext';

const ROLE_LABELS = {
  customer: 'Customer Portal',
  supplier: 'Vendor Platform',
  staff:    'Operations Console',
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
};

export default function Navbar() {
  const { currentUser, currentView, setCurrentView, logout, visitorProfile, clearVisitorProfile } = useApp();

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
    <>
      <div className="topline" />
      <header className="enterprise-navbar">
        {/* Brand Section */}
        <div 
          className="nav-brand-section" 
          onClick={() => setCurrentView(currentUser ? (currentView === 'home' ? (currentUser.role === 'supplier' ? 'vendor' : currentUser.role) : 'home') : 'home')}
        >
          <span className="nav-brand-title">
            IT<span className="brand-accent-o">O</span>VA
          </span>
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
              onClick={() => navigateToSection('how')}
            >
              How ITOVA Works
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
              Why ITOVA
            </button>
            <button 
              type="button"
              className="nav-item-link"
              onClick={() => setCurrentView('login')}
            >
              Portals
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
              className={`nav-item-link ${currentView !== 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView(currentUser.role === 'supplier' ? 'vendor' : currentUser.role)}
            >
              Active Workspace
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
              <span className="nav-portal-badge">
                {ROLE_ICONS[currentUser?.role]}
                <span>{roleLabel}</span>
                {subRole && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--red)', marginLeft: '4px', fontWeight: 800 }}>
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
    </>
  );
}
