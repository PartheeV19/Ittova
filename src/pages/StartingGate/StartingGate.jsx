import React, { useState } from 'react';

export default function StartingGate({ onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: 'Industrial Buyer / OEM',
    location: '',
    purpose: ''
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Official email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.company.trim()) newErrors.company = 'Company / Organization is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.role.trim()) newErrors.role = 'Participant role is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete({
      ...formData,
      verifiedAt: new Date().toISOString()
    });
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
              Welcome to <span>ITOVA</span>
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

              <form onSubmit={handleSubmit} className="gate-form-body">
                <div className="form-group-block">
                  <label htmlFor="gate-name">
                    Full Name <span className="text-red">*</span>
                  </label>
                  <input
                    id="gate-name"
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="field-error-msg">{errors.name}</span>}
                </div>

                <div className="grid-2" style={{ gap: '12px' }}>
                  <div className="form-group-block">
                    <label htmlFor="gate-email">
                      Official Work Email <span className="text-red">*</span>
                    </label>
                    <input
                      id="gate-email"
                      type="email"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="field-error-msg">{errors.email}</span>}
                  </div>

                  <div className="form-group-block">
                    <label htmlFor="gate-phone">
                      Mobile / Phone <span className="text-red">*</span>
                    </label>
                    <input
                      id="gate-phone"
                      type="text"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group-block">
                  <label htmlFor="gate-company">
                    Company / Enterprise Legal Name <span className="text-red">*</span>
                  </label>
                  <input
                    id="gate-company"
                    type="text"
                    value={formData.company}
                    onChange={e => updateField('company', e.target.value)}
                    className={errors.company ? 'input-error' : ''}
                  />
                  {errors.company && <span className="field-error-msg">{errors.company}</span>}
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

                <div className="grid-2" style={{ gap: '12px' }}>
                  <div className="form-group-block">
                    <label htmlFor="gate-location">Location / Cluster</label>
                    <input
                      id="gate-location"
                      type="text"
                      value={formData.location}
                      onChange={e => updateField('location', e.target.value)}
                    />
                  </div>

                  <div className="form-group-block">
                    <label htmlFor="gate-purpose">Primary Focus</label>
                    <input
                      id="gate-purpose"
                      type="text"
                      value={formData.purpose}
                      onChange={e => updateField('purpose', e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-dark w-full"
                  style={{ width: '100%', marginTop: '16px', minHeight: '48px', fontSize: '0.94rem' }}
                >
                  Continue &rarr;
                </button>
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
