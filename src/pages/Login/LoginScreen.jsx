import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

function normalizeContact(value) {
  const contact = value.trim();
  return /^[0-9]{10}$/.test(contact) ? `+91${contact}` : contact;
}

export default function LoginScreen() {
  const { requestOtp, verifyOtp, setCurrentView } = useApp();
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const otpInputs = useRef([]);

  const enterDigit = (index, value) => {
    const digits = value.replace(/[^0-9]/g, '');
    const next = code.padEnd(6, ' ').split('');
    if (!digits) next[index] = ' ';
    else digits.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
    setCode(next.join(''));
    setError('');
    if (digits) otpInputs.current[Math.min(index + digits.length, 5)]?.focus();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const normalizedContact = normalizeContact(contact);
      if (!sent) {
        const result = await requestOtp(normalizedContact, 'login');
        if (!result) {
          setError('Unable to send a code. Check your email or phone number and try again.');
          return;
        }
        if (result.devCode) setDevCode(result.devCode);
        setSent(true);
        return;
      }

      if (!/^[0-9]{6}$/.test(code.trim())) {
        setError('Enter the six-digit verification code.');
        return;
      }

      const result = await verifyOtp(normalizedContact, code.trim(), undefined, { purpose: 'login' });
      if (!result) {
        setError('Unable to sign in. Check your details and code, or request a new code.');
      }
    } finally {
      setBusy(false);
    }
  };

  const resetCode = () => {
    setSent(false);
    setCode('');
    setDevCode('');
    setError('');
  };

  return (
    <div className="starting-gate-wrapper">
      <div className="topline" />
      <header className="gate-header">
        <div className="container gate-header-inner">
          <div className="gate-brand">
            <span className="gate-brand-title">
              IT<span className="brand-accent-o">O</span>VA
            </span>
          </div>
        </div>
      </header>

      <main className="gate-main-container" style={{ alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <section className="gate-form-card" aria-labelledby="registered-login-title">
            <div className="gate-form-header">
              <h1 id="registered-login-title" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--ink)' }}>
                Registered User Sign In
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
                Enter the email address or phone number on your account. We’ll send you a one-time code.
              </p>
            </div>

            <form onSubmit={submit} className="gate-form-body" aria-busy={busy}>
              <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                <div className="form-group-block">
                  <label htmlFor="registered-contact">Email or phone number</label>
                  <input
                    id="registered-contact"
                    type="text"
                    autoComplete="username"
                    placeholder="name@company.com or +91 98765 43210"
                    required
                    readOnly={sent}
                    value={contact}
                    onChange={event => setContact(event.target.value)}
                  />
                </div>

                {sent && (
                  <div className="form-group-block">
                    <p role="status">A code was requested for {contact}. Enter the six-digit code you receive.</p>
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
                        gap: '8px'
                      }}>
                        <span>Dev mode OTP: <strong style={{ letterSpacing: '2px', color: '#102a43' }}>{devCode}</strong></span>
                        <button type="button" className="btn-link" onClick={() => { setCode(devCode); otpInputs.current[5]?.focus(); }}>
                          Autofill
                        </button>
                      </div>
                    )}
                    <label htmlFor="registered-code-0">Verification code</label>
                    <div className="gate-otp-boxes" role="group" aria-label="One-time password">
                      {Array.from({ length: 6 }, (_, index) => (
                        <input
                          key={index}
                          id={`registered-code-${index}`}
                          ref={element => { otpInputs.current[index] = element; }}
                          aria-label={`OTP digit ${index + 1}`}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? 'registered-login-error' : undefined}
                          inputMode="numeric"
                          autoComplete={index === 0 ? 'one-time-code' : 'off'}
                          value={code[index]?.trim() || ''}
                          onFocus={event => event.target.select()}
                          onChange={event => enterDigit(index, event.target.value)}
                          onPaste={event => { event.preventDefault(); enterDigit(index, event.clipboardData.getData('text')); }}
                          onKeyDown={event => {
                            if (event.key === 'Backspace' && !code[index]?.trim() && index > 0) {
                              event.preventDefault();
                              enterDigit(index - 1, '');
                              otpInputs.current[index - 1]?.focus();
                            } else if (event.key === 'ArrowLeft' && index > 0) {
                              event.preventDefault();
                              otpInputs.current[index - 1]?.focus();
                            } else if (event.key === 'ArrowRight' && index < 5) {
                              event.preventDefault();
                              otpInputs.current[index + 1]?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                    <button type="button" className="btn-link" onClick={resetCode}>
                      Change email or phone number
                    </button>
                  </div>
                )}

                {error && <p id="registered-login-error" role="alert" className="field-error-msg">{error}</p>}

                <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: 12 }}>
                  {busy ? 'Please wait...' : sent ? 'Verify and sign in' : 'Send verification code'}
                </button>

                <p style={{ margin: '18px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  New to ITOVA?{' '}
                  <button type="button" className="btn-link" onClick={() => setCurrentView('home')}>
                    Go to registration
                  </button>
                </p>
              </fieldset>
            </form>
          </section>
        </div>
      </main>

      <footer className="gate-footer">
        <div className="container" style={{ fontSize: '0.8rem', color: '#849db0', textAlign: 'center' }}>
          <span>&copy; {new Date().getFullYear()} ITOVA. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
