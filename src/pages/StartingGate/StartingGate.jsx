import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const PERSONAS = [
  {
    key: 'customer',
    roleTitle: 'Industrial Buyer / OEM',
    portalRoute: '/customer',
    tagline: 'Procure precision components, submit confidential CAD & track DFM toolpaths',
    badge: 'Customer Portal',
    badgeColor: '#1a3a2a',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
  {
    key: 'supplier',
    roleTitle: 'Manufacturing Facility / Vendor',
    portalRoute: '/vendor',
    tagline: 'Register CNC machines, axes, working envelopes & receive verified PO releases',
    badge: 'Vendor Platform',
    badgeColor: '#1a3a5c',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    )
  },
  {
    key: 'finance_partner',
    roleTitle: 'Bank / NBFC Financier',
    portalRoute: '/finance',
    tagline: 'Underwrite PO factoring, tripartite escrow settlement & vendor advance capital',
    badge: 'Financier & NBFC Hub',
    badgeColor: '#2a1a3a',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    )
  },
  {
    key: 'material_partner',
    roleTitle: 'Raw Material & Testing Partner',
    portalRoute: '/materials',
    tagline: 'Allocate certified billets, provide MTR 3.1 heat traceability & NABL test reports',
    badge: 'Material & NABL Console',
    badgeColor: '#3a2a1a',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" />
      </svg>
    )
  }
];

export default function StartingGate({ onComplete = () => { } }) {
  const navigate = useNavigate();
  const [selectedPersonaKey, setSelectedPersonaKey] = useState('customer');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: 'Industrial Buyer / OEM',

    // Customer Specific Fields
    custGst: '',
    custProcurementBudget: '₹25 Lakhs – ₹1 Cr',
    custComponentsNeeded: 'CNC Machined Parts & Precision Prismatic Housings',
    custDeliveryLocation: 'Hyderabad, Telangana',

    // Vendor Specific Fields
    vendMachines: '4-Axis VMC, CNC Turning Center, Fiber Laser Cutting',
    vendBuiltUpArea: '18,500 sq ft',
    vendTightestTolerance: '±0.005 mm (5 Microns)',
    vendCertifications: 'ISO 9001:2015, AS9100D',

    // Financier Specific Fields
    finInstitutionType: 'Scheduled Commercial Bank / Regulated NBFC',
    finRbiLicenceNo: '',
    finLendingFacility: 'Purchase Order (PO) Financing & Post-Inspection Invoice Factoring',
    finMinTicketSize: '₹ 15,00,000',

    // Material Partner Specific Fields
    matPartnerType: 'Raw Material Stockist & NABL Testing Laboratory',
    matStockedGrades: 'SS316L, 17-4PH, AL6061-T6, Alloy Steel 4140, Inconel 718',
    matNablAccreditationNo: 'TC-5812',
    matStockyardCapacity: '4,500 Metric Tons'
  });

  const { requestOtp, requestSharedOtp, verifyOtp } = useApp();
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
  const [devCode, setDevCode] = useState('');
  const resetOtp = () => { setSentTo(''); setCode(''); setOtpError(''); setDevCode(''); };
  const [errors, setErrors] = useState({});

  const handleSelectPersona = (pKey) => {
    resetOtp();
    setSelectedPersonaKey(pKey);
    const persona = PERSONAS.find(p => p.key === pKey);
    if (persona) {
      setFormData(prev => ({ ...prev, role: persona.roleTitle }));
    }
  };

  const updateField = (field, value) => {
    if (['email', 'phone'].includes(field)) resetOtp();
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleGuestExplore = (targetRoute = '/home') => {
    const persona = PERSONAS.find(p => p.key === selectedPersonaKey) || PERSONAS[0];
    onComplete({
      name: 'Guest Industrial Evaluator',
      company: 'Industrial Sourcing Explorer',
      role: persona.roleTitle,
      email: 'evaluator@ittova.internal',
      isGuest: true
    });
    navigate(targetRoute);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending.current) return;
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Official work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.company.trim()) newErrors.company = 'Company / Enterprise legal name is required';
    if (formData.phone.trim() && !/^\+[1-9][0-9]{7,14}$/.test(formData.phone.replace(/[\s().-]/g, ''))) {
      newErrors.phone = 'Include your country code, e.g. +919876543210';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      document.getElementById(`gate-${Object.keys(newErrors)[0]}`)?.focus();
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim() ? formData.phone.replace(/[\s().-]/g, '') : '';
    const persona = PERSONAS.find(p => p.key === selectedPersonaKey) || PERSONAS[0];
    const role = persona.key;

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
        const result = phone ? await requestSharedOtp(email, phone) : await requestOtp(email, 'signup');
        if (!result) { setOtpError('Could not request a code. Please ensure backend is active.'); return; }
        setSentTo({ email, phone });
        setCode('');
        setResendAt(Date.now() + 60000);
        if (result?.devCode) setDevCode(result.devCode);
      } else {
        const profilePayload = {
          fullName: formData.name.trim(),
          company: formData.company.trim(),
          phone,
          participantRole: persona.roleTitle,
          personaKey: persona.key,
          details: { ...formData }
        };

        const result = await verifyOtp(sentTo.email, code, role, {
          profile: profilePayload,
          onVerified: () => {
            onComplete({
              ...formData,
              role: persona.roleTitle,
              personaKey: persona.key,
              verifiedContact: sentTo.email,
              otpDestinations: sentTo,
              verificationMethod: 'shared-otp',
              verifiedAt: new Date().toISOString()
            });
            navigate(persona.portalRoute);
          }
        });
        if (!result) setOtpError('Verification failed. Check the code or request a new one.');
      }
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const activePersona = PERSONAS.find(p => p.key === selectedPersonaKey) || PERSONAS[0];

  return (
    <div className="starting-gate-wrapper">
      <div className="topline" />

      {/* Top Navbar */}
      <header className="gate-header">
        <div className="container gate-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="gate-brand">
            <span className="gate-brand-title">
              IT<span className="brand-accent-o">O</span>VA
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleGuestExplore('/home')}
            style={{ fontSize: '0.8rem' }}
          >
            Explore Platform as Guest &rarr;
          </button>
        </div>
      </header>

      {/* Main Gate Hero & Intake Form */}
      <main className="gate-main-container">
        <div className="container gate-grid">
          {/* Left Column: Context & Industrial Credentials */}
          <div className="gate-intro-col">
            <h1 className="gate-title" style={{ marginTop: 0, fontSize: '2.1rem', lineHeight: 1.2 }}>
              Every industrial requirement.<br />
              <span className="brand-word">One accountable</span> execution layer.
            </h1>
            <p className="gate-description">
              Select your industrial role below to access your dedicated onboarding checklist, technical envelopes, and platform workspace.
            </p>

            {/* 4 Persona Cards Selection Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.25rem', marginBottom: '1.5rem' }}>
              {PERSONAS.map(p => {
                const isSelected = selectedPersonaKey === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleSelectPersona(p.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #2563ab' : '1px solid var(--line)',
                      background: isSelected ? '#ffffff' : 'var(--paper)',
                      boxShadow: isSelected ? '0 4px 16px rgba(37,99,171,0.12)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: isSelected ? '#2563ab' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {p.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--ink)' }}>
                          {p.roleTitle}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: p.badgeColor,
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {p.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.35 }}>
                        {p.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Direct Portal Access:</span>
              <button type="button" className="btn-link" style={{ fontSize: '0.82rem', fontWeight: 700 }} onClick={() => handleGuestExplore('/customer')}>Customer</button>
              <span style={{ color: 'var(--line)' }}>&bull;</span>
              <button type="button" className="btn-link" style={{ fontSize: '0.82rem', fontWeight: 700 }} onClick={() => handleGuestExplore('/vendor')}>Vendor</button>
              <span style={{ color: 'var(--line)' }}>&bull;</span>
              <button type="button" className="btn-link" style={{ fontSize: '0.82rem', fontWeight: 700 }} onClick={() => handleGuestExplore('/finance')}>Financier</button>
              <span style={{ color: 'var(--line)' }}>&bull;</span>
              <button type="button" className="btn-link" style={{ fontSize: '0.82rem', fontWeight: 700 }} onClick={() => handleGuestExplore('/materials')}>Material &amp; NABL</button>
            </div>
          </div>

          {/* Right Column: Intake Form Card with Tailored Input Fields */}
          <div className="gate-form-col">
            <div className="gate-form-card">
              <div className="gate-form-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: activePersona.badgeColor, color: '#fff', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', marginBottom: '6px' }}>
                  {activePersona.badge} Intake
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ink)' }}>
                  {activePersona.roleTitle} Details
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Fill in your specific details to access your {activePersona.badge}.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="gate-form-body" aria-busy={busy}>
                <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                  
                  {/* Common Primary Identity Fields */}
                  <div className="form-group-block">
                    <label htmlFor="gate-name">
                      Full Name <span className="text-red">*</span>
                    </label>
                    <input
                      id="gate-name"
                      autoComplete="name"
                      placeholder="e.g. V. Rajeshwar Rao"
                      value={formData.name}
                      onChange={e => updateField('name', e.target.value)}
                      className={errors.name ? 'input-error' : ''}
                    />
                    {errors.name && <span role="alert" className="field-error-msg">{errors.name}</span>}
                  </div>

                  <div className="grid-2" style={{ gap: '10px' }}>
                    <div className="form-group-block">
                      <label htmlFor="gate-email">
                        Official Work Email <span className="text-red">*</span>
                      </label>
                      <input
                        id="gate-email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        type="email"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                        className={errors.email ? 'input-error' : ''}
                      />
                      {errors.email && <span role="alert" className="field-error-msg">{errors.email}</span>}
                    </div>

                    <div className="form-group-block">
                      <label htmlFor="gate-phone">
                        Mobile Number
                      </label>
                      <input
                        id="gate-phone"
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                        className={errors.phone ? 'input-error' : ''}
                      />
                      {errors.phone && <span role="alert" className="field-error-msg">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-group-block">
                    <label htmlFor="gate-company">
                      Enterprise / Organization Legal Name <span className="text-red">*</span>
                    </label>
                    <input
                      id="gate-company"
                      autoComplete="organization"
                      placeholder="e.g. Zenith Engineering Components Pvt Ltd"
                      value={formData.company}
                      onChange={e => updateField('company', e.target.value)}
                      className={errors.company ? 'input-error' : ''}
                    />
                    {errors.company && <span role="alert" className="field-error-msg">{errors.company}</span>}
                  </div>

                  {/* ── PERSONA SPECIFIC INPUT FIELDS ── */}

                  {/* 1. CUSTOMER PORTAL SPECIFIC FIELDS */}
                  {selectedPersonaKey === 'customer' && (
                    <div style={{ background: 'rgba(26, 58, 42, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(26, 58, 42, 0.2)', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1a3a2a', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Customer Procurement Parameters
                      </div>
                      <div className="grid-2" style={{ gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>GSTIN Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 36AABCZ9876K1Z8"
                            value={formData.custGst}
                            onChange={e => updateField('custGst', e.target.value.toUpperCase())}
                            style={{ fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>Annual Procurement Sourcing</label>
                          <select
                            value={formData.custProcurementBudget}
                            onChange={e => updateField('custProcurementBudget', e.target.value)}
                            style={{ fontSize: '0.84rem' }}
                          >
                            <option value="₹10 Lakhs – ₹50 Lakhs">₹10 Lakhs – ₹50 Lakhs</option>
                            <option value="₹50 Lakhs – ₹2 Cr">₹50 Lakhs – ₹2 Cr</option>
                            <option value="₹2 Cr – ₹10 Cr">₹2 Cr – ₹10 Cr</option>
                            <option value="₹10 Cr+ Enterprise Tier">₹10 Cr+ Enterprise Tier</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '0.78rem' }}>Key Component Types to Procure</label>
                        <input
                          type="text"
                          placeholder="e.g. CNC Turned Shafts, Hydraulic Manifolds, Sheet Enclosures"
                          value={formData.custComponentsNeeded}
                          onChange={e => updateField('custComponentsNeeded', e.target.value)}
                          style={{ fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. VENDOR PLATFORM SPECIFIC FIELDS */}
                  {selectedPersonaKey === 'supplier' && (
                    <div style={{ background: 'rgba(26, 58, 92, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(26, 58, 92, 0.2)', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1a3a5c', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Manufacturing Facility &amp; Machinery Envelopes
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.78rem' }}>Primary CNC Machinery Portfolio</label>
                        <input
                          type="text"
                          placeholder="e.g. 4-Axis VMC, CNC Turning Center, Fiber Laser Cutting"
                          value={formData.vendMachines}
                          onChange={e => updateField('vendMachines', e.target.value)}
                          style={{ fontSize: '0.84rem' }}
                        />
                      </div>
                      <div className="grid-2" style={{ gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>Built-Up Area</label>
                          <input
                            type="text"
                            placeholder="e.g. 18,500 sq ft"
                            value={formData.vendBuiltUpArea}
                            onChange={e => updateField('vendBuiltUpArea', e.target.value)}
                            style={{ fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>Tightest Linear Tolerance</label>
                          <input
                            type="text"
                            placeholder="e.g. ±0.005 mm (5 Microns)"
                            value={formData.vendTightestTolerance}
                            onChange={e => updateField('vendTightestTolerance', e.target.value)}
                            style={{ fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. FINANCIER & NBFC SPECIFIC FIELDS */}
                  {selectedPersonaKey === 'finance_partner' && (
                    <div style={{ background: 'rgba(42, 26, 58, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(42, 26, 58, 0.2)', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2a1a3a', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Lending Partner &amp; Regulatory Credentials
                      </div>
                      <div className="grid-2" style={{ gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>RBI Registration / Licence No</label>
                          <input
                            type="text"
                            placeholder="e.g. RBI/BL/1994/0821"
                            value={formData.finRbiLicenceNo}
                            onChange={e => updateField('finRbiLicenceNo', e.target.value)}
                            style={{ fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>Minimum Ticket Size</label>
                          <input
                            type="text"
                            placeholder="e.g. ₹ 15,00,000"
                            value={formData.finMinTicketSize}
                            onChange={e => updateField('finMinTicketSize', e.target.value)}
                            style={{ fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '0.78rem' }}>Primary Facilities Offered</label>
                        <input
                          type="text"
                          value={formData.finLendingFacility}
                          onChange={e => updateField('finLendingFacility', e.target.value)}
                          style={{ fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. MATERIAL & NABL SPECIFIC FIELDS */}
                  {selectedPersonaKey === 'material_partner' && (
                    <div style={{ background: 'rgba(58, 42, 26, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(58, 42, 26, 0.2)', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#3a2a1a', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Stockyard &amp; Metallurgical Metrology Scope
                      </div>
                      <div className="grid-2" style={{ gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>NABL Accreditation No (if Lab)</label>
                          <input
                            type="text"
                            placeholder="e.g. TC-5812"
                            value={formData.matNablAccreditationNo}
                            onChange={e => updateField('matNablAccreditationNo', e.target.value)}
                            style={{ fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem' }}>Stockyard Storage Capacity</label>
                          <input
                            type="text"
                            placeholder="e.g. 4,500 Metric Tons"
                            value={formData.matStockyardCapacity}
                            onChange={e => updateField('matStockyardCapacity', e.target.value)}
                            style={{ fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '0.78rem' }}>Stocked Alloy Grades</label>
                        <input
                          type="text"
                          placeholder="e.g. SS316L, 17-4PH, AL6061-T6, 4140, Inconel 718"
                          value={formData.matStockedGrades}
                          onChange={e => updateField('matStockedGrades', e.target.value)}
                          style={{ fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* OTP Verification Boxes */}
                  <div className="gate-otp-row">
                    <div className="gate-otp-boxes" role="group" aria-label="One-time password">
                      {Array.from({ length: 6 }, (_, index) => (
                        <input
                          key={index}
                          ref={element => { otpInputs.current[index] = element; }}
                          aria-label={`OTP digit ${index + 1}`}
                          aria-invalid={Boolean(otpError)}
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
                      {busy ? 'Processing...' : codeComplete ? 'Verify & Launch Portal' : 'Get OTP Code'}
                    </button>
                  </div>

                  {devCode && (
                    <div style={{
                      margin: '10px 0 4px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      fontSize: '0.8rem',
                      color: '#1e40af',
                      fontWeight: 700
                    }}>
                      ⚡ Dev Mode: Your verification OTP is <code>{devCode}</code>
                    </div>
                  )}

                  {otpError && (
                    <div role="alert" style={{ color: 'var(--red)', fontSize: '0.82rem', marginTop: '8px', fontWeight: 600 }}>
                      {otpError}
                    </div>
                  )}

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                      Selected: <strong>{activePersona.badge}</strong>
                    </span>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => handleGuestExplore(activePersona.portalRoute)}
                      style={{ fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      Skip directly to {activePersona.badge} &rarr;
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
