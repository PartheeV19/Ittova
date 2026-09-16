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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  supplier: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  staff: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  admin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
};

export default function Navbar() {
  const { currentUser, logout } = useApp();

  const roleLabel = ROLE_LABELS[currentUser?.role] || '';
  const subRole = currentUser?.subRole
    ? currentUser.subRole.replace(/_/g, ' ')
    : null;

  return (
    <nav className="enterprise-navbar">
      <div className="nav-brand-section">
        <div className="brand-mark-hex" style={{ width: '30px', height: '30px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"/>
            <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
          </svg>
        </div>
        <div className="nav-brand-meta">
          <span className="nav-brand-title">ITTOVA</span>
          <span className="nav-env-badge">PRODUCTION</span>
        </div>
      </div>

      <div className="nav-center-status">
        <span className="status-indicator-pill">
          <span className="status-live-dot" />
          <span>System Online &bull; RBAC Active</span>
        </span>
      </div>

      <div className="nav-links">
        {/* Active portal role badge */}
        <span className="nav-portal-badge">
          {ROLE_ICONS[currentUser?.role]}
          <span>{roleLabel}</span>
          {subRole && (
            <span className="nav-subrole-tag">
              {subRole}
            </span>
          )}
        </span>

        {/* User identification chip */}
        <span className="nav-user-chip">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
          <span style={{ fontWeight: 600 }}>{currentUser?.name}</span>
          {currentUser?.id && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
              ({currentUser.id})
            </span>
          )}
        </span>

        {/* Sign Out Action */}
        <button className="nav-logout-btn" id="btn-logout" onClick={logout} title="Terminate authenticated session">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
