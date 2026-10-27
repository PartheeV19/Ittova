import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Industrial Buyer / OEM' },
  { value: 'supplier', label: 'Manufacturing Facility / Vendor' },
  { value: 'finance_partner', label: 'Bank / NBFC Financier' },
  { value: 'material_partner', label: 'Raw Material & Testing Partner' }
];

const ROLE_VIEWS = {
  customer: 'customer',
  supplier: 'vendor',
  finance_partner: 'finance',
  material_partner: 'materials'
};

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function RoleChangePage() {
  const {
    currentUser,
    getRoleChangeStatus,
    requestRoleChangeOtp,
    changeAccountRole,
    setCurrentView,
    showToast
  } = useApp();
  const [status, setStatus] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const otpInputs = useRef([]);

  useEffect(() => {
    let active = true;
    getRoleChangeStatus().then((result) => {
      if (!active) return;
      if (result) setStatus(result);
      else setError('Could not load role change availability. Please refresh the page.');
    });
    return () => { active = false; };
  }, []);

  const cooldownActive = Boolean(status && !status.canChangeRole);
  const currentRoleLabel = ROLE_OPTIONS.find(option => option.value === (status?.role || currentUser?.role))?.label
    || status?.role
    || currentUser?.role
    || 'Unknown';

  const enterDigit = (index, value) => {
    const digits = value.replace(/[^0-9]/g, '');
    const next = code.padEnd(6, ' ').split('');
    if (!digits) next[index] = ' ';
    else digits.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
    setCode(next.join(''));
    setError('');
    if (digits) otpInputs.current[Math.min(index + digits.length, 5)]?.focus();
  };

  const resetOtp = () => {
    setOtpSent(false);
    setCode('');
    setDevCode('');
    setError('');
  };

  const requestCode = async (event) => {
    event.preventDefault();
    if (busy || !targetRole || cooldownActive) return;
    setBusy(true);
    setError('');
    try {
      const result = await requestRoleChangeOtp(targetRole);
      if (!result) {
        setError('Could not send a code. Check your registered contact details and try again.');
        return;
      }
      setOtpSent(true);
      setDevCode(result.devCode || '');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const confirmRoleChange = async (event) => {
    event.preventDefault();
    if (busy || !targetRole || cooldownActive) return;
    if (!/^[0-9]{6}$/.test(code.trim())) {
      setError('Enter the six-digit verification code.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const user = await changeAccountRole(targetRole, code.trim());
      if (!user) {
        setError('The role was not changed. Check the code and try again.');
        return;
      }
      const nextLabel = ROLE_OPTIONS.find(option => option.value === user.role)?.label || user.role;
      showToast(`Role changed to ${nextLabel}. You can change it again after 15 days.`);
      setCurrentView(ROLE_VIEWS[user.role] || 'home', true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container account-page">
      <section className="gate-form-card" style={{ maxWidth: 720, margin: '0 auto' }} aria-labelledby="role-change-title">
        <div className="gate-form-header">
          <div className="kicker">Account access</div>
          <h1 id="role-change-title" style={{ margin: '4px 0 0', color: 'var(--ink)' }}>Change Role</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>
            Changing your role changes the workspace available to your account. Verify with an OTP sent to your registered contact.
          </p>
        </div>

        <form className="gate-form-body" onSubmit={otpSent ? confirmRoleChange : requestCode} aria-busy={busy}>
          <fieldset disabled={busy || !status || cooldownActive} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <div className="form-group-block">
              <label>Current role</label>
              <input type="text" value={currentRoleLabel} readOnly />
            </div>

            {cooldownActive ? (
              <div className="alert alert-warn" role="status">
                Your role was changed recently. You can change it again after {formatDate(status.availableAt)}.
              </div>
            ) : (
              <>
                <div className="form-group-block">
                  <label htmlFor="new-role">New role</label>
                  <select
                    id="new-role"
                    required
                    value={targetRole}
                    disabled={busy || !status || otpSent}
                    onChange={event => { setTargetRole(event.target.value); resetOtp(); }}
                  >
                    <option value="">Select a role</option>
                    {ROLE_OPTIONS.filter(option => option.value !== status?.role).map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {otpSent && (
                  <div className="form-group-block">
                    <p role="status">A verification code was sent to your registered contact.</p>
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
                    <label htmlFor="role-change-code-0">Verification code</label>
                    <div className="gate-otp-boxes" role="group" aria-label="One-time password">
                      {Array.from({ length: 6 }, (_, index) => (
                        <input
                          key={index}
                          id={`role-change-code-${index}`}
                          ref={element => { otpInputs.current[index] = element; }}
                          aria-label={`OTP digit ${index + 1}`}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? 'role-change-error' : undefined}
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
                    <button type="button" className="btn-link" onClick={resetOtp}>
                      Choose a different role
                    </button>
                  </div>
                )}
              </>
            )}

            {error && <p id="role-change-error" role="alert" className="field-error-msg">{error}</p>}

            {!cooldownActive && (
              <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: 12 }} disabled={busy || !status || !targetRole}>
                {busy ? 'Please wait...' : otpSent ? 'Verify OTP and change role' : 'Send verification code'}
              </button>
            )}
          </fieldset>
        </form>
      </section>
    </main>
  );
}
