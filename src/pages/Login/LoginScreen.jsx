import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const { currentView, setCurrentView, requestOtp, verifyOtp, passwordLogin } = useApp();
  const role = currentView === 'vendor' ? 'supplier' : 'customer';
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [purpose, setPurpose] = useState('login');
  const [error, setError] = useState('');

  // Staff/admin sign-in is a separate mode: real password, no OTP, and it
  // doesn't touch currentView (that still only means customer/vendor here).
  const [staffMode, setStaffMode] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = sent ? await verifyOtp(contact.trim(), code.trim(), role, { purpose })
        : await requestOtp(contact.trim(), purpose);
      if (result === null) setError('Unable to continue. Check your details and try again.');
      else if (!sent) setSent(true);
    } finally { setBusy(false); }
  };

  const submitStaff = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await passwordLogin(staffEmail.trim(), staffPassword);
      if (result === null) setError('Invalid email or password.');
    } finally { setBusy(false); }
  };

  return (
    <main className="container auth-page">
      <button type="button" className="btn-link" onClick={() => setCurrentView('home')}>Back to Overview</button>
      <section className="auth-terminal-card" aria-labelledby="sign-in-title">
        <div className="terminal-header"><h1 id="sign-in-title">Portal Sign-In</h1><p>Access your workspace with your registered contact details.</p></div>
        <div className="role-tabs-bar" aria-label="Choose a portal">
          {[['customer', 'Customer'], ['vendor', 'Vendor']].map(([view, label]) => (
            <button type="button" key={view} disabled={busy} aria-pressed={!staffMode && role === (view === 'vendor' ? 'supplier' : view)} className={`role-tab-btn ${!staffMode && role === (view === 'vendor' ? 'supplier' : view) ? 'active' : ''}`} onClick={() => { setStaffMode(false); setCurrentView(view); setSent(false); setCode(''); setError(''); }}>{label}</button>
          ))}
          <button type="button" disabled={busy} aria-pressed={staffMode} className={`role-tab-btn ${staffMode ? 'active' : ''}`} onClick={() => { setStaffMode(true); setError(''); }}>Staff / Admin</button>
        </div>
        {staffMode ? (
          <form className="terminal-form-body" onSubmit={submitStaff} aria-busy={busy}>
            <fieldset disabled={busy} className="auth-fields">
              <div className="form-group-block"><label htmlFor="staff-email">Email</label><input id="staff-email" type="email" autoComplete="username" required value={staffEmail} onChange={e => setStaffEmail(e.target.value)} /></div>
              <div className="form-group-block"><label htmlFor="staff-password">Password</label><input id="staff-password" type="password" autoComplete="current-password" required value={staffPassword} onChange={e => setStaffPassword(e.target.value)} /></div>
              {error && <p role="alert" className="field-error-msg">{error}</p>}
              <button type="submit" className="btn-auth-primary">{busy ? 'Please wait...' : 'Sign in'}</button>
            </fieldset>
          </form>
        ) : (
          <form className="terminal-form-body" onSubmit={submit} aria-busy={busy}>
            <fieldset disabled={busy} className="auth-fields">
              {!sent && <div className="form-group-block"><label htmlFor="auth-purpose">Account access</label><select id="auth-purpose" value={purpose} onChange={e => setPurpose(e.target.value)}><option value="login">Sign in to an existing account</option><option value="signup">Register a new account</option></select></div>}
              <div className="form-group-block"><label htmlFor="auth-contact">Email or phone number</label><input id="auth-contact" type="text" autoComplete="username" required readOnly={sent} value={contact} onChange={e => setContact(e.target.value)} /></div>
              {sent && <div className="form-group-block"><p role="status">Code requested for {contact}. Enter the code you receive.</p><label htmlFor="auth-code">Verification code</label><input id="auth-code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value)} /><button type="button" className="btn-link" onClick={() => { setSent(false); setCode(''); }}>Change contact or request another code</button></div>}
              {error && <p role="alert" className="field-error-msg">{error}</p>}
              <button type="submit" className="btn-auth-primary">{busy ? 'Please wait...' : sent ? 'Verify and continue' : 'Send verification code'}</button>
            </fieldset>
          </form>
        )}
      </section>
    </main>
  );
}
