import React, { useRef, useState } from 'react';

import { useApp } from '../../context/AppContext';

export default function StartingGate({ onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: 'Industrial Buyer / OEM'
  });

  const { requestSharedOtp, verifyOtp } = useApp();
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const otpInputs = useRef([]);
  const codeComplete = /^[0-9]{6}$/.test(code);
  const enterDigits = (index, value) => {
    const digits = value.replace(/[^0-9]/g, '');
    const next = code.padEnd(6, ' ').split('');
    if (!digits) next[index] = ' ';
    else digits.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
    setCode(next.join(''));
    setOtpError('');
    if (digits) otpInputs.current[Math.min(index + digits.length, 5)]?.focus();
  };
  const [otpError, setOtpError] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const resetOtp = () => { setSentTo(''); setCode(''); setOtpError(''); };
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    if (['email', 'phone', 'role'].includes(field)) resetOtp();
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending.current) return;
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Official email is required';
    } else if (! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.company.trim()) newErrors.company = 'Company / Organization is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+[1-9][0-9]{7,14}$/.test(formData.phone.replace(/[\s().-]/g, ''))) newErrors.phone = 'Include your country code, for example +919876543210';
    if (!formData.role.trim()) newErrors.role = 'Participant role is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      document.getElementById(`gate-${Object.keys(newErrors)[0]}`)?.focus();
      return;
    }

    const role = formData.role.includes('Buyer') ? 'customer'
      : /Manufacturing|Raw Material/.test(formData.role) ? 'supplier' : null;
    if (!role) {
      setOtpError('OTP access is currently available for customers and vendors. Please select the relevant participant role.');
      return;
    }
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.replace(/[\s().-]/g, '');
    if (codeComplete && !sentTo) {
      setOtpError('Request an OTP before submitting a code.');
      return;
    }
    if (!codeComplete && Date.now() < resendAt) {
      setOtpError('Please wait a minute before requesting another code.');
      return;
    }
    pending.current = true;
    setBusy(true);
    setOtpError('');
    try {
      if (!codeComplete) {
        const result = await requestSharedOtp(email, phone);
        if (!result) { setOtpError('Could not request a code. Please try again.'); return; }
        setSentTo({ email, phone });
        setCode('');
        setResendAt(Date.now() + 60000);
      } else {
        const result = await verifyOtp(sentTo.email, code, role, { onVerified: () => onComplete({
          ...formData,
          verifiedContact: sentTo.email,
          otpDestinations: sentTo,
          verificationMethod: 'shared-otp',
          verifiedAt: new Date().toISOString()
        }) });
        if (!result) setOtpError('Verification failed. Check the code or request a new one.');
      }
    } finally { pending.current = false; setBusy(false); }

  };

  return (
    <div className="starting-gate-wrapper">
      <div className="topline" />

      {/* Top Navbar */}
      <header className="gate-header">
        <div className="container gate-header-inner">
          <div className="gate-brand">
            <span className="gate-brand-title">
              IT<span className="brand-accent-o">O</span>VA
            </span>
          </div>
        </div>
      </header>

      {/* Main Gate Hero & Intake Form */}
      <main className="gate-main-container">
        <div className="container gate-grid">
          {/* Left Column: Context & Industrial Credentials */}
          <div className="gate-intro-col">
            <h1 className="gate-title" style={{ marginTop: 0, fontSize: '2rem' }}>
              Welcome to IT<span className="brand-accent-o">O</span>VA
            </h1>
            <p className="gate-description">
              ITOVA provides an accountable, traceable execution layer connecting engineering buyers, 
              verified manufacturing facilities, raw material suppliers, and operations inspection hubs.
            </p>

            {/* Feature Highlights Grid */}
            <div className="gate-features-grid">
              <div className="gate-feature-card">
                <div className="gate-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </div>
                <div>
                  <h4>Verified Machine Envelopes</h4>
                  <p>Machine registry matching drawings to CNC turning, 4/5-axis VMC, and laser cutting.</p>
                </div>
              </div>

              <div className="gate-feature-card">
                <div className="gate-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h4>Strict NDA &amp; IP Protection</h4>
                  <p>Confidential CAD handling, closed vendor tenders, and protected trade drawings.</p>
                </div>
              </div>

              <div className="gate-feature-card">
                <div className="gate-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div>
                  <h4>End-to-End Live Stepper</h4>
                  <p>Track DFM toolpaths, quoting, PO releases, IGI quality inspection, and dispatched freight.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Intake Form Card */}
          <div className="gate-form-col">
            <div className="gate-form-card">
              <div className="gate-form-header">
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--ink)' }}>
                  Enter Details
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  Provide your details to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="gate-form-body" aria-busy={busy}>
                <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                <div className="form-group-block">
                  <label htmlFor="gate-name">
                    Full Name <span className="text-red">*</span>
                  </label>
                  <input
                    id="gate-name"
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "gate-name-error" : undefined}
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span id="gate-name-error" role="alert" className="field-error-msg">{errors.name}</span>}
                </div>

                <div className="grid-2" style={{ gap: '12px' }}>
                  <div className="form-group-block">
                    <label htmlFor="gate-email">
                      Official Work Email <span className="text-red">*</span>
                    </label>
                    <input
                      id="gate-email"
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "gate-email-error" : undefined}
                      type="email"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span id="gate-email-error" role="alert" className="field-error-msg">{errors.email}</span>}
                  </div>

                  <div className="form-group-block">
                    <label htmlFor="gate-phone">
                      Mobile / Phone <span className="text-red">*</span>
                    </label>
                    <input
                      id="gate-phone"
                      placeholder="+91 98765 43210"
                    autoComplete="tel"
                    aria-required="true"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "gate-phone-error" : undefined}
                      type="text"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span id="gate-phone-error" role="alert" className="field-error-msg">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group-block">
                  <label htmlFor="gate-company">
                    Company / Enterprise Legal Name <span className="text-red">*</span>
                  </label>
                  <input
                    id="gate-company"
                    autoComplete="organization"
                    aria-required="true"
                    aria-invalid={Boolean(errors.company)}
                    aria-describedby={errors.company ? "gate-company-error" : undefined}
                    type="text"
                    value={formData.company}
                    onChange={e => updateField('company', e.target.value)}
                    className={errors.company ? 'input-error' : ''}
                  />
                  {errors.company && <span id="gate-company-error" role="alert" className="field-error-msg">{errors.company}</span>}
                </div>

                <div className="form-group-block">
                  <label htmlFor="gate-role">
                    Participant Role / Area of Interest <span className="text-red">*</span>
                  </label>
                  <select
                    id="gate-role"
                    value={formData.role}
                    onChange={e => updateField('role', e.target.value)}
                  >
                    <option value="Industrial Buyer / OEM">Industrial Buyer / OEM (Procure Components &amp; Submit CAD)</option>
                    <option value="Manufacturing Facility / Vendor">Manufacturing Facility / Machine Shop (CNC, Milling, Fabrication)</option>
                    <option value="Raw Material & Testing Partner">Raw Material Trader &amp; Inspection Agency</option>
                    <option value="Bank / NBFC Financier">Banking &amp; Financial Institution (Execution Finance)</option>
                    <option value="Corporate Evaluator">Executive / Evaluator (Exploring Platform Capabilities)</option>
                  </select>
                </div>

                <div className="gate-otp-row">
                  <div className="gate-otp-boxes" role="group" aria-label="One-time password">
                    {Array.from({ length: 6 }, (_, index) => (
                      <input
                        key={index}
                        ref={element => { otpInputs.current[index] = element; }}
                        aria-label={`OTP digit ${index + 1}`}
                        aria-invalid={Boolean(otpError)}
                        aria-describedby={otpError ? 'gate-otp-error' : undefined}
                        inputMode="numeric"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        value={code[index]?.trim() || ''}
                        onFocus={e => e.target.select()}
                        onChange={e => enterDigits(index, e.target.value)}
                        onPaste={e => { e.preventDefault(); enterDigits(index, e.clipboardData.getData('text')); }}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !code[index]?.trim() && index > 0) {
                            e.preventDefault(); enterDigits(index - 1, ''); otpInputs.current[index - 1]?.focus();
                          } else if (e.key === 'ArrowLeft' && index > 0) {
                            e.preventDefault(); otpInputs.current[index - 1]?.focus();
                          } else if (e.key === 'ArrowRight' && index < 5) {
                            e.preventDefault(); otpInputs.current[index + 1]?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                  <button type="submit" className="btn btn-dark btn-sm" disabled={busy}>
                    {busy ? 'Please wait...' : codeComplete ? 'Submit OTP' : 'Get OTP'}
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '8px 0 0' }}>You will receive the OTP on your phone and email.</p>
                {otpError && <p id="gate-otp-error" role="alert" className="field-error-msg">{otpError}</p>}
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="gate-footer">
        <div className="container" style={{ fontSize: '0.8rem', color: '#849db0', textAlign: 'center' }}>
          <span>&copy; {new Date().getFullYear()} ITOVA. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
