import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentUser, currentView, setCurrentView, openMyAccount, logout } = useApp();

  return (
    <>
      <div className="topline" />
      <header className="enterprise-navbar">
        {/* Brand Section */}
        <button 
          type="button" 
          aria-label="Vendor Platform"
          className="nav-brand-section" 
          onClick={() => setCurrentView(currentUser ? 'vendor' : 'login')}
          style={{ textDecoration: 'none' }}
        >
          <span className="nav-brand-title">
            IT<span className="brand-accent-o">O</span>VA
          </span>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase', 
            background: 'rgba(196, 19, 48, 0.12)', 
            color: 'var(--red)', 
            padding: '2px 8px', 
            borderRadius: 'var(--r-full)',
            marginLeft: '8px'
          }}>
            Vendor Platform
          </span>
        </button>

        {/* Center Navigation Links */}
        <nav className="nav-center-menu">
          {!currentUser ? (
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              Industrial Manufacturing &bull; Precision Machinery Network
            </span>
          ) : (
            <>
              <button 
                type="button"
                className={`nav-item-link ${currentView === 'vendor' ? 'active' : ''}`}
                onClick={() => setCurrentView('vendor')}
              >
                Facility Workspace
              </button>
              {currentUser.id && (
                <button
                  type="button"
                  className={`nav-item-link ${currentView === 'account' ? 'active' : ''}`}
                  onClick={() => openMyAccount(currentUser.id)}
                >
                  Facility Account
                </button>
              )}
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {!currentUser ? (
            <button 
              type="button"
              className="btn btn-sm btn-dark"
              onClick={() => setCurrentView('login')}
            >
              Vendor Sign In &rarr;
            </button>
          ) : (
            <>
              <span className="nav-portal-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
                <span>Vendor Partner</span>
              </span>

              <span className="nav-user-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                </svg>
                <span>{currentUser?.name || 'Verified Vendor'}</span>
              </span>

              <button 
                type="button"
                className="nav-logout-btn" 
                onClick={logout} 
                title="Sign Out to demo Login/Signup flow again"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out (Reset Demo)
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
}
