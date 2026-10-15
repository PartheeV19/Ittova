import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const { requestOtp, verifyOtp } = useApp();
  const [purpose, setPurpose] = useState('login');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (purpose === 'signup' && !sent) {
        if (!fullName.trim() || !company.trim()) {
          setError('Full name and facility legal name are required.');
          return;
        }
      }

      const result = sent 
        ? await verifyOtp(contact.trim(), code.trim(), 'supplier', { 
            purpose,
            profile: purpose === 'signup' ? {
              fullName: fullName.trim(),
              company: company.trim(),
              participantRole: 'Manufacturing Facility / Vendor'
            } : undefined
          })
        : await requestOtp(contact.trim(), purpose);

      if (result === null) {
        setError('Unable to continue. Check your details and try again.');
      } else if (!sent) {
        setSent(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container auth-page">
      <section className="auth-terminal-card" aria-labelledby="sign-in-title">
        <div className="terminal-header">
          <h1 id="sign-in-title">Vendor Portal Access</h1>
          <p>Access your vendor workspace with your registered contact details.</p>
        </div>

        <div className="role-tabs-bar" aria-label="Vendor access options">
          <button 
            type="button" 
            disabled={busy} 
            aria-pressed={purpose === 'login'} 
            className={`role-tab-btn ${purpose === 'login' ? 'active' : ''}`} 
            onClick={() => { setPurpose('login'); setSent(false); setCode(''); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            disabled={busy} 
            aria-pressed={purpose === 'signup'} 
            className={`role-tab-btn ${purpose === 'signup' ? 'active' : ''}`} 
            onClick={() => { setPurpose('signup'); setSent(false); setCode(''); setError(''); }}
          >
            Register Facility
          </button>
        </div>

        <form className="terminal-form-body" onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy} className="auth-fields">
            {purpose === 'signup' && !sent && (
              <>
                <div className="form-group-block">
                  <label htmlFor="vendor-name">Full name</label>
                  <input 
                    id="vendor-name" 
                    type="text" 
                    autoComplete="name" 
                    required 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                  />
                </div>
                <div className="form-group-block">
                  <label htmlFor="vendor-company">Facility / Company legal name</label>
                  <input 
                    id="vendor-company" 
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
                  onClick={() => { setSent(false); setCode(''); }}
                >
                  Change contact or request another code
                </button>
              </div>
            )}

            {error && <p role="alert" className="field-error-msg">{error}</p>}

            <button type="submit" className="btn-auth-primary">
              {busy ? 'Please wait...' : sent ? 'Verify and continue' : 'Send verification code'}
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
