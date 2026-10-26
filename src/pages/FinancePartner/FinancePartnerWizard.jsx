import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function FinancePartnerWizard({ onComplete, onCancel }) {
  const { showToast, setCurrentUser } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [attachedDocs, setAttachedDocs] = useState(new Set());

  // Form State based on bank_nbfc_registration_details.docx
  const [formData, setFormData] = useState({
    // Step 1: Legal Identity & Regulatory Status
    institutionName: '',
    institutionType: 'Scheduled Commercial Bank',
    rbiLicenceNo: '',
    rbiRegistrationDate: '',
    cin: '',
    pan: '',
    gst: '',
    registeredOffice: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    website: '',

    // Step 2: Financial Strength & Portfolio Profile
    netOwnedFunds: '₹ 1,850 Cr',
    totalAum: '₹ 12,400 Cr',
    supplyChainBook: '₹ 1,200 Cr',
    grossNpa: '1.45%',
    netNpa: '0.38%',
    crarRatio: '18.2%',
    externalRating: 'CRISIL AA+ / ICRA AA (Stable)',
    existingBankLines: 'Multiple consortium lines & RBI refinance window',

    // Step 3: Lending Products & Commercial Facilities
    facilityPoFinancing: true,
    facilityInvoiceDiscounting: true,
    facilityVendorAdvance: true,
    facilityEscrowFunding: true,
    minTicketSize: '₹ 10,00,000',
    maxExposureBorrower: '₹ 15,00,00,000',
    maxExposureGroup: '₹ 50,00,00,000',
    indicativeApr: '8.75% – 10.50% p.a.',
    marginRequired: '15% – 20%',
    approvalTat: '24 – 48 Hours',
    disbursementTat: 'Same-Day RTGS upon Stage Trigger',

    // Step 4: Transaction Triggers & Settlement Escrow
    disburseTrigger: 'Customer PO + Verified Material Allocation',
    settlementBankName: '',
    settlementBranch: '',
    settlementAccountNo: '',
    settlementIfsc: '',
    escrowAccountSupported: 'Yes, Dedicated Tripartite Escrow Account Available',
    makerCheckerMandate: 'Dual Authorised Corporate Signatories (Level 1 + Level 2)',

    // Step 5: Responsible Officers & Key Team
    creditHeadName: '',
    creditHeadPhone: '',
    creditHeadEmail: '',
    scfHeadName: '',
    scfHeadPhone: '',
    scfHeadEmail: '',
    riskComplianceHeadName: '',
    riskComplianceHeadPhone: '',
    riskComplianceHeadEmail: '',
    grievanceOfficerName: '',
    grievanceOfficerPhone: '',
    grievanceOfficerEmail: '',

    // Declarations
    decRbiCompliance: false,
    decTerms: false
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

  const handleDemoFill = () => {
    setFormData({
      institutionName: 'HDFC Bank Ltd & Industrial Credit Capital Consortium',
      institutionType: 'Scheduled Commercial Bank',
      rbiLicenceNo: 'RBI/BL/1994/0821-SCH-COMM',
      rbiRegistrationDate: '1994-08-15',
      cin: 'L65920MH1994PLC080618',
      pan: 'AAACH1234D',
      gst: '27AAACH1234D1Z5',
      registeredOffice: 'HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400013',
      website: 'https://www.hdfcbank.com/wholesale/supply-chain',

      netOwnedFunds: '₹ 8,500 Cr',
      totalAum: '₹ 45,000 Cr',
      supplyChainBook: '₹ 4,800 Cr',
      grossNpa: '1.18%',
      netNpa: '0.28%',
      crarRatio: '19.4%',
      externalRating: 'CRISIL AAA (Stable) / CARE AAA',
      existingBankLines: 'Consortium Treasury & Primary Dealer lines',

      facilityPoFinancing: true,
      facilityInvoiceDiscounting: true,
      facilityVendorAdvance: true,
      facilityEscrowFunding: true,
      minTicketSize: '₹ 25,00,000',
      maxExposureBorrower: '₹ 25,00,00,000',
      maxExposureGroup: '₹ 100,00,00,000',
      indicativeApr: '8.25% – 9.60% p.a.',
      marginRequired: '15%',
      approvalTat: '24 Hours Digital Underwriting',
      disbursementTat: 'Instant RTGS upon ITTOVA Milestones',

      disburseTrigger: 'Customer PO + Verified Material Allocation + Process Validation',
      settlementBankName: 'HDFC Bank Limited',
      settlementBranch: 'Corporate Wholesale Banking Branch, Lower Parel',
      settlementAccountNo: '57500001928374',
      settlementIfsc: 'HDFC0000060',
      escrowAccountSupported: 'Yes, Dedicated Tripartite Escrow Account Available',
      makerCheckerMandate: 'Dual Authorised Corporate Signatories (Level 1 + Level 2)',

      creditHeadName: 'Arvind Swaminathan',
      creditHeadPhone: '+91 98200 44556',
      creditHeadEmail: 'arvind.credit@hdfcbank.com',
      scfHeadName: 'R. Meenakshi',
      scfHeadPhone: '+91 98200 66778',
      scfHeadEmail: 'scf.programs@hdfcbank.com',
      riskComplianceHeadName: 'Deepak Merchant',
      riskComplianceHeadPhone: '+91 98200 88990',
      riskComplianceHeadEmail: 'compliance@hdfcbank.com',
      grievanceOfficerName: 'Priya Nambiar',
      grievanceOfficerPhone: '+91 98200 11223',
      grievanceOfficerEmail: 'grievance.wholesale@hdfcbank.com',

      decRbiCompliance: true,
      decTerms: true
    });

    setAttachedDocs(new Set([
      'RBI_Scheduled_Bank_Licence.pdf',
      'Certificate_of_Incorporation.pdf',
      'Bank_Consortium_PAN_Card.pdf',
      'GST_REG06_Certificate.pdf',
      'CRISIL_Credit_Rating_Report_AAA.pdf',
      'Audited_Annual_Report_FY24_FY25.pdf',
      'Board_Resolution_SCF_Platform_Execution.pdf',
      'Tripartite_Escrow_Agreement_Draft.pdf',
      'Cancelled_Cheque_Nodal_Settlement.pdf',
      'Fair_Practices_Code_AML_Policy.pdf'
    ]));

    setStep(5);
    showToast('Loaded benchmark Scheduled Bank & NBFC lending partner credentials!');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.institutionName.trim()) return showToast('Please enter Financial Institution Name.');
      if (!formData.rbiLicenceNo.trim()) return showToast('Please enter RBI Licence / Registration Number.');
      if (!formData.pan.trim()) return showToast('Please enter PAN number.');
      if (!formData.gst.trim()) return showToast('Please enter GSTIN.');
      if (!formData.state.trim() || !formData.city.trim()) return showToast('Please specify State and City.');
    }
    if (step === 2) {
      if (!formData.netOwnedFunds.trim()) return showToast('Please enter Net Owned Funds / Capital details.');
    }
    if (step === 3) {
      if (!formData.minTicketSize.trim() || !formData.indicativeApr.trim()) {
        return showToast('Please specify Ticket Size & Indicative APR.');
      }
    }
    if (step === 4) {
      if (!formData.settlementAccountNo.trim() || !formData.settlementIfsc.trim()) {
        return showToast('Please provide Settlement Bank Account & IFSC details.');
      }
    }
    setStep(s => Math.min(s + 1, 5));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.decRbiCompliance || !formData.decTerms) {
      return showToast('Please confirm RBI statutory compliance and ITTOVA partnership terms.');
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setCurrentUser({
        name: formData.institutionName,
        company: formData.institutionName,
        role: 'finance_partner',
        participantRole: 'Bank / NBFC Financier',
        id: 'FIN-' + Math.floor(1000 + Math.random() * 9000),
        status: 'ACTIVE'
      });
      showToast(`Finance Partner profile submitted for ${formData.institutionName}! Consortium active.`);
      if (onComplete) onComplete();
    }, 600);
  };

  const steps = [
    { num: 1, label: 'Identity & RBI Status' },
    { num: 2, label: 'Financial Profile' },
    { num: 3, label: 'Lending Products' },
    { num: 4, label: 'Settlement Escrow' },
    { num: 5, label: 'Officers & Review' }
  ];

  return (
    <div className="card card-accent" style={{ marginBottom: '2rem' }}>
      {/* Header Banner */}
      <div className="flex-between" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(42, 26, 58, 0.1)', color: '#2a1a3a', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9333ea' }} />
            Financier &amp; NBFC Onboarding
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>
            Institutional Lending Partner Registration &amp; Credit Underwriting Setup
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '780px' }}>
            Onboard your bank or NBFC to underwrite precision manufacturing PO factoring, vendor advance lines, and tripartite escrow settlement for ITTOVA execution contracts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDemoFill}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>⚡</span> Load Demo Financier Data
          </button>
          {onCancel && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stepper Navigation */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '1px solid var(--line)', marginBottom: '1.75rem' }}>
        {steps.map(s => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            style={{
              flex: '1 1 auto',
              minWidth: '130px',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '6px',
              background: step === s.num ? 'var(--ink, #102a43)' : (step > s.num ? 'rgba(147, 51, 234, 0.08)' : 'var(--paper, #f8fafc)'),
              color: step === s.num ? '#ffffff' : (step > s.num ? '#6b21a8' : 'var(--muted, #64748b)'),
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>
              Step 0{s.num} {step > s.num ? '✓' : ''}
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '2px', whiteSpace: 'nowrap' }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Legal Identity & RBI Status */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              1. Institutional Identity &amp; RBI Regulatory Standing
            </h3>
            <div className="grid-2">
              <div>
                <label>Institution Legal Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank Ltd / Tata Capital Financial Services Ltd"
                  value={formData.institutionName}
                  onChange={e => updateField('institutionName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Institution Category</label>
                <select value={formData.institutionType} onChange={e => updateField('institutionType', e.target.value)}>
                  <option value="Scheduled Commercial Bank">Scheduled Commercial Bank</option>
                  <option value="RBI-Registered NBFC - Investment & Credit Company (NBFC-ICC)">RBI-Registered NBFC - ICC</option>
                  <option value="RBI-Registered NBFC - Factor">RBI-Registered NBFC - Factor</option>
                  <option value="Supply Chain Fintech / Private Debt Syndicate">Supply Chain Fintech / Private Debt Syndicate</option>
                </select>
              </div>
              <div>
                <label>RBI Banking Licence / Registration Certificate No <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. RBI/BL/1994/0821-SCH-COMM"
                  value={formData.rbiLicenceNo}
                  onChange={e => updateField('rbiLicenceNo', e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Registration / Licence Date</label>
                <input
                  type="date"
                  value={formData.rbiRegistrationDate}
                  onChange={e => updateField('rbiRegistrationDate', e.target.value)}
                />
              </div>
              <div>
                <label>Corporate Identity Number (CIN)</label>
                <input
                  type="text"
                  placeholder="e.g. L65920MH1994PLC080618"
                  value={formData.cin}
                  onChange={e => updateField('cin', e.target.value)}
                />
              </div>
              <div>
                <label>Permanent Account Number (PAN) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. AAACH1234D"
                  value={formData.pan}
                  onChange={e => updateField('pan', e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div>
                <label>GST Registration Certificate (GSTIN) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 27AAACH1234D1Z5"
                  value={formData.gst}
                  onChange={e => updateField('gst', e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <label>Wholesale / SCF Portal Website</label>
                <input
                  type="text"
                  placeholder="https://www.yourbank.com/scf"
                  value={formData.website}
                  onChange={e => updateField('website', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Registered Corporate Headquarters Address <span className="text-danger">*</span></label>
              <textarea
                rows={2}
                placeholder="Full registered office address"
                value={formData.registeredOffice}
                onChange={e => updateField('registeredOffice', e.target.value)}
                required
              />
            </div>

            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div>
                <label>State <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. Maharashtra" value={formData.state} onChange={e => updateField('state', e.target.value)} required />
              </div>
              <div>
                <label>City <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. Mumbai" value={formData.city} onChange={e => updateField('city', e.target.value)} required />
              </div>
              <div>
                <label>Pincode</label>
                <input type="text" placeholder="e.g. 400013" value={formData.pincode} onChange={e => updateField('pincode', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Financial Strength & Portfolio */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              2. Financial Strength, Capital Adequacy &amp; Portfolio Size
            </h3>
            <div className="grid-3">
              <div>
                <label>Net Owned Funds (NOF) / Tier-1 Capital <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. ₹ 2,500 Cr" value={formData.netOwnedFunds} onChange={e => updateField('netOwnedFunds', e.target.value)} required />
              </div>
              <div>
                <label>Total Assets Under Management (AUM)</label>
                <input type="text" placeholder="e.g. ₹ 15,000 Cr" value={formData.totalAum} onChange={e => updateField('totalAum', e.target.value)} />
              </div>
              <div>
                <label>Current Supply Chain / MSME Book</label>
                <input type="text" placeholder="e.g. ₹ 1,500 Cr" value={formData.supplyChainBook} onChange={e => updateField('supplyChainBook', e.target.value)} />
              </div>
            </div>

            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div>
                <label>Gross NPA (%)</label>
                <input type="text" placeholder="e.g. 1.25%" value={formData.grossNpa} onChange={e => updateField('grossNpa', e.target.value)} />
              </div>
              <div>
                <label>Net NPA (%)</label>
                <input type="text" placeholder="e.g. 0.35%" value={formData.netNpa} onChange={e => updateField('netNpa', e.target.value)} />
              </div>
              <div>
                <label>Capital Adequacy Ratio (CRAR)</label>
                <input type="text" placeholder="e.g. 18.5%" value={formData.crarRatio} onChange={e => updateField('crarRatio', e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div>
                <label>External Credit Rating &amp; Agency</label>
                <input type="text" placeholder="e.g. CRISIL AAA (Stable) / ICRA AA+" value={formData.externalRating} onChange={e => updateField('externalRating', e.target.value)} />
              </div>
              <div>
                <label>Consortium Lines &amp; Refinance Profile</label>
                <input type="text" placeholder="e.g. Consortium lines, SIDBI / RBI refinance" value={formData.existingBankLines} onChange={e => updateField('existingBankLines', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Lending Products & Commercial Facilities */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              3. Proposed Lending Products &amp; Commercial Terms
            </h3>

            <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Approved Financing Facilities Offered:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
              {[
                { key: 'facilityPoFinancing', label: 'Purchase Order (PO) Financing' },
                { key: 'facilityInvoiceDiscounting', label: 'Post-Inspection Invoice Discounting' },
                { key: 'facilityVendorAdvance', label: 'Raw Material Advance Funding' },
                { key: 'facilityEscrowFunding', label: 'Tripartite Escrow Account Facility' }
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--paper)', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer', fontSize: '0.86rem' }}>
                  <input
                    type="checkbox"
                    checked={formData[item.key]}
                    onChange={e => updateField(item.key, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="grid-3">
              <div>
                <label>Minimum Ticket Size <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. ₹ 10,00,000" value={formData.minTicketSize} onChange={e => updateField('minTicketSize', e.target.value)} required />
              </div>
              <div>
                <label>Maximum Exposure per Vendor / Borrower</label>
                <input type="text" placeholder="e.g. ₹ 10,00,00,000" value={formData.maxExposureBorrower} onChange={e => updateField('maxExposureBorrower', e.target.value)} />
              </div>
              <div>
                <label>Maximum Group Exposure</label>
                <input type="text" placeholder="e.g. ₹ 50,00,00,000" value={formData.maxExposureGroup} onChange={e => updateField('maxExposureGroup', e.target.value)} />
              </div>
            </div>

            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div>
                <label>Indicative Interest Rate / APR <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. 8.5% - 10.25% p.a." value={formData.indicativeApr} onChange={e => updateField('indicativeApr', e.target.value)} required />
              </div>
              <div>
                <label>Margin Requirement (%)</label>
                <input type="text" placeholder="e.g. 15% - 20%" value={formData.marginRequired} onChange={e => updateField('marginRequired', e.target.value)} />
              </div>
              <div>
                <label>Approval TAT</label>
                <input type="text" placeholder="e.g. 24 - 48 Hours" value={formData.approvalTat} onChange={e => updateField('approvalTat', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Settlement & Escrow */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              4. Banking, Nodal Settlement &amp; Disbursement Triggers
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label>Underwriting &amp; Disbursement Release Milestone Trigger</label>
              <select value={formData.disburseTrigger} onChange={e => updateField('disburseTrigger', e.target.value)}>
                <option value="Customer PO + Verified Material Allocation">Customer PO Release + Verified Material Allocation (Vendor Advance)</option>
                <option value="Customer PO + Process Validator Signoff">Customer PO + Process Validator Signoff</option>
                <option value="Material Inward + Quality Hub CMM Inspection">Material Inward + Quality Hub CMM Inspection (Post-Inspection Factoring)</option>
                <option value="Customer Delivery Confirmation">Customer Final Delivery &amp; Acceptance Confirmation</option>
              </select>
            </div>

            <div className="grid-2">
              <div>
                <label>Settlement Bank Name <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. HDFC Bank" value={formData.settlementBankName} onChange={e => updateField('settlementBankName', e.target.value)} required />
              </div>
              <div>
                <label>Settlement Branch &amp; City</label>
                <input type="text" placeholder="Branch Name" value={formData.settlementBranch} onChange={e => updateField('settlementBranch', e.target.value)} />
              </div>
              <div>
                <label>Settlement / Nodal Account Number <span className="text-danger">*</span></label>
                <input type="text" placeholder="Account Number" value={formData.settlementAccountNo} onChange={e => updateField('settlementAccountNo', e.target.value)} required />
              </div>
              <div>
                <label>Settlement Account IFSC Code <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. HDFC0000060" value={formData.settlementIfsc} onChange={e => updateField('settlementIfsc', e.target.value.toUpperCase())} required />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div>
                <label>Tripartite Escrow Account Architecture</label>
                <input type="text" value={formData.escrowAccountSupported} onChange={e => updateField('escrowAccountSupported', e.target.value)} />
              </div>
              <div>
                <label>Payment Mandate Controls</label>
                <input type="text" value={formData.makerCheckerMandate} onChange={e => updateField('makerCheckerMandate', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Responsible Officers & Review */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              5. Responsible Officers, Compliance Documents &amp; Partnership Activation
            </h3>

            <div className="grid-2">
              <div>
                <label>Credit Head / Chief Underwriting Officer</label>
                <input type="text" placeholder="Name" value={formData.creditHeadName} onChange={e => updateField('creditHeadName', e.target.value)} />
                <input type="text" placeholder="Phone" value={formData.creditHeadPhone} onChange={e => updateField('creditHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
                <input type="email" placeholder="Official Email" value={formData.creditHeadEmail} onChange={e => updateField('creditHeadEmail', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label>Supply Chain Finance / Product Head</label>
                <input type="text" placeholder="Name" value={formData.scfHeadName} onChange={e => updateField('scfHeadName', e.target.value)} />
                <input type="text" placeholder="Phone" value={formData.scfHeadPhone} onChange={e => updateField('scfHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
                <input type="email" placeholder="Official Email" value={formData.scfHeadEmail} onChange={e => updateField('scfHeadEmail', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label>Risk &amp; Compliance Head (AML / RBI)</label>
                <input type="text" placeholder="Name" value={formData.riskComplianceHeadName} onChange={e => updateField('riskComplianceHeadName', e.target.value)} />
                <input type="text" placeholder="Phone" value={formData.riskComplianceHeadPhone} onChange={e => updateField('riskComplianceHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
                <input type="email" placeholder="Official Email" value={formData.riskComplianceHeadEmail} onChange={e => updateField('riskComplianceHeadEmail', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label>Grievance Redressal Officer</label>
                <input type="text" placeholder="Name" value={formData.grievanceOfficerName} onChange={e => updateField('grievanceOfficerName', e.target.value)} />
                <input type="text" placeholder="Phone" value={formData.grievanceOfficerPhone} onChange={e => updateField('grievanceOfficerPhone', e.target.value)} style={{ marginTop: '6px' }} />
                <input type="email" placeholder="Official Email" value={formData.grievanceOfficerEmail} onChange={e => updateField('grievanceOfficerEmail', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
            </div>

            {/* Document Checklist */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Required Regulatory &amp; Banking Documents (Click to Attach):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                {[
                  'RBI_Scheduled_Bank_Licence.pdf',
                  'Certificate_of_Incorporation.pdf',
                  'Bank_Consortium_PAN_Card.pdf',
                  'GST_REG06_Certificate.pdf',
                  'CRISIL_Credit_Rating_Report_AAA.pdf',
                  'Audited_Annual_Report_FY24_FY25.pdf',
                  'Board_Resolution_SCF_Platform_Execution.pdf',
                  'Tripartite_Escrow_Agreement_Draft.pdf',
                  'Cancelled_Cheque_Nodal_Settlement.pdf',
                  'Fair_Practices_Code_AML_Policy.pdf'
                ].map(doc => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => toggleDoc(doc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: attachedDocs.has(doc) ? '1px solid #16a34a' : '1px solid var(--line)',
                      background: attachedDocs.has(doc) ? 'rgba(22, 163, 74, 0.08)' : 'var(--paper)',
                      color: attachedDocs.has(doc) ? '#15803d' : 'var(--ink)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{doc}</span>
                    <span>{attachedDocs.has(doc) ? '✓ Attached' : '+ Attach'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Declarations */}
            <div style={{ marginTop: '1.25rem', background: 'var(--paper)', padding: '14px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', cursor: 'pointer', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.decRbiCompliance}
                  onChange={e => updateField('decRbiCompliance', e.target.checked)}
                  required
                />
                <span>We confirm that the lending partner entity holds valid and unencumbered regulatory registration with the Reserve Bank of India (RBI) and complies with all applicable Master Directions on Digital Lending and Supply Chain Factoring.</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.decTerms}
                  onChange={e => updateField('decTerms', e.target.checked)}
                  required
                />
                <span>We agree to the ITTOVA Master Finance Partner Integration Terms and Tripartite Escrow Protocol for accountable invoice discounting and PO financing.</span>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)' }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(s => Math.max(s - 1, 1))}
              >
                &larr; Previous Step
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {step < 5 ? (
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleNext}
              >
                Continue to Step 0{step + 1} &rarr;
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-dark"
                disabled={submitting}
              >
                {submitting ? 'Activating Finance Partner...' : 'Complete Institutional Onboarding &rarr;'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
