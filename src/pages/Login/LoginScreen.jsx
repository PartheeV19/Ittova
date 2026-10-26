import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

/** Per-portal display config and API role mapping */
const PORTAL_CONFIG = {
  supplier: {
    title: 'Vendor Portal Access',
    subtitle: 'Access your manufacturing facility workspace with your registered contact details.',
    badge: 'Manufacturing Facilities',
    badgeColor: '#1a3a5c',
    allowSignup: true,
    signupLabel: 'Register Facility',
    signupProfileRole: 'Manufacturing Facility / Vendor',
    apiRole: 'supplier',
  },
  customer: {
    title: 'Customer Portal Access',
    subtitle: 'Sign in to submit drawings, track procurement and manage your orders.',
    badge: 'Buyers & OEMs',
    badgeColor: '#1a3a2a',
    allowSignup: false,
    apiRole: 'customer',
  },
  finance_partner: {
    title: 'Finance Partner Access',
    subtitle: 'Access PO factoring, tripartite escrow and supplier credit dashboards.',
    badge: 'Banks & NBFCs',
    badgeColor: '#2a1a3a',
    allowSignup: false,
    apiRole: 'finance_partner',
  },
  material_partner: {
    title: 'Material Partner Access',
    subtitle: 'Manage billet allocations, MTR traceability and NABL test certifications.',
    badge: 'Material Stockists & Labs',
    badgeColor: '#3a2a1a',
    allowSignup: false,
    apiRole: 'material_partner',
  },
};

export default function LoginScreen({ portalRole = 'supplier' }) {
  const { requestOtp, verifyOtp, visitorProfile } = useApp();
  const config = PORTAL_CONFIG[portalRole] ?? PORTAL_CONFIG.supplier;

  const [purpose, setPurpose] = useState('login');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  const reset = () => { setSent(false); setCode(''); setDevCode(''); setError(''); };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (purpose === 'signup' && !sent) {
        if (!fullName.trim() || !company.trim()) {
          setError('Full name and organisation name are required.');
          return;
        }
      }

      const cleanContact = contact.trim();
      const normalizedContact = /^[0-9]{10}$/.test(cleanContact)
        ? `+91${cleanContact}`
        : cleanContact;

      const profilePayload = {
        fullName: fullName.trim() || visitorProfile?.name || '',
        company: company.trim() || visitorProfile?.company || '',
        participantRole: config.signupProfileRole || config.title,
      };

      const result = sent
        ? await verifyOtp(normalizedContact, code.trim(), config.apiRole, {
            purpose,
            profile: profilePayload,
          })
        : await requestOtp(normalizedContact, purpose);

      if (result === null) {
        setError('Unable to continue. Check your details and ensure the backend server is running.');
      } else if (!sent) {
        if (result?.devCode) setDevCode(result.devCode);
        setSent(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container auth-page">
      <section className="auth-terminal-card" aria-labelledby="sign-in-title">

        {/* Portal badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: config.badgeColor,
          color: '#e8f0fe',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '4px',
          marginBottom: '14px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block' }} />
          {config.badge}
        </div>

        <div className="terminal-header">
          <h1 id="sign-in-title">{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>

        {/* Tabs — only show signup tab when this portal supports registration */}
        {config.allowSignup && (
          <div className="role-tabs-bar" aria-label={`${config.badge} access options`}>
            <button
              type="button"
              disabled={busy}
              aria-pressed={purpose === 'login'}
              className={`role-tab-btn ${purpose === 'login' ? 'active' : ''}`}
              onClick={() => { setPurpose('login'); reset(); }}
            >
              Sign In
            </button>
            <button
              type="button"
              disabled={busy}
              aria-pressed={purpose === 'signup'}
              className={`role-tab-btn ${purpose === 'signup' ? 'active' : ''}`}
              onClick={() => { setPurpose('signup'); reset(); }}
            >
              {config.signupLabel}
            </button>
          </div>
        )}

        <form className="terminal-form-body" onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy} className="auth-fields">

            {/* Signup-only extra fields */}
            {config.allowSignup && purpose === 'signup' && !sent && (
              <>
                <div className="form-group-block">
                  <label htmlFor="auth-fullname">Full name</label>
                  <input
                    id="auth-fullname"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div className="form-group-block">
                  <label htmlFor="auth-company">
                    {portalRole === 'supplier' ? 'Facility / Company legal name' : 'Organisation name'}
                  </label>
                  <input
                    id="auth-company"
                    type="text"
                    autoComplete="organization"
                    required
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group-block">
              <label htmlFor="auth-contact">Email or phone number</label>
              <input
                id="auth-contact"
                type="text"
                autoComplete="username"
                required
                readOnly={sent}
                value={contact}
                onChange={e => setContact(e.target.value)}
              />
            </div>

            {sent && (
              <div className="form-group-block">
                <p role="status">Code requested for {contact}. Enter the code you receive.</p>
                {devCode && (
                  <div style={{
                    margin: '8px 0 14px',
                    padding: '8px 12px',
                    background: '#fff8e6',
                    border: '1px solid #ffd57e',
                    borderRadius: '4px',
                    fontSize: '0.84rem',
                    color: '#8c5d00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}>
                    <span>Dev mode OTP: <strong style={{ letterSpacing: '2px', color: '#102a43' }}>{devCode}</strong></span>
                    <button
                      type="button"
                      className="btn-link"
                      style={{ fontSize: '0.8rem', color: '#8c5d00', fontWeight: 'bold' }}
                      onClick={() => setCode(devCode)}
                    >
                      Autofill
                    </button>
                  </div>
                )}
                <label htmlFor="auth-code">Verification code</label>
                <input
                  id="auth-code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => { setSent(false); setCode(''); setDevCode(''); }}
                >
                  Change contact or request another code
                </button>
              </div>
            )}

            {error && <p role="alert" className="field-error-msg">{error}</p>}

            <button type="submit" className="btn-auth-primary">
              {busy ? 'Please wait…' : sent ? 'Verify and continue' : 'Send verification code'}
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
