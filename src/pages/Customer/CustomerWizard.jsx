import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function CustomerWizard({ onComplete, onCancel }) {
  const { addCustomer, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [attachedDocs, setAttachedDocs] = useState(new Set());

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Identity
    name: '',
    entityType: 'Private Limited Company',
    cin: '',
    pan: '',
    gst: '',
    address: '',
    signatoryName: '',
    signatoryDesig: '',
    signatoryPhone: '',
    signatoryEmail: '',
    // Step 2: Operations
    factoryAddress: '',
    deliveryAddress: '',
    procName: '',
    procEmail: '',
    procPhone: '',
    finName: '',
    finEmail: '',
    finPhone: '',
    qcName: '',
    qcEmail: '',
    qcPhone: '',
    sector: 'Railways & Rolling Stock',
    product: '',
    turnover: '₹5 Cr – ₹25 Cr',
    // Step 3: Banking
    bankName: '',
    bankBranch: '',
    bankAcc: '',
    bankAcc2: '',
    bankType: 'Current Account',
    bankIfsc: '',
    // Step 4 & 5: Credit & MSME
    reqCreditTier: '15 to 30 Day Credit',
    reqCreditLimit: '₹ 25,00,000',
    msmeType: 'Medium Enterprise',
    udyamNo: '',
    decTerms: true,
    decTruth: true,
    // Step 6: Approvals & NDA
    decNda: true,
    apprRail: true,
    apprDef: true,
    apprAero: false,
    apprAuto: false
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDoc = (docName) => {
    setAttachedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docName)) {
        next.delete(docName);
        showToast(`Removed attachment: ${docName}`);
      } else {
        next.add(docName);
        showToast(`Attached: ${docName}`);
      }
      return next;
    });
  };

  const handleSelectCreditTier = (tierKey) => {
    const tierMap = {
      cash: 'Cash / Advance',
      '15_30': '15 to 30 Day Credit',
      '45_90': '45 to 90 Day Credit',
      strategic: 'Strategic Partner'
    };
    updateField('reqCreditTier', tierMap[tierKey] || '15 to 30 Day Credit');
  };

  const handleDemoFill = () => {
    setFormData({
      name: 'Medha Servo Drives Private Limited',
      entityType: 'Private Limited Company',
      cin: 'U31909TG1990PTC011234',
      pan: 'AABCM1234P',
      gst: '36AABCM1234P1Z4',
      address: 'Plot 21/A, R&D Enclave, Cherlapally, Hyderabad, Telangana 500051',
      signatoryName: 'K. V. Rama Rao',
      signatoryDesig: 'Director & Head of Procurement',
      signatoryPhone: '+91 98490 12345',
      signatoryEmail: 'ramarao@medhaservo.com',
      factoryAddress: 'Sy No. 501, Phase-V, IDA Cherlapally, Medchal-Malkajgiri, Telangana 500051',
      deliveryAddress: 'Central Inward Stores, Gate No. 2, Medha Servo Campus, Cherlapally',
      procName: 'N. Suresh Kumar',
      procEmail: 'procurement@medhaservo.com',
      procPhone: '+91 98491 88776',
      finName: 'P. Laxman Rao',
      finEmail: 'finance@medhaservo.com',
      finPhone: '+91 98492 55443',
      qcName: 'D. Srinivas',
      qcEmail: 'qa.inward@medhaservo.com',
      qcPhone: '+91 98493 22110',
      sector: 'Railways & Rolling Stock',
      product: 'Traction Converters, Auxiliary Power Units, TCMS Enclosures',
      turnover: '₹25 Cr – ₹100 Cr',
      bankName: 'State Bank of India',
      bankBranch: 'Industrial Finance Branch, Punjagutta, Hyderabad',
      bankAcc: '38472910548',
      bankAcc2: '38472910548',
      bankType: 'Current Account',
      bankIfsc: 'SBIN0004123',
      reqCreditTier: '15 to 30 Day Credit',
      reqCreditLimit: '₹ 50,00,000',
      msmeType: 'Medium Enterprise',
      udyamNo: 'UDYAM-TS-02-0019842',
      decTerms: true,
      decTruth: true,
      decNda: true,
      apprRail: true,
      apprDef: true,
      apprAero: false,
      apprAuto: false
    });

    setAttachedDocs(new Set([
      'Certificate_of_Incorporation.pdf',
      'Company_PAN_Card.pdf',
      'GST_REG06_Certificate.pdf',
      'MoA_AoA_Executed.pdf',
      'Cancelled_Cheque_Attested.pdf',
      'Audited_Financials_FY24_FY25.pdf',
      'ITR_Acknowledgments_AY24_AY25.pdf',
      'GSTR_3B_1_Last_6_Months.pdf',
      'Bank_Statements_6_Months.pdf',
      'Udyam_Registration_Certificate.pdf'
    ]));

    setStep(6);
    showToast('Demo corporate profile loaded! Review dossier summary below.');
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      alert('Please enter Company Legal Name before proceeding.');
      return;
    }
    if (step < 6) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Company Legal Name is required!');
      setStep(1);
      return;
    }

    const cid = addCustomer({
      ...formData,
      phone: formData.signatoryPhone || formData.procPhone || '+91 98490 12345',
      email: formData.procEmail || formData.signatoryEmail || 'procurement@company.com',
      attachedDocs: Array.from(attachedDocs)
    });

    if (onComplete) onComplete(cid);
  };

  const isCashTier = formData.reqCreditTier.includes('Cash');
  const isStrategic = formData.reqCreditTier.includes('Strategic');
  const isExtendedCredit = formData.reqCreditTier.includes('45 to 90') || isStrategic;

  return (
    <div className="card card-accent" style={{ padding: 'var(--sp-6)' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--sp-5)' }}>
        <div>
          <div className="kicker">Corporate Client Onboarding</div>
          <h2 style={{ marginBottom: '0.25rem' }}>Customer Registration &amp; Credit Appraisal</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Statutory KYC verification, multi-tier credit evaluation, and legal onboarding in compliance with ITTOVA Sourcing Standard Operating Procedures.
          </p>
        </div>
        <div className="flex-gap">
          <button className="btn btn-ghost btn-sm" onClick={handleDemoFill}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
            Auto-fill Demo Profile
          </button>
          {onCancel && (
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="wizard-steps">
        {[
          { num: 1, label: 'Identity' },
          { num: 2, label: 'Operations' },
          { num: 3, label: 'Banking' },
          { num: 4, label: 'Financials' },
          { num: 5, label: 'Credit & KYC' },
          { num: 6, label: 'Review' }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div 
              className={`wizard-step-item ${step === s.num ? 'active' : (step > s.num ? 'completed' : '')}`}
              onClick={() => setStep(s.num)}
              style={{ cursor: 'pointer' }}
            >
              <div className="wiz-step-num">{s.num}</div>
              <div className="wiz-step-label">{s.label}</div>
            </div>
            {idx < 5 && (
              <div 
                className="wiz-connector" 
                style={{ background: step > s.num ? 'var(--success)' : 'var(--border)' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="wizard-panel">
          <div className="view-section-title" style={{ marginTop: 'var(--sp-2)' }}>
            <h3>Section 1 &mdash; Company Identity &amp; Statutory Registration</h3>
          </div>
          <div className="grid-2">
            <div>
              <label>Company Legal Name <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => updateField('name', e.target.value)}
                placeholder="e.g. Medha Servo Drives Private Limited" 
              />
            </div>
            <div>
              <label>Constitution / Entity Type <span className="text-danger">*</span></label>
              <select value={formData.entityType} onChange={e => updateField('entityType', e.target.value)}>
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="Public Limited Company">Public Limited Company</option>
                <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                <option value="Partnership Firm">Partnership Firm</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
              </select>
            </div>
            <div>
              <label>Corporate Identity Number (CIN / LLPIN) <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.cin} 
                onChange={e => updateField('cin', e.target.value)}
                placeholder="U31909TG1990PTC011234" 
              />
            </div>
            <div>
              <label>Company PAN Number <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.pan} 
                onChange={e => updateField('pan', e.target.value.toUpperCase())}
                placeholder="AABCM1234P" 
                maxLength={10} 
                style={{ textTransform: 'uppercase' }} 
              />
            </div>
            <div>
              <label>GSTIN Registration Number <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.gst} 
                onChange={e => updateField('gst', e.target.value.toUpperCase())}
                placeholder="36AABCM1234P1Z4" 
                maxLength={15} 
                style={{ textTransform: 'uppercase' }} 
              />
            </div>
            <div>
              <label>Registered Office Address <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => updateField('address', e.target.value)}
                placeholder="Plot 21/A, R&D Enclave, Cherlapally, Hyderabad 500051" 
              />
            </div>
          </div>

          <div className="view-section-title" style={{ marginTop: 'var(--sp-4)' }}>
            <h3>Authorised Signatory Details</h3>
          </div>
          <div className="grid-2">
            <div>
              <label>Authorised Signatory Name <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.signatoryName} 
                onChange={e => updateField('signatoryName', e.target.value)}
                placeholder="e.g. K. V. Rama Rao" 
              />
            </div>
            <div>
              <label>Designation <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.signatoryDesig} 
                onChange={e => updateField('signatoryDesig', e.target.value)}
                placeholder="e.g. Director & Head of Procurement" 
              />
            </div>
            <div>
              <label>Signatory Mobile Phone <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.signatoryPhone} 
                onChange={e => updateField('signatoryPhone', e.target.value)}
                placeholder="+91 98490 12345" 
              />
            </div>
            <div>
              <label>Official Work Email <span className="text-danger">*</span></label>
              <input 
                type="email" 
                value={formData.signatoryEmail} 
                onChange={e => updateField('signatoryEmail', e.target.value)}
                placeholder="ramarao@medhaservo.com" 
              />
            </div>
          </div>

          <div className="view-section-title" style={{ marginTop: 'var(--sp-4)' }}>
            <h3>Statutory Document Attachments</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {[
              { id: 'Certificate_of_Incorporation.pdf', title: 'Certificate of Incorporation / Registration Deed', desc: 'MCA Registrar of Companies incorporation certificate.' },
              { id: 'Company_PAN_Card.pdf', title: 'PAN Card of Entity', desc: 'Self-attested clear copy of company or entity PAN card.' },
              { id: 'GST_REG06_Certificate.pdf', title: 'GST Registration Certificate (Form REG-06)', desc: 'Complete 3-page registration certificate showing places of business.' },
              { id: 'MoA_AoA_Executed.pdf', title: 'Memorandum & Articles of Association (MoA & AoA)', desc: 'Required for Private & Public Limited Companies.' }
            ].map(d => (
              <div key={d.id} className="doc-upload-row">
                <div className="doc-upload-info">
                  <div className="doc-upload-name">{d.title}</div>
                  <div className="doc-upload-note">{d.desc}</div>
                </div>
                <div 
                  className={`file-upload-mock doc-upload-slot ${attachedDocs.has(d.id) ? 'uploaded' : ''}`}
                  onClick={() => toggleDoc(d.id)}
                >
                  <span>{attachedDocs.has(d.id) ? `✓ ${d.id}` : 'Attach PDF'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="wizard-panel">
          <div className="view-section-title" style={{ marginTop: 'var(--sp-2)' }}>
            <h3>Section 2 &mdash; Operational Facilities &amp; Departmental Contacts</h3>
          </div>
          <div className="grid-2">
            <div>
              <label>Works / Manufacturing Plant Physical Address <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.factoryAddress} 
                onChange={e => updateField('factoryAddress', e.target.value)}
                placeholder="Sy No. 501, Phase-V, IDA Cherlapally, Medchal-Malkajgiri, Telangana 500051" 
              />
            </div>
            <div>
              <label>Default Material Unloading / Delivery Facility <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.deliveryAddress} 
                onChange={e => updateField('deliveryAddress', e.target.value)}
                placeholder="Central Inward Stores, Gate No. 2, Medha Servo Campus" 
              />
            </div>
          </div>

          <div className="view-section-title" style={{ marginTop: 'var(--sp-4)' }}>
            <h3>Key Departmental Contacts</h3>
          </div>
          <div className="grid-3">
            <div className="inner-panel">
              <h4 style={{ fontSize: '0.8rem', marginBottom: 'var(--sp-3)', color: 'var(--accent)' }}>Procurement / Sourcing</h4>
              <label>Contact Name</label>
              <input type="text" value={formData.procName} onChange={e => updateField('procName', e.target.value)} placeholder="N. Suresh Kumar" />
              <label>Official Email</label>
              <input type="email" value={formData.procEmail} onChange={e => updateField('procEmail', e.target.value)} placeholder="procurement@medhaservo.com" />
              <label>Mobile Number</label>
              <input type="text" value={formData.procPhone} onChange={e => updateField('procPhone', e.target.value)} placeholder="+91 98491 88776" />
            </div>
            <div className="inner-panel">
              <h4 style={{ fontSize: '0.8rem', marginBottom: 'var(--sp-3)', color: 'var(--accent)' }}>Accounts &amp; Finance</h4>
              <label>Contact Name</label>
              <input type="text" value={formData.finName} onChange={e => updateField('finName', e.target.value)} placeholder="P. Laxman Rao" />
              <label>Official Email</label>
              <input type="email" value={formData.finEmail} onChange={e => updateField('finEmail', e.target.value)} placeholder="finance@medhaservo.com" />
              <label>Mobile Number</label>
              <input type="text" value={formData.finPhone} onChange={e => updateField('finPhone', e.target.value)} placeholder="+91 98492 55443" />
            </div>
            <div className="inner-panel">
              <h4 style={{ fontSize: '0.8rem', marginBottom: 'var(--sp-3)', color: 'var(--accent)' }}>Quality Control &amp; Inspection</h4>
              <label>Contact Name</label>
              <input type="text" value={formData.qcName} onChange={e => updateField('qcName', e.target.value)} placeholder="D. Srinivas" />
              <label>Official Email</label>
              <input type="email" value={formData.qcEmail} onChange={e => updateField('qcEmail', e.target.value)} placeholder="qa.inward@medhaservo.com" />
              <label>Mobile Number</label>
              <input type="text" value={formData.qcPhone} onChange={e => updateField('qcPhone', e.target.value)} placeholder="+91 98493 22110" />
            </div>
          </div>

          <div className="view-section-title" style={{ marginTop: 'var(--sp-4)' }}>
            <h3>Operational Profile &amp; Manufacturing Domain</h3>
          </div>
          <div className="grid-3">
            <div>
              <label>Industry Vertical <span className="text-danger">*</span></label>
              <select value={formData.sector} onChange={e => updateField('sector', e.target.value)}>
                <option value="Railways & Rolling Stock">Railways &amp; Rolling Stock</option>
                <option value="Defence & Aerospace">Defence &amp; Aerospace</option>
                <option value="Automotive & Electric Mobility">Automotive &amp; Electric Mobility</option>
                <option value="Heavy Engineering & Power">Heavy Engineering &amp; Power</option>
                <option value="Medical Devices & Bio-Engineering">Medical Devices &amp; Bio-Engineering</option>
                <option value="Industrial Automation & Robotics">Industrial Automation &amp; Robotics</option>
                <option value="Precision Machinery Equipment">Precision Machinery Equipment</option>
              </select>
            </div>
            <div>
              <label>Key End Products / Systems <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.product} 
                onChange={e => updateField('product', e.target.value)}
                placeholder="Traction Converters, TCMS Enclosures" 
              />
            </div>
            <div>
              <label>Estimated Annual Sourcing Spend</label>
              <select value={formData.turnover} onChange={e => updateField('turnover', e.target.value)}>
                <option value="₹1 Cr – ₹5 Cr">₹1 Crore &ndash; ₹5 Crores</option>
                <option value="₹5 Cr – ₹25 Cr">₹5 Crores &ndash; ₹25 Crores</option>
                <option value="₹25 Cr – ₹100 Cr">₹25 Crores &ndash; ₹100 Crores</option>
                <option value="Above ₹100 Cr">Above ₹100 Crores</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="wizard-panel">
          <div className="view-section-title" style={{ marginTop: 'var(--sp-2)' }}>
            <h3>Section 3 &mdash; Bank Account &amp; Settlement Profile</h3>
          </div>
          <div className="alert alert-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            This bank account will be utilized for credit validation, refund processing, automated e-NACH mandates, and commercial reconciliation.
          </div>

          <div className="grid-2">
            <div>
              <label>Bank Legal Name <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.bankName} 
                onChange={e => updateField('bankName', e.target.value)}
                placeholder="e.g. State Bank of India" 
              />
            </div>
            <div>
              <label>Branch Name &amp; City <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.bankBranch} 
                onChange={e => updateField('bankBranch', e.target.value)}
                placeholder="e.g. Industrial Finance Branch, Hyderabad" 
              />
            </div>
            <div>
              <label>Current / CC Account Number <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.bankAcc} 
                onChange={e => updateField('bankAcc', e.target.value)}
                placeholder="e.g. 38472910548" 
              />
            </div>
            <div>
              <label>Confirm Account Number <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.bankAcc2} 
                onChange={e => updateField('bankAcc2', e.target.value)}
                placeholder="Re-enter bank account number" 
              />
            </div>
            <div>
              <label>Account Type <span className="text-danger">*</span></label>
              <select value={formData.bankType} onChange={e => updateField('bankType', e.target.value)}>
                <option value="Current Account">Current Account</option>
                <option value="Cash Credit (CC) / Overdraft (OD)">Cash Credit (CC) / Overdraft (OD)</option>
              </select>
            </div>
            <div>
              <label>IFSC Code (11 Digits) <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.bankIfsc} 
                onChange={e => updateField('bankIfsc', e.target.value.toUpperCase())}
                placeholder="SBIN0004123" 
                maxLength={11} 
                style={{ textTransform: 'uppercase' }} 
              />
            </div>
          </div>

          <div className="view-section-title" style={{ marginTop: 'var(--sp-4)' }}>
            <h3>Bank Document Verification</h3>
          </div>
          <div className="doc-upload-row">
            <div className="doc-upload-info">
              <div className="doc-upload-name">Cancelled Cheque or Certified Bank Header <span className="text-danger">*</span></div>
              <div className="doc-upload-note">Must clearly show Account Holder Name, Account Number, IFSC, and MICR matching the legal entity name.</div>
            </div>
            <div 
              className={`file-upload-mock doc-upload-slot ${attachedDocs.has('Cancelled_Cheque_Attested.pdf') ? 'uploaded' : ''}`}
              onClick={() => toggleDoc('Cancelled_Cheque_Attested.pdf')}
            >
              <span>{attachedDocs.has('Cancelled_Cheque_Attested.pdf') ? '✓ Cancelled_Cheque_Attested.pdf' : 'Attach PDF / Image'}</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="wizard-panel">
          <div className="view-section-title" style={{ marginTop: 'var(--sp-2)' }}>
            <h3>Section 4 &mdash; Financial Audit Documents &amp; Credit Proofs</h3>
          </div>

          <div className="alert alert-warn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>
              Selected Credit Tier: <strong>{formData.reqCreditTier}</strong>.{' '}
              {isCashTier 
                ? 'Advance / Cash tier requires zero financial audits. Fast approval within 4 hours.' 
                : 'Audited accounts and tax filings are required for corporate credit underwriting.'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {[
              { id: 'Audited_Financials_FY24_FY25.pdf', title: 'Audited Financial Statements (Last 2 Financial Years)', badge: 'Mandatory for Credit', opt: isCashTier },
              { id: 'ITR_Acknowledgments_AY24_AY25.pdf', title: 'Income Tax Returns (ITR-V Acknowledgments — Last 2 Years)', badge: 'Mandatory for Credit', opt: isCashTier },
              { id: 'GSTR_3B_1_Last_6_Months.pdf', title: 'GST Returns (GSTR-3B & GSTR-1 — Last 6 Months)', badge: 'Mandatory for Credit', opt: isCashTier },
              { id: 'Bank_Statements_6_Months.pdf', title: 'Operative Bank Account Statement (Last 6 Months)', badge: 'Mandatory for Credit', opt: isCashTier },
              { id: 'Bank_Sanction_Letter.pdf', title: 'Existing Bank Working Capital Sanction Letter', badge: 'Required for 45-90d / Strategic', opt: !isExtendedCredit },
              { id: 'CRISIL_Credit_Rating_Report.pdf', title: 'External Credit Rating Certificate', badge: 'Recommended', opt: !isStrategic },
              { id: 'Trade_References_Consolidated.pdf', title: 'Trade / Vendor References (2 Institutional Suppliers)', badge: 'Required for 45-90d / Strategic', opt: !isExtendedCredit }
            ].map(d => (
              <div 
                key={d.id} 
                className="doc-upload-row" 
                style={{ opacity: d.opt ? 0.6 : 1, transition: 'opacity 0.2s ease' }}
              >
                <div className="doc-upload-info">
                  <div className="doc-upload-name">
                    {d.title} <span className="badge badge-pending">{d.badge}</span>
                  </div>
                </div>
                <div 
                  className={`file-upload-mock doc-upload-slot ${attachedDocs.has(d.id) ? 'uploaded' : ''}`}
                  onClick={() => toggleDoc(d.id)}
                >
                  <span>{attachedDocs.has(d.id) ? `✓ ${d.id}` : 'Attach PDF'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <div className="wizard-panel">
          <div className="view-section-title" style={{ marginTop: 'var(--sp-2)' }}>
            <h3>Section 5 &mdash; Commercial Terms, Credit Tier &amp; MSME Compliance</h3>
          </div>

          <label style={{ marginBottom: '0.5rem', display: 'block' }}>
            Select Requested Credit Facility Tier <span className="text-danger">*</span>
          </label>
          <div className="credit-tier-grid">
            <div 
              className={`credit-tier-option ${formData.reqCreditTier === 'Cash / Advance' ? 'selected' : ''}`}
              onClick={() => handleSelectCreditTier('cash')}
            >
              <div className="ct-badge">Tier 1</div>
              <div className="ct-name">Cash / Advance</div>
              <div className="ct-terms">100% advance on PO or progressive milestone dispatch payment.</div>
              <div className="ct-reqs">• KYC + GST + Cheque only<br/>• Zero financial docs required<br/>• Fastest approval (&lt; 4 hrs)</div>
            </div>

            <div 
              className={`credit-tier-option ${formData.reqCreditTier === '15 to 30 Day Credit' ? 'selected' : ''}`}
              onClick={() => handleSelectCreditTier('15_30')}
            >
              <div className="ct-badge">Tier 2 • Most Popular</div>
              <div className="ct-name">15 to 30 Day Credit</div>
              <div className="ct-terms">Payment due 15 to 30 calendar days post QA approval &amp; dispatch.</div>
              <div className="ct-reqs">• 2 Yr Audited Financials<br/>• ITR + 6 Mo GST Returns<br/>• Standard 24h audit review</div>
            </div>

            <div 
              className={`credit-tier-option ${formData.reqCreditTier === '45 to 90 Day Credit' ? 'selected' : ''}`}
              onClick={() => handleSelectCreditTier('45_90')}
            >
              <div className="ct-badge">Tier 3</div>
              <div className="ct-name">45 to 90 Day Credit</div>
              <div className="ct-terms">Extended trade credit for medium &amp; large corporate clients.</div>
              <div className="ct-reqs">• All Tier 2 Documents<br/>• Bank Facility Proof<br/>• 2 Trade references</div>
            </div>

            <div 
              className={`credit-tier-option ${formData.reqCreditTier === 'Strategic Partner' ? 'selected' : ''}`}
              onClick={() => handleSelectCreditTier('strategic')}
            >
              <div className="ct-badge">Tier 4 • Enterprise</div>
              <div className="ct-name">Strategic Partner</div>
              <div className="ct-terms">Bespoke SLA, dedicated supplier allocation, revolving limit up to ₹5 Cr.</div>
              <div className="ct-reqs">• Comprehensive legal audit<br/>• Credit agency rating letter<br/>• Executive committee signoff</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 'var(--sp-6)' }}>
            <div>
              <label>Requested Credit Limit (₹ INR) <span className="text-danger">*</span></label>
              <input 
                type="text" 
                value={formData.reqCreditLimit} 
                onChange={e => updateField('reqCreditLimit', e.target.value)}
                placeholder="e.g. ₹ 25,00,000" 
              />
            </div>
            <div>
              <label>MSME Enterprise Classification</label>
              <select value={formData.msmeType} onChange={e => updateField('msmeType', e.target.value)}>
                <option value="Medium Enterprise">Medium Enterprise (Turnover ₹50 Cr – ₹250 Cr)</option>
                <option value="Small Enterprise">Small Enterprise (Turnover ₹5 Cr – ₹50 Cr)</option>
                <option value="Micro Enterprise">Micro Enterprise (Turnover up to ₹5 Cr)</option>
                <option value="Non-MSME / Large Corporate">Non-MSME / Large Corporate Enterprise</option>
              </select>
            </div>
            <div>
              <label>Udyam Registration Number (If MSME)</label>
              <input 
                type="text" 
                value={formData.udyamNo} 
                onChange={e => updateField('udyamNo', e.target.value)}
                placeholder="UDYAM-TS-02-0012345" 
              />
            </div>
            <div>
              <label>Udyam Registration Certificate</label>
              <div 
                className={`file-upload-mock doc-upload-slot ${attachedDocs.has('Udyam_Registration_Certificate.pdf') ? 'uploaded' : ''}`}
                style={{ minHeight: '42px', padding: '0.5rem 1rem' }}
                onClick={() => toggleDoc('Udyam_Registration_Certificate.pdf')}
              >
                <span>{attachedDocs.has('Udyam_Registration_Certificate.pdf') ? '✓ Udyam_Registration_Certificate.pdf' : 'Attach Udyam Certificate'}</span>
              </div>
            </div>
          </div>

          <div className="view-section-title" style={{ marginTop: 'var(--sp-5)' }}>
            <h3>Statutory &amp; Governance Undertakings</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.decTerms} 
                onChange={e => updateField('decTerms', e.target.checked)} 
                style={{ marginTop: '3px', width: '16px', height: '16px' }} 
              />
              <span>
                <strong>Acceptance of ITTOVA Standard Terms of Use &amp; Sourcing Governance</strong><br />
                <small className="text-muted">The entity agrees to abide by platform commercial settlement rules, delivery inspection tolerances, and dispute resolution guidelines.</small>
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.decTruth} 
                onChange={e => updateField('decTruth', e.target.checked)} 
                style={{ marginTop: '3px', width: '16px', height: '16px' }} 
              />
              <span>
                <strong>KYC Truthfulness &amp; Anti-Bribery Declaration</strong><br />
                <small className="text-muted">The authorised signatory certifies that all identity numbers, financial statements, and representations made herein are bona fide.</small>
              </span>
            </label>
          </div>
        </div>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <div className="wizard-panel">
          <div className="view-section-title" style={{ marginTop: 'var(--sp-2)' }}>
            <h3>Section 6 &mdash; Quality Certifications, NDA &amp; Final Dossier Review</h3>
          </div>

          <div className="inner-panel" style={{ marginBottom: 'var(--sp-5)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: 'var(--sp-3)' }}>
              Non-Disclosure Agreement (NDA) Execution
            </h4>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.decNda} 
                onChange={e => updateField('decNda', e.target.checked)} 
                style={{ marginTop: '3px', width: '16px', height: '16px' }} 
              />
              <span>
                <strong>Execute Mutual Non-Disclosure Agreement (M-NDA)</strong><br />
                <small className="text-muted">Engineering drawings, CAD files, proprietary geometries, and pricing matrices shared through the ITTOVA platform remain strictly confidential.</small>
              </span>
            </label>
          </div>

          <div className="view-section-title">
            <h3>Sector Quality Certifications &amp; OEM Approvals</h3>
          </div>
          <div className="grid-2" style={{ marginBottom: 'var(--sp-5)' }}>
            <div className="inner-panel">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.apprRail} onChange={e => updateField('apprRail', e.target.checked)} />
                RDSO / Indian Railways Approved Vendor
              </label>
            </div>
            <div className="inner-panel">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.apprDef} onChange={e => updateField('apprDef', e.target.checked)} />
                DGQA / MOD Defence Clearance
              </label>
            </div>
            <div className="inner-panel">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.apprAero} onChange={e => updateField('apprAero', e.target.checked)} />
                AS9100D / Aerospace Certified
              </label>
            </div>
            <div className="inner-panel">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.apprAuto} onChange={e => updateField('apprAuto', e.target.checked)} />
                IATF 16949 / Automotive Tier-1 Approved
              </label>
            </div>
          </div>

          <div className="view-section-title">
            <h3>Registration Dossier Summary</h3>
          </div>
          <div className="inner-panel" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="review-row">
                <span className="review-label">Company Legal Name</span>
                <span className="review-value"><strong>{formData.name || '—'}</strong></span>
              </div>
              <div className="review-row">
                <span className="review-label">Entity Type &amp; CIN</span>
                <span className="review-value">{formData.entityType} • {formData.cin || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">PAN &amp; GSTIN</span>
                <span className="review-value">{formData.pan || '—'} • {formData.gst || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Authorised Signatory</span>
                <span className="review-value">{formData.signatoryName || '—'} ({formData.signatoryDesig || '—'}) • {formData.signatoryPhone || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Works / Plant Location</span>
                <span className="review-value">{formData.factoryAddress || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Industry &amp; Products</span>
                <span className="review-value">{formData.sector} — {formData.product || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Bank Settlement</span>
                <span className="review-value">{formData.bankName || '—'} ({formData.bankBranch || '—'}) • A/c: {formData.bankAcc || '—'} • IFSC: {formData.bankIfsc || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Requested Credit Facility</span>
                <span className="review-value">
                  <span className="badge badge-tier">{formData.reqCreditTier}</span> • Limit: <strong>{formData.reqCreditLimit}</strong>
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">MSME Classification</span>
                <span className="review-value">{formData.msmeType} (Udyam: {formData.udyamNo || 'N/A'})</span>
              </div>
              <div className="review-row">
                <span className="review-label">Mutual NDA</span>
                <span className="review-value">
                  {formData.decNda ? <span className="text-success">✓ Certified</span> : <span className="text-danger">✗ Pending</span>}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Attached Documents</span>
                <span className="review-value" style={{ textAlign: 'right', maxWidth: '65%' }}>
                  {attachedDocs.size === 0 
                    ? <span className="text-muted">Standard documents verified during audit.</span>
                    : Array.from(attachedDocs).map(d => (
                        <span key={d} className="badge badge-approved" style={{ margin: '2px' }}>✓ {d}</span>
                      ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="wizard-nav flex-between">
        <div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            onClick={handlePrev}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Previous Section
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Step {step} of 6
          </span>
          {step < 6 ? (
            <button type="button" className="btn btn-sm" onClick={handleNext}>
              Save &amp; Continue
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-sm" 
              onClick={handleSubmit}
              style={{ background: 'var(--success)', borderColor: 'var(--success)', color: '#fff' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Submit Application to Customer Audit Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
