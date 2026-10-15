import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './vendor-auth.css';

const CAPABILITIES = [
  'CNC Milling (3/4/5-Axis)',
  'CNC Turning & Lathe',
  'Sheet Metal & Laser Cutting',
  'Heavy Fabrication & TIG/MIG',
  'Wire EDM & Spark Erosion',
  'Precision Surface Grinding',
  'Anodizing & Surface Finishing'
];

export default function VendorAuthScreen() {
  const { 
    requestOtp, 
    verifyOtp, 
    addVendor, 
    addVendorMachine, 
    showToast, 
    setCurrentView 
  } = useApp();

  const [mode, setMode] = useState('signup'); // 'login' | 'signup'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginContact, setLoginContact] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [loginDevCode, setLoginDevCode] = useState('');

  // Signup state
  const [signupStep, setSignupStep] = useState(1); // 1: form, 2: otp
  const [signupSent, setSignupSent] = useState(false);
  const [signupCode, setSignupCode] = useState('');
  const [signupDevCode, setSignupDevCode] = useState('');

  const [formData, setFormData] = useState({
    facilityName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    country: 'India',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    capabilities: ['CNC Milling (3/4/5-Axis)', 'CNC Turning & Lathe'],
    m1_name: '',
    m1_proc: 'CNC MILLING',
    m1_size: '1270 × 508 × 635 mm',
    m1_axis: '4-Axis VMC',
    m1_rate: 2200,
    m2_name: '',
    m2_proc: 'CNC TURNING',
    m2_size: 'Ø410 × 650 mm',
    m2_axis: '2-Axis Turning',
    m2_rate: 1650
  });

  const otpInputsRef = useRef([]);

  // Auto-focus first OTP digit when OTP view opens
  useEffect(() => {
    if ((loginSent || signupSent) && otpInputsRef.current[0]) {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }
  }, [loginSent, signupSent]);

  const handleDemoFill = () => {
    setFormData({
      facilityName: 'Apex Precision Aerospace & CNC Works',
      contactName: 'Rajesh Sharma',
      email: 'production@apexprecision.in',
      phone: '+919876543210',
      address: 'Plot 44, Cherlapally Industrial Estate, Phase II, Hyderabad',
      country: 'India',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      capabilities: [
        'CNC Milling (3/4/5-Axis)',
        'CNC Turning & Lathe',
        'Sheet Metal & Laser Cutting'
      ],
      m1_name: 'Haas VF-4SS Super Speed',
      m1_proc: 'CNC MILLING',
      m1_size: '1270 × 508 × 635 mm',
      m1_axis: '4-Axis VMC (12,000 RPM)',
      m1_rate: 2200,
      m2_name: 'Doosan Puma GT2600',
      m2_proc: 'CNC TURNING',
      m2_size: 'Ø410 × 650 mm',
      m2_axis: '2-Axis CNC Turning',
      m2_rate: 1650
    });
    setError('');
    showToast('Demo vendor facility data populated!');
  };

  const handlePresetLogin = (email) => {
    setLoginContact(email);
    setLoginSent(false);
    setLoginCode('');
    setError('');
  };

  const toggleCapability = (cap) => {
    setFormData(prev => {
      const exists = prev.capabilities.includes(cap);
      const capabilities = exists 
        ? prev.capabilities.filter(c => c !== cap) 
        : [...prev.capabilities, cap];
      return { ...prev, capabilities };
    });
  };

  const enterDigits = (index, value, isSignup = false) => {
    const raw = isSignup ? signupCode : loginCode;
    const setCodeFn = isSignup ? setSignupCode : setLoginCode;
    const digits = value.replace(/[^0-9]/g, '');
    const next = raw.padEnd(6, ' ').split('');
    
    if (!digits) {
      next[index] = ' ';
    } else {
      digits.slice(0, 6 - index).split('').forEach((d, offset) => {
        next[index + offset] = d;
      });
    }
    
    const combined = next.join('');
    setCodeFn(combined);
    setError('');
    
    if (digits) {
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  // --- Login Submission ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    const trimmedContact = loginContact.trim();
    if (!trimmedContact) {
      setError('Please enter your registered email or phone number.');
      return;
    }

    setBusy(true);
    try {
      if (!loginSent) {
        const res = await requestOtp(trimmedContact, 'login');
        if (!res) {
          setError('Unable to send verification code. Please check your contact and try again.');
          return;
        }
        setLoginSent(true);
        if (res.devCode) setLoginDevCode(res.devCode);
        showToast(`Verification code dispatched to ${trimmedContact}`);
      } else {
        const cleanCode = loginCode.trim();
        if (cleanCode.length !== 6) {
          setError('Please enter the full 6-digit verification code.');
          return;
        }

        const user = await verifyOtp(trimmedContact, cleanCode, 'supplier', { purpose: 'login' });
        if (user) {
          showToast(`Welcome back, ${user.name || 'Manufacturing Partner'}!`);
          setCurrentView('vendor', true);
        } else {
          setError('Invalid or expired verification code. Please try again.');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  // --- Signup Step 1: Validate & Request OTP ---
  const handleSignupRequestOtp = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!formData.facilityName.trim()) {
      setError('Facility legal name is required.');
      return;
    }
    if (!formData.contactName.trim()) {
      setError('Authorized contact person name is required.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('A valid official work email is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Operational phone number is required.');
      return;
    }

    setBusy(true);
    try {
      const email = formData.email.trim().toLowerCase();
      const res = await requestOtp(email, 'signup');
      if (!res) {
        setError('Could not request OTP. Please verify your email details.');
        return;
      }
      setSignupSent(true);
      setSignupStep(2);
      if (res.devCode) setSignupDevCode(res.devCode);
      showToast(`Verification OTP dispatched to ${email}`);
    } finally {
      setBusy(false);
    }
  };

  // --- Signup Step 2: Verify OTP & Register Facility ---
  const handleSignupVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    const cleanCode = signupCode.trim();
    if (cleanCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setBusy(true);
    try {
      const email = formData.email.trim().toLowerCase();
      const user = await verifyOtp(email, cleanCode, 'supplier', {
        purpose: 'signup',
        profile: {
          fullName: formData.contactName.trim(),
          company: formData.facilityName.trim(),
          phone: formData.phone.trim(),
          participantRole: 'Manufacturing Facility / Vendor'
        }
      });

      if (!user) {
        setError('Verification code is invalid or expired.');
        return;
      }

      // Compile initial machines if provided
      const machines = [];
      if (formData.m1_name) {
        machines.push({
          name: formData.m1_name,
          process: formData.m1_proc,
          size: formData.m1_size,
          axis: formData.m1_axis,
          rate: Number(formData.m1_rate) || 2000,
          materials: 'Alloy Steel, Aluminum, SS 304'
        });
      }
      if (formData.m2_name) {
        machines.push({
          name: formData.m2_name,
          process: formData.m2_proc,
          size: formData.m2_size,
          axis: formData.m2_axis,
          rate: Number(formData.m2_rate) || 1600,
          materials: 'Mild Steel, Brass, Titanium'
        });
      }

      // Add vendor facility record
      const vid = await addVendor({
        name: formData.facilityName.trim(),
        location: formData.address.trim() || `${formData.city}, ${formData.state}`,
        accountLocation: {
          country: formData.country.trim(),
          state: formData.state.trim(),
          district: formData.district.trim(),
          city: formData.city.trim()
        },
        phone: formData.phone.trim(),
        email: email,
        capabilities: formData.capabilities,
        machines: machines
      });

      if (vid && machines.length > 0) {
        // Register machines on the facility
        for (const m of machines) {
          await addVendorMachine(vid, m);
        }
      }

      showToast(`Facility successfully registered! Facility ID: ${vid || 'Assigned'}`);
      setCurrentView('vendor', true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="vendor-auth-wrapper">
      {/* Topline Bar */}
      <div className="topline" />

      {/* Header */}
      <header className="vendor-auth-header">
        <div className="container vendor-auth-header-inner">
          <div className="vendor-auth-brand">
            <span className="vendor-auth-brand-logo">
              IT<span className="accent-o">O</span>VA
            </span>
            <span className="vendor-auth-portal-badge">
              Vendor Platform
            </span>
          </div>
          <div className="vendor-auth-demo-badge">
            <span>Verified Manufacturing Network</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="vendor-auth-main">
        <div className="container vendor-auth-grid">
          
          {/* Left Column: Industrial Credentials & Value Proposition */}
          <div className="vendor-hero-col">
            <div className="vendor-hero-kicker">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Manufacturing Partner Network</span>
            </div>

            <h1 className="vendor-hero-title">
              Power Your Machine Shop With Guaranteed Orders
            </h1>

            <p className="vendor-hero-desc">
              Connect your verified CNC, VMC, and precision fabrication capacity directly to high-value industrial OEM work orders with audited toolpaths and secure payouts.
            </p>

            <div className="vendor-benefits-list">
              <div className="vendor-benefit-card">
                <div className="vendor-benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </div>
                <div>
                  <h4>Verified Machine Envelope Registry</h4>
                  <p>Register machine specs, bed sizes, and hourly rates to receive algorithmically matched CAD requests.</p>
                </div>
              </div>

              <div className="vendor-benefit-card">
                <div className="vendor-benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <h4>Direct Closed Tenders &amp; Instant POs</h4>
                  <p>Bid on RFQs with zero intermediary friction. Automated PO dispatch on quote approval.</p>
                </div>
              </div>

              <div className="vendor-benefit-card">
                <div className="vendor-benefit-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <h4>Guaranteed Commercial Payouts</h4>
                  <p>Milestone releases through ITOVA Escrow and NBFC partner financing upon QC sign-off.</p>
                </div>
              </div>
            </div>

            <div className="vendor-stat-row">
              <div className="vendor-stat-card">
                <div className="vendor-stat-num">450+</div>
                <div className="vendor-stat-label">Active CNC Machines</div>
              </div>
              <div className="vendor-stat-card">
                <div className="vendor-stat-num">&#8377;12+ Cr</div>
                <div className="vendor-stat-label">Work Dispatched</div>
              </div>
              <div className="vendor-stat-card">
                <div className="vendor-stat-num">100%</div>
                <div className="vendor-stat-label">Traceable Trace</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Vendor Auth Card */}
          <div className="vendor-auth-card">
            
            {/* Tabs */}
            <div className="vendor-tabs-bar" role="tablist">
              <button 
                type="button" 
                role="tab"
                aria-selected={mode === 'signup'}
                className={`vendor-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => { setMode('signup'); setError(''); }}
              >
                <span>Register Facility</span>
                <span className="vendor-tab-badge">Sign Up</span>
              </button>

              <button 
                type="button" 
                role="tab"
                aria-selected={mode === 'login'}
                className={`vendor-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError(''); }}
              >
                <span>Vendor Sign In</span>
                <span className="vendor-tab-badge">OTP Login</span>
              </button>
            </div>

            <div className="vendor-card-body">
              
              {/* ======================= SIGN UP TAB ======================= */}
              {mode === 'signup' && (
                <div>
                  <div className="vendor-card-header">
                    <div>
                      <h2>{signupStep === 1 ? 'Manufacturing Facility Registration' : 'Verify Contact Details'}</h2>
                      <p>{signupStep === 1 ? 'Register machinery capacity, location, and operational credentials.' : `Enter the 6-digit OTP code sent to ${formData.email}.`}</p>
                    </div>
                    {signupStep === 1 && (
                      <button 
                        type="button" 
                        className="btn-demo-fill" 
                        onClick={handleDemoFill}
                        title="Auto-fill sample machine shop facility details"
                      >
                        <span>⚡</span> Pre-fill Demo
                      </button>
                    )}
                  </div>

                  {signupStep === 1 ? (
                    <form onSubmit={handleSignupRequestOtp}>
                      <div className="vendor-form-section">
                        <div className="vendor-section-label">1. Facility &amp; Contact Credentials</div>
                        
                        <div className="form-group-block">
                          <label htmlFor="reg-facility-name">
                            Facility / Enterprise Legal Name <span className="text-danger">*</span>
                          </label>
                          <input 
                            id="reg-facility-name"
                            type="text" 
                            required
                            placeholder="e.g. Apex Precision Aerospace & CNC Works"
                            value={formData.facilityName}
                            onChange={e => setFormData({ ...formData, facilityName: e.target.value })}
                          />
                        </div>

                        <div className="grid-2">
                          <div className="form-group-block">
                            <label htmlFor="reg-contact-name">
                              Authorized Contact Person <span className="text-danger">*</span>
                            </label>
                            <input 
                              id="reg-contact-name"
                              type="text" 
                              required
                              placeholder="e.g. Rajesh Sharma"
                              value={formData.contactName}
                              onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                            />
                          </div>

                          <div className="form-group-block">
                            <label htmlFor="reg-email">
                              Official Work Email <span className="text-danger">*</span>
                            </label>
                            <input 
                              id="reg-email"
                              type="email" 
                              required
                              placeholder="production@facility.in"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="form-group-block">
                          <label htmlFor="reg-phone">
                            Operational Mobile / WhatsApp <span className="text-danger">*</span>
                          </label>
                          <input 
                            id="reg-phone"
                            type="tel" 
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="vendor-form-section">
                        <div className="vendor-section-label">2. Geographic &amp; Industrial Location</div>
                        
                        <div className="form-group-block">
                          <label htmlFor="reg-address">
                            Physical Facility Address / Industrial Area
                          </label>
                          <input 
                            id="reg-address"
                            type="text"
                            placeholder="e.g. Plot 44, Cherlapally Industrial Estate, Phase II"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>

                        <div className="grid-2">
                          <div className="form-group-block">
                            <label htmlFor="reg-state">State / Province <span className="text-danger">*</span></label>
                            <input 
                              id="reg-state"
                              type="text"
                              required
                              value={formData.state}
                              onChange={e => setFormData({ ...formData, state: e.target.value })}
                            />
                          </div>
                          <div className="form-group-block">
                            <label htmlFor="reg-city">City / District <span className="text-danger">*</span></label>
                            <input 
                              id="reg-city"
                              type="text"
                              required
                              value={formData.city}
                              onChange={e => setFormData({ ...formData, city: e.target.value, district: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="vendor-form-section">
                        <div className="vendor-section-label">3. Core Manufacturing Capabilities</div>
                        <div className="cap-pills-grid">
                          {CAPABILITIES.map(cap => {
                            const isSelected = formData.capabilities.includes(cap);
                            return (
                              <button 
                                key={cap}
                                type="button"
                                className={`cap-pill ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleCapability(cap)}
                              >
                                <span>{isSelected ? '✓' : '+'}</span>
                                {cap}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Initial Machine Preview */}
                      <div className="vendor-form-section">
                        <div className="vendor-section-label">4. Primary Machine Envelope (Optional)</div>
                        <div className="grid-2">
                          <div className="form-group-block">
                            <label htmlFor="reg-m1-name">Machine Model</label>
                            <input 
                              id="reg-m1-name"
                              type="text"
                              placeholder="e.g. Haas VF-4SS Super Speed"
                              value={formData.m1_name}
                              onChange={e => setFormData({ ...formData, m1_name: e.target.value })}
                            />
                          </div>
                          <div className="form-group-block">
                            <label htmlFor="reg-m1-rate">Target Rate (&#8377;/hr)</label>
                            <input 
                              id="reg-m1-rate"
                              type="number"
                              placeholder="2200"
                              value={formData.m1_rate}
                              onChange={e => setFormData({ ...formData, m1_rate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {error && <p role="alert" className="field-error-msg" style={{ marginBottom: '16px' }}>{error}</p>}

                      <button type="submit" className="btn-vendor-primary" disabled={busy}>
                        {busy ? 'Dispatching Verification...' : 'Continue to Phone & Email Verification →'}
                      </button>
                    </form>
                  ) : (
                    /* Signup Step 2: OTP Entry */
                    <form onSubmit={handleSignupVerifyAndRegister}>
                      <div className="otp-verification-box">
                        <div className="otp-target-info">
                          Verification code dispatched to <strong>{formData.email}</strong>
                        </div>

                        {signupDevCode && (
                          <div className="dev-otp-banner">
                            <span>Dev Mode Code:</span>
                            <span className="dev-otp-code">{signupDevCode}</span>
                            <button 
                              type="button" 
                              className="btn-autofill-otp"
                              onClick={() => {
                                setSignupCode(signupDevCode);
                                setError('');
                              }}
                            >
                              Auto-Fill
                            </button>
                          </div>
                        )}

                        <div className="otp-inputs-row" role="group" aria-label="Enter 6-digit verification code">
                          {Array.from({ length: 6 }, (_, idx) => (
                            <input 
                              key={idx}
                              ref={el => { otpInputsRef.current[idx] = el; }}
                              className="otp-digit-input"
                              inputMode="numeric"
                              maxLength={1}
                              value={signupCode[idx]?.trim() || ''}
                              onChange={e => enterDigits(idx, e.target.value, true)}
                              onKeyDown={e => {
                                if (e.key === 'Backspace' && !signupCode[idx]?.trim() && idx > 0) {
                                  e.preventDefault();
                                  enterDigits(idx - 1, '', true);
                                  otpInputsRef.current[idx - 1]?.focus();
                                }
                              }}
                              onPaste={e => {
                                e.preventDefault();
                                enterDigits(0, e.clipboardData.getData('text'), true);
                              }}
                            />
                          ))}
                        </div>

                        <div style={{ marginTop: '12px' }}>
                          <button 
                            type="button" 
                            className="btn-link" 
                            onClick={() => { setSignupStep(1); setError(''); }}
                            style={{ fontSize: '0.8rem' }}
                          >
                            ← Edit Facility Details or Resend Code
                          </button>
                        </div>
                      </div>

                      {error && <p role="alert" className="field-error-msg" style={{ marginBottom: '16px' }}>{error}</p>}

                      <button type="submit" className="btn-vendor-primary" disabled={busy || signupCode.trim().length !== 6}>
                        {busy ? 'Verifying & Registering Facility...' : 'Complete Registration & Access Workspace ✓'}
                      </button>
                    </form>
                  )}

                  <div className="auth-switch-link">
                    Already registered? 
                    <button type="button" onClick={() => { setMode('login'); setError(''); }}>
                      Sign in with OTP
                    </button>
                  </div>
                </div>
              )}

              {/* ======================= LOGIN TAB ======================= */}
              {mode === 'login' && (
                <div>
                  <div className="vendor-card-header">
                    <div>
                      <h2>Vendor Portal Sign-In</h2>
                      <p>Access your audited machinery matrix and assigned work orders.</p>
                    </div>
                  </div>

                  {/* Preset Demo Buttons for 1-click test */}
                  {!loginSent && (
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                        Quick Demo Facilities:
                      </div>
                      <div className="demo-preset-strip">
                        <button 
                          type="button" 
                          className="demo-preset-btn"
                          onClick={() => handlePresetLogin('production@apexprecision.in')}
                        >
                          ⚡ Apex Precision (Hyderabad Hub)
                        </button>
                        <button 
                          type="button" 
                          className="demo-preset-btn"
                          onClick={() => handlePresetLogin('ops@bharatmachining.in')}
                        >
                          ⚡ Bharat Machining (Balanagar)
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit}>
                    {!loginSent ? (
                      <div className="form-group-block">
                        <label htmlFor="login-contact">
                          Registered Work Email or Phone Number <span className="text-danger">*</span>
                        </label>
                        <input 
                          id="login-contact"
                          type="text"
                          required
                          autoComplete="username"
                          placeholder="e.g. production@apexprecision.in"
                          value={loginContact}
                          onChange={e => setLoginContact(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="otp-verification-box">
                        <div className="otp-target-info">
                          Enter the 6-digit code sent to <strong>{loginContact}</strong>
                        </div>

                        {loginDevCode && (
                          <div className="dev-otp-banner">
                            <span>Dev Mode Code:</span>
                            <span className="dev-otp-code">{loginDevCode}</span>
                            <button 
                              type="button" 
                              className="btn-autofill-otp"
                              onClick={() => {
                                setLoginCode(loginDevCode);
                                setError('');
                              }}
                            >
                              Auto-Fill
                            </button>
                          </div>
                        )}

                        <div className="otp-inputs-row" role="group" aria-label="Enter verification code">
                          {Array.from({ length: 6 }, (_, idx) => (
                            <input 
                              key={idx}
                              ref={el => { otpInputsRef.current[idx] = el; }}
                              className="otp-digit-input"
                              inputMode="numeric"
                              maxLength={1}
                              value={loginCode[idx]?.trim() || ''}
                              onChange={e => enterDigits(idx, e.target.value, false)}
                              onKeyDown={e => {
                                if (e.key === 'Backspace' && !loginCode[idx]?.trim() && idx > 0) {
                                  e.preventDefault();
                                  enterDigits(idx - 1, '', false);
                                  otpInputsRef.current[idx - 1]?.focus();
                                }
                              }}
                              onPaste={e => {
                                e.preventDefault();
                                enterDigits(0, e.clipboardData.getData('text'), false);
                              }}
                            />
                          ))}
                        </div>

                        <div style={{ marginTop: '12px' }}>
                          <button 
                            type="button" 
                            className="btn-link" 
                            onClick={() => { setLoginSent(false); setLoginCode(''); setError(''); }}
                            style={{ fontSize: '0.8rem' }}
                          >
                            Change contact or request new code
                          </button>
                        </div>
                      </div>
                    )}

                    {error && <p role="alert" className="field-error-msg" style={{ marginBottom: '16px' }}>{error}</p>}

                    <button 
                      type="submit" 
                      className="btn-vendor-primary" 
                      disabled={busy || (loginSent && loginCode.trim().length !== 6)}
                    >
                      {busy ? 'Processing...' : loginSent ? 'Verify & Access Console ✓' : 'Send Verification OTP →'}
                    </button>
                  </form>

                  <div className="auth-switch-link">
                    New manufacturing partner? 
                    <button type="button" onClick={() => { setMode('signup'); setError(''); }}>
                      Register Facility
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="vendor-auth-footer">
        <div className="container">
          <span>&copy; {new Date().getFullYear()} ITOVA Industrial Operations &bull; Dedicated Vendor Onboarding System</span>
        </div>
      </footer>
    </div>
  );
}
