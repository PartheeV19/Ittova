import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

function normalizePhone(phone) {
  return phone.replace(/[\s().-]/g, '');
}

export default function StartingGate({ onComplete = () => {} }) {
  const { setCurrentView } = useApp();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending.current) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone.trim());
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!/^\+[1-9][0-9]{7,14}$/.test(normalizedPhone)) {
      nextErrors.phone = 'Include your country code, for example +919876543210.';
    }
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length) return;

    pending.current = true;
    setBusy(true);
    try {
      const saved = await onComplete({ email: normalizedEmail, phone: normalizedPhone });
      if (!saved) setSubmitError('We could not save your details. Please try again.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="starting-gate-wrapper">
      <div className="topline" />
      <header className="gate-header">
        <div className="container gate-header-inner">
          <div className="gate-brand">
            <span className="gate-brand-title">IT<span className="brand-accent-o">O</span>VA</span>
          </div>
        </div>
      </header>

      <main className="gate-main-container">
        <div className="container gate-grid">
          <div className="gate-intro-col">
            <h1 className="gate-title" style={{ marginTop: 0, fontSize: '2rem' }}>
              Welcome to <span className="brand-word">IT<span className="brand-accent-o">O</span>VA</span>
            </h1>
            <p className="gate-description">
              Explore ITOVA’s accountable, traceable execution layer for engineering buyers,
              manufacturing facilities, raw material suppliers, and operations teams.
            </p>

            <div className="gate-features-grid">
              <div className="gate-feature-card">
                <div className="gate-feature-icon" aria-hidden="true">01</div>
                <div>
                  <h4>Verified Machine Envelopes</h4>
                  <p>Match drawings to CNC turning, 4/5-axis VMC, and laser cutting capabilities.</p>
                </div>
              </div>
              <div className="gate-feature-card">
                <div className="gate-feature-icon" aria-hidden="true">02</div>
                <div>
                  <h4>Strict NDA &amp; IP Protection</h4>
                  <p>Confidential CAD handling, closed vendor tenders, and protected trade drawings.</p>
                </div>
              </div>
              <div className="gate-feature-card">
                <div className="gate-feature-icon" aria-hidden="true">03</div>
                <div>
                  <h4>End-to-End Live Stepper</h4>
                  <p>Track quoting, production, quality inspection, and dispatched freight.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gate-form-col">
            <div className="gate-form-card">
              <div className="gate-form-header">
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--ink)' }}>Continue to ITOVA</h2>
                <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  Enter your email and phone number. No account sign-in or OTP is needed to browse.
                </p>
                <p style={{ margin: '12px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  Already have an account?{' '}
                  <button type="button" className="btn-link" onClick={() => setCurrentView('login')}>
                    Sign in
                  </button>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="gate-form-body" aria-busy={busy}>
                <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                  <div className="form-group-block">
                    <label htmlFor="gate-email">Email address <span className="text-red">*</span></label>
                    <input
                      id="gate-email"
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'gate-email-error' : undefined}
                      type="email"
                      value={email}
                      onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: '' })); }}
                    />
                    {errors.email && <span id="gate-email-error" role="alert" className="field-error-msg">{errors.email}</span>}
                  </div>

                  <div className="form-group-block">
                    <label htmlFor="gate-phone">Phone number <span className="text-red">*</span></label>
                    <input
                      id="gate-phone"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      aria-required="true"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'gate-phone-error' : undefined}
                      type="tel"
                      value={phone}
                      onChange={(event) => { setPhone(event.target.value); setErrors((current) => ({ ...current, phone: '' })); }}
                    />
                    {errors.phone && <span id="gate-phone-error" role="alert" className="field-error-msg">{errors.phone}</span>}
                  </div>

                  {submitError && <p role="alert" className="field-error-msg">{submitError}</p>}
                  <button type="submit" className="btn btn-dark" disabled={busy} style={{ width: '100%', marginTop: '8px' }}>
                    {busy ? 'Saving details…' : 'Continue to website'}
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="gate-footer">
        <div className="container" style={{ fontSize: '0.8rem', color: '#849db0', textAlign: 'center' }}>
          <span>&copy; {new Date().getFullYear()} <span className="brand-word">IT<span className="brand-accent-o">O</span>VA</span>. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
