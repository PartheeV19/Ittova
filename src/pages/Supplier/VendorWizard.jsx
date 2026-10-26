import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function VendorWizard({ onComplete, onCancel }) {
  const { addVendor, showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [attachedDocs, setAttachedDocs] = useState(new Set());

  // Form State based on ITTOX_Final_Integrated_Project_Execution_Resource_Launch_Plan.docx
  const [formData, setFormData] = useState({
    // Step 1: Company Identity & Legal Registration
    name: '',
    entityType: 'Private Limited Company',
    cin: '',
    pan: '',
    gst: '',
    address: '',
    country: 'India',
    state: '',
    district: '',
    city: '',
    pincode: '',
    udyamNo: '',
    signatoryName: '',
    signatoryDesig: 'Managing Director / Partner',
    signatoryPhone: '',
    signatoryEmail: '',

    // Step 2: Factory & Operational Infrastructure
    factoryAddress: '',
    builtUpArea: '18,500 sq ft',
    facilityOwnership: 'Owned',
    workingShifts: '2 Shifts (16 Hours/Day)',
    installedPower: '250 kVA',
    dgBackup: '160 kVA DG Set',
    monthlyCapacity: '4,500 Machining Hours',
    capacityUtilisation: '68%',
    majorCustomers: 'Defense PSUs, Aerospace Tier-1, Railway Rolling Stock OEMs',
    leadTimeAvg: '2 - 3 Weeks',

    // Step 3: Machinery & Equipment Portfolio
    machines: [
      { id: 'M-1', name: 'Haas VF-4SS Super Speed', type: 'VMC (Vertical Machining Center)', make: 'Haas Automation USA', year: '2021', travel: '1270 x 508 x 635 mm', axis: '4-Axis (12,000 RPM)', qty: 2, condition: 'Excellent' },
      { id: 'M-2', name: 'Doosan Puma GT2600', type: 'CNC Turning Center', make: 'DN Solutions / Doosan', year: '2022', travel: 'Ø410 x 650 mm Turning Length', axis: '2-Axis with Live Tooling', qty: 2, condition: 'Excellent' },
      { id: 'M-3', name: 'BFW Agni BMV 45+', type: 'Heavy Duty VMC', make: 'Bharat Fritz Werner (BFW)', year: '2020', travel: '800 x 450 x 500 mm', axis: '3-Axis Rigid Tapping', qty: 1, condition: 'Good' },
      { id: 'M-4', name: 'Amada Ensis 3015 AJ', type: 'Fiber Laser Cutting Machine', make: 'Amada Japan', year: '2023', travel: '3000 x 1500 mm (4 kW Fiber)', axis: 'CNC Laser 2D', qty: 1, condition: 'New' }
    ],

    // Step 4: Manufacturing Operations & Tolerances
    opsTurning: true,
    opsMilling: true,
    opsSheetMetal: true,
    opsWelding: true,
    opsCasting: false,
    opsForging: false,
    opsHeatTreat: false,
    opsSurfaceCoating: true,
    tightestTolerance: '±0.005 mm (5 Microns)',
    surfaceFinishMin: 'Ra 0.4 µm',
    materialsHandled: 'Alloy Steel, Stainless Steel (304/316), Aerospace Aluminum (6061/7075), Titanium, Brass, Inconel',

    // Step 5: Quality System & Inspection Gear
    iso9001: true,
    iatf16949: false,
    as9100d: true,
    hasCmm: true,
    cmmSpecs: 'Zeiss Contura G2 CNC CMM (Travel: 900 x 1200 x 800 mm, Accuracy: 1.8 µm)',
    heightGauge: 'Mitutoyo 2D Linear Height 600mm',
    micrometers: 'Mitutoyo Digimatic Micrometers & Bore Gauges (Calibrated NABL)',
    profileProjector: 'Nikon Profile Projector V-12B',
    faiCapability: 'Full AS9102 First Article Inspection (FAI) & PPAP Level 3 Capability',

    // Step 6: Operating Team & Commercial Terms
    opsHeadName: '',
    opsHeadPhone: '',
    opsHeadEmail: '',
    qcHeadName: '',
    qcHeadPhone: '',
    qcHeadEmail: '',
    prodInchargeName: '',
    prodInchargePhone: '',
    bankName: '',
    bankBranch: '',
    bankAcc: '',
    bankIfsc: '',
    advanceReqPct: '20% Advance against PO',
    creditTermsOffered: 'Balance 30 Days after Quality Inspection Approval',
    decTerms: false,
    decTruth: false
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
      name: 'Apex Precision Aerospace & Heavy Machining Works Pvt Ltd',
      entityType: 'Private Limited Company',
      cin: 'U29253TS2016PTC108924',
      pan: 'AABCA1234F',
      gst: '36AABCA1234F1Z2',
      address: 'Plot 88/B, Phase-II, Cherlapally Industrial Estate, Hyderabad, Telangana 500051',
      country: 'India',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      pincode: '500051',
      udyamNo: 'UDYAM-TS-02-0044819',
      signatoryName: 'V. Rajeshwar Rao',
      signatoryDesig: 'Managing Director',
      signatoryPhone: '+91 98480 11223',
      signatoryEmail: 'md@apexprecision.in',

      factoryAddress: 'Plot 88/B, Phase-II, Cherlapally Industrial Estate, Hyderabad 500051',
      builtUpArea: '22,000 sq ft',
      facilityOwnership: 'Owned',
      workingShifts: '3 Shifts (24 Hours Continuous)',
      installedPower: '350 kVA',
      dgBackup: '250 kVA Silent DG Set',
      monthlyCapacity: '6,000 CNC Machining Hours',
      capacityUtilisation: '72%',
      majorCustomers: 'HAL, DRDO Labs, BDL, Godrej Aerospace, L&T Defense',
      leadTimeAvg: '2 - 3 Weeks',

      machines: [
        { id: 'M-1', name: 'Haas VF-4SS Super Speed', type: 'VMC (Vertical Machining Center)', make: 'Haas Automation USA', year: '2021', travel: '1270 x 508 x 635 mm', axis: '4-Axis (12,000 RPM)', qty: 2, condition: 'Excellent' },
        { id: 'M-2', name: 'Doosan Puma GT2600', type: 'CNC Turning Center', make: 'DN Solutions / Doosan', year: '2022', travel: 'Ø410 x 650 mm Turning Length', axis: '2-Axis with Live Tooling', qty: 2, condition: 'Excellent' },
        { id: 'M-3', name: 'DMG Mori NHX 4000', type: 'HMC (Horizontal Machining Center)', make: 'DMG Mori Germany/Japan', year: '2022', travel: '560 x 560 x 660 mm Pallet Pool', axis: '4-Axis Twin Pallet HMC', qty: 1, condition: 'New' },
        { id: 'M-4', name: 'Mitsubishi MV2400-S', type: 'Wire Cut EDM', make: 'Mitsubishi Electric Japan', year: '2021', travel: '600 x 400 x 310 mm', axis: 'Submerged Wire EDM', qty: 1, condition: 'Excellent' }
      ],

      opsTurning: true,
      opsMilling: true,
      opsSheetMetal: true,
      opsWelding: true,
      opsCasting: false,
      opsForging: false,
      opsHeatTreat: true,
      opsSurfaceCoating: true,
      tightestTolerance: '±0.003 mm (3 Microns)',
      surfaceFinishMin: 'Ra 0.2 µm',
      materialsHandled: 'Alloy Steel (4140, 4340), SS 304/316L, 17-4PH, Inconel 718, Al 6061-T6, Al 7075-T651, Titanium Ti-6Al-4V',

      iso9001: true,
      iatf16949: false,
      as9100d: true,
      hasCmm: true,
      cmmSpecs: 'Zeiss Contura G2 CNC CMM with RDS articulating probe (Accuracy: 1.8 µm)',
      heightGauge: 'Mitutoyo 2D Linear Height 600mm with ceramic calibration master',
      micrometers: 'Mitutoyo Digital Micrometers (0-25, 25-50, 50-75, 75-100mm) calibrated annually',
      profileProjector: 'Nikon V-12B Profile Projector with digital readout',
      faiCapability: 'AS9102 Revision B First Article Inspection Reports & Full Traceability',

      opsHeadName: 'K. Sunder Rajan',
      opsHeadPhone: '+91 98480 33445',
      opsHeadEmail: 'operations@apexprecision.in',
      qcHeadName: 'M. Anand Kumar',
      qcHeadPhone: '+91 98480 55667',
      qcHeadEmail: 'qa@apexprecision.in',
      prodInchargeName: 'T. Vamsi Krishna',
      prodInchargePhone: '+91 98480 77889',
      bankName: 'HDFC Bank Limited',
      bankBranch: 'Cherlapally Industrial Branch, Hyderabad',
      bankAcc: '50200088991122',
      bankIfsc: 'HDFC0001234',
      advanceReqPct: '15% Advance against Raw Material Procurement',
      creditTermsOffered: 'Balance 30 Days after Final ITTOVA QC Dispatch Release',
      decTerms: true,
      decTruth: true
    });

    setAttachedDocs(new Set([
      'Certificate_of_Incorporation.pdf',
      'Factory_License_Director_Factories.pdf',
      'PAN_Card_Apex_Precision.pdf',
      'GST_REG06_Certificate.pdf',
      'Factory_Layout_Process_Flowchart.pdf',
      'Machinery_List_Calibration_Chart.pdf',
      'AS9100D_Aerospace_Certification.pdf',
      'ISO9001_2015_TUV_Certificate.pdf',
      'Zeiss_CMM_Calibration_Certificate.pdf',
      'Audited_Financials_FY24_FY25.pdf',
      'Cancelled_Cheque_HDFC_Bank.pdf',
      'Udyam_Registration_Certificate.pdf'
    ]));

    setStep(6);
    showToast('Loaded benchmark precision manufacturing facility dossier with AS9100 aerospace credentials!');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) return showToast('Please enter Facility / Corporate Name.');
      if (!formData.pan.trim()) return showToast('Please enter Company PAN.');
      if (!formData.gst.trim()) return showToast('Please enter GSTIN registration number.');
      if (!formData.address.trim()) return showToast('Please enter registered office address.');
      if (!formData.state.trim() || !formData.city.trim()) return showToast('Please specify State and City.');
      if (!formData.signatoryName.trim() || !formData.signatoryPhone.trim()) {
        return showToast('Authorised Signatory name & phone are required.');
      }
    }
    if (step === 2) {
      if (!formData.factoryAddress.trim()) return showToast('Please enter Factory / Plant location.');
      if (!formData.monthlyCapacity.trim()) return showToast('Please enter monthly manufacturing capacity.');
    }
    if (step === 3) {
      if (!formData.machines || formData.machines.length === 0) {
        return showToast('Please list at least one CNC machine or production equipment.');
      }
    }
    if (step === 4) {
      if (!formData.tightestTolerance.trim()) return showToast('Please enter tightest tolerance capability.');
    }
    if (step === 5) {
      if (!formData.qcHeadName.trim() && !formData.cmmSpecs.trim()) {
        return showToast('Quality control equipment or Quality In-charge is required.');
      }
    }
    setStep(s => Math.min(s + 1, 6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.decTerms || !formData.decTruth) {
      return showToast('Please accept the declaration of accuracy and platform compliance terms.');
    }

    setSubmitting(true);
    try {
      const vendorPayload = {
        name: formData.name.trim(),
        location: `${formData.city}, ${formData.state}`,
        country: formData.country,
        state: formData.state,
        district: formData.district || formData.city,
        city: formData.city,
        phone: formData.signatoryPhone,
        email: formData.signatoryEmail,
        machines: formData.machines.map(m => ({
          name: m.name,
          process: m.type,
          hourlyRate: 1800,
          rate: 1800,
          details: {
            make: m.make,
            year: m.year,
            travel: m.travel,
            axis: m.axis,
            condition: m.condition
          }
        })),
        entityType: formData.entityType,
        cin: formData.cin,
        pan: formData.pan,
        gst: formData.gst,
        udyamNo: formData.udyamNo,
        builtUpArea: formData.builtUpArea,
        workingShifts: formData.workingShifts,
        installedPower: formData.installedPower,
        monthlyCapacity: formData.monthlyCapacity,
        capacityUtilisation: formData.capacityUtilisation,
        majorCustomers: formData.majorCustomers,
        leadTimeAvg: formData.leadTimeAvg,
        tolerances: formData.tightestTolerance,
        surfaceFinish: formData.surfaceFinishMin,
        materialsHandled: formData.materialsHandled,
        iso9001: formData.iso9001,
        as9100d: formData.as9100d,
        cmmSpecs: formData.cmmSpecs,
        heightGauge: formData.heightGauge,
        profileProjector: formData.profileProjector,
        faiCapability: formData.faiCapability,
        opsHead: { name: formData.opsHeadName, phone: formData.opsHeadPhone, email: formData.opsHeadEmail },
        qcHead: { name: formData.qcHeadName, phone: formData.qcHeadPhone, email: formData.qcHeadEmail },
        prodIncharge: { name: formData.prodInchargeName, phone: formData.prodInchargePhone },
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        bankAcc: formData.bankAcc,
        bankIfsc: formData.bankIfsc,
        attachedDocs: Array.from(attachedDocs),
        status: 'PENDING_AUDIT',
        auditScore: formData.as9100d ? 'AS9100D Certified' : 'ISO 9001:2015'
      };

      const vendorId = await addVendor(vendorPayload);
      if (vendorId && onComplete) {
        onComplete(vendorId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Identity & Legal' },
    { num: 2, label: 'Plant & Capacity' },
    { num: 3, label: 'Machinery Matrix' },
    { num: 4, label: 'Processes & Limits' },
    { num: 5, label: 'Quality & CMM' },
    { num: 6, label: 'Team & Review' }
  ];

  return (
    <div className="card card-accent" style={{ marginBottom: '2rem' }}>
      {/* Header Banner */}
      <div className="flex-between" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37, 99, 171, 0.1)', color: '#1a3a5c', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563ab' }} />
            Vendor Platform Registration
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>
            Manufacturing Facility Onboarding &amp; Capability Audit
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '780px' }}>
            Register your precision machine shop, CNC machines, operational envelope, and quality certifications. Verified facilities receive direct PO releases and supply-chain financing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDemoFill}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>⚡</span> Load Demo Facility Data
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
              background: step === s.num ? 'var(--ink, #102a43)' : (step > s.num ? 'rgba(37, 99, 171, 0.08)' : 'var(--paper, #f8fafc)'),
              color: step === s.num ? '#ffffff' : (step > s.num ? '#1a3a5c' : 'var(--muted, #64748b)'),
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

      {/* Form Steps */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Legal Identity */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              1. Company Identity &amp; Legal Registration Details
            </h3>
            <div className="grid-2">
              <div>
                <label>Facility / Corporate Legal Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Apex Precision Aerospace Works Pvt Ltd"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Legal Entity Constitution</label>
                <select value={formData.entityType} onChange={e => updateField('entityType', e.target.value)}>
                  <option value="Private Limited Company">Private Limited Company (Pvt Ltd)</option>
                  <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                  <option value="Partnership Firm">Partnership Firm</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Public Limited Company">Public Limited Company</option>
                </select>
              </div>
              <div>
                <label>Permanent Account Number (PAN) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. AABCA1234F"
                  value={formData.pan}
                  onChange={e => updateField('pan', e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <label>GST Registration Certificate (GSTIN) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 36AABCA1234F1Z2"
                  value={formData.gst}
                  onChange={e => updateField('gst', e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <label>CIN / LLPIN (Corporate Identity Number)</label>
                <input
                  type="text"
                  placeholder="e.g. U29253TS2016PTC108924"
                  value={formData.cin}
                  onChange={e => updateField('cin', e.target.value)}
                />
              </div>
              <div>
                <label>Udyam / MSME Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. UDYAM-TS-02-0044819"
                  value={formData.udyamNo}
                  onChange={e => updateField('udyamNo', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Registered Office Address <span className="text-danger">*</span></label>
              <textarea
                rows={2}
                placeholder="Complete postal address of registered head office"
                value={formData.address}
                onChange={e => updateField('address', e.target.value)}
                required
              />
            </div>

            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div>
                <label>State <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. Telangana" value={formData.state} onChange={e => updateField('state', e.target.value)} required />
              </div>
              <div>
                <label>City / Industrial Hub <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. Hyderabad" value={formData.city} onChange={e => updateField('city', e.target.value)} required />
              </div>
              <div>
                <label>Postal Pincode</label>
                <input type="text" placeholder="e.g. 500051" value={formData.pincode} onChange={e => updateField('pincode', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Authorised Signatory Details</h4>
              <div className="grid-3">
                <div>
                  <label>Signatory Full Name <span className="text-danger">*</span></label>
                  <input type="text" placeholder="e.g. V. Rajeshwar Rao" value={formData.signatoryName} onChange={e => updateField('signatoryName', e.target.value)} required />
                </div>
                <div>
                  <label>Designation</label>
                  <input type="text" value={formData.signatoryDesig} onChange={e => updateField('signatoryDesig', e.target.value)} />
                </div>
                <div>
                  <label>Official Mobile Number <span className="text-danger">*</span></label>
                  <input type="text" placeholder="+91 98480 11223" value={formData.signatoryPhone} onChange={e => updateField('signatoryPhone', e.target.value)} required />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Plant & Operational Infrastructure */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              2. Factory &amp; Operational Infrastructure
            </h3>
            <div>
              <label>Factory / Plant Physical Address <span className="text-danger">*</span></label>
              <textarea
                rows={2}
                placeholder="Exact manufacturing location for audit team and freight logistics pickup"
                value={formData.factoryAddress}
                onChange={e => updateField('factoryAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div>
                <label>Total Built-Up Area</label>
                <input type="text" placeholder="e.g. 20,000 sq ft" value={formData.builtUpArea} onChange={e => updateField('builtUpArea', e.target.value)} />
              </div>
              <div>
                <label>Facility Ownership</label>
                <select value={formData.facilityOwnership} onChange={e => updateField('facilityOwnership', e.target.value)}>
                  <option value="Owned">Owned Industrial Land &amp; Shed</option>
                  <option value="Leased">Leased Industrial Facility</option>
                  <option value="Rented">Rented Shed</option>
                </select>
              </div>
              <div>
                <label>Operating Shifts</label>
                <select value={formData.workingShifts} onChange={e => updateField('workingShifts', e.target.value)}>
                  <option value="3 Shifts (24 Hours Continuous)">3 Shifts (24 Hours Continuous)</option>
                  <option value="2 Shifts (16 Hours/Day)">2 Shifts (16 Hours/Day)</option>
                  <option value="1 General Shift (8 Hours/Day)">1 General Shift (8 Hours/Day)</option>
                </select>
              </div>
            </div>

            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div>
                <label>Connected Electric Power</label>
                <input type="text" placeholder="e.g. 250 kVA HT Connection" value={formData.installedPower} onChange={e => updateField('installedPower', e.target.value)} />
              </div>
              <div>
                <label>DG Generator Backup</label>
                <input type="text" placeholder="e.g. 160 kVA 100% Backup" value={formData.dgBackup} onChange={e => updateField('dgBackup', e.target.value)} />
              </div>
              <div>
                <label>Average Production Lead Time</label>
                <input type="text" placeholder="e.g. 2 - 3 Weeks" value={formData.leadTimeAvg} onChange={e => updateField('leadTimeAvg', e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div>
                <label>Monthly Machining / Production Capacity</label>
                <input type="text" placeholder="e.g. 5,000 CNC Hours / 50 Tons" value={formData.monthlyCapacity} onChange={e => updateField('monthlyCapacity', e.target.value)} />
              </div>
              <div>
                <label>Current Capacity Utilisation</label>
                <input type="text" placeholder="e.g. 70%" value={formData.capacityUtilisation} onChange={e => updateField('capacityUtilisation', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Major Industries &amp; Customers Served</label>
              <input type="text" placeholder="e.g. Aerospace, Defense, Heavy Earthmoving, Automotive Tier-1" value={formData.majorCustomers} onChange={e => updateField('majorCustomers', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 3: Machinery Portfolio */}
        {step === 3 && (
          <div>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                3. Machinery, CNC Equipment &amp; Working Envelopes
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const newM = {
                    id: `M-${Date.now().toString().slice(-3)}`,
                    name: 'New Machine',
                    type: 'VMC / CNC Turning',
                    make: 'Standard',
                    year: '2022',
                    travel: 'Standard Envelope',
                    axis: '3-Axis',
                    qty: 1,
                    condition: 'Good'
                  };
                  setFormData(prev => ({ ...prev, machines: [...prev.machines, newM] }));
                  showToast('Added machine slot');
                }}
              >
                + Add Another Machine
              </button>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              List your CNC vertical machining centres (VMC), horizontal machining centres (HMC), turning centres, wire EDM, laser cutting, and press brakes:
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.84rem' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Machine Model / Name</th>
                    <th>Process Type</th>
                    <th>Make &amp; Year</th>
                    <th>Working Envelope / Axis</th>
                    <th>Qty</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.machines.map((m, idx) => (
                    <tr key={m.id || idx}>
                      <td style={{ fontWeight: 700 }}>0{idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          value={m.name}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              machines: prev.machines.map((item, i) => i === idx ? { ...item, name: val } : item)
                            }));
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.82rem', width: '100%' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={m.type}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              machines: prev.machines.map((item, i) => i === idx ? { ...item, type: val } : item)
                            }));
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.82rem', width: '100%' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={`${m.make || ''} (${m.year || ''})`}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              machines: prev.machines.map((item, i) => i === idx ? { ...item, make: val } : item)
                            }));
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.82rem', width: '100%' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={`${m.travel || ''} / ${m.axis || ''}`}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              machines: prev.machines.map((item, i) => i === idx ? { ...item, travel: val } : item)
                            }));
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.82rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ width: '60px' }}>
                        <input
                          type="number"
                          value={m.qty || 1}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setFormData(prev => ({
                              ...prev,
                              machines: prev.machines.map((item, i) => i === idx ? { ...item, qty: val } : item)
                            }));
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.82rem', width: '50px' }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-link"
                          style={{ color: 'var(--red)', fontSize: '0.8rem' }}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              machines: prev.machines.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          ✕ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Manufacturing Processes & Tolerances */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              4. Manufacturing Operations &amp; Tolerance Thresholds
            </h3>

            <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>In-House Capabilities (Check all that apply):</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
              {[
                { key: 'opsTurning', label: 'CNC Turning & Lathe Machining' },
                { key: 'opsMilling', label: '3-Axis, 4-Axis & 5-Axis VMC Milling' },
                { key: 'opsSheetMetal', label: 'CNC Laser Cutting & Bending' },
                { key: 'opsWelding', label: 'TIG / MIG / Robotic Welding' },
                { key: 'opsCasting', label: 'Investment / Sand Casting' },
                { key: 'opsForging', label: 'Drop Forging & Heavy Forming' },
                { key: 'opsHeatTreat', label: 'Heat Treatment & Annealing' },
                { key: 'opsSurfaceCoating', label: 'Anodizing, Plating & Powder Coating' }
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

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div>
                <label>Tightest Linear Tolerance Achieved <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. ±0.005 mm (5 Microns)"
                  value={formData.tightestTolerance}
                  onChange={e => updateField('tightestTolerance', e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Best Surface Roughness Capability</label>
                <input
                  type="text"
                  placeholder="e.g. Ra 0.4 µm (Superfinish)"
                  value={formData.surfaceFinishMin}
                  onChange={e => updateField('surfaceFinishMin', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Raw Materials Routinely Processed</label>
              <textarea
                rows={2}
                placeholder="e.g. Alloy Steel, Stainless Steel (304, 316L, 17-4PH), Aluminum 6061-T6, Tool Steel, Inconel"
                value={formData.materialsHandled}
                onChange={e => updateField('materialsHandled', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 5: Quality System & Inspection Gear */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              5. Quality Management System &amp; Metrology Equipment
            </h3>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--paper)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.iso9001} onChange={e => updateField('iso9001', e.target.checked)} />
                <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>ISO 9001:2015 Certified</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--paper)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.as9100d} onChange={e => updateField('as9100d', e.target.checked)} />
                <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>AS9100D (Aerospace Standard)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--paper)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.iatf16949} onChange={e => updateField('iatf16949', e.target.checked)} />
                <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>IATF 16949 (Automotive)</span>
              </label>
            </div>

            <div className="grid-2">
              <div>
                <label>Coordinate Measuring Machine (CMM) Details</label>
                <input
                  type="text"
                  placeholder="e.g. Zeiss Contura CNC CMM (Travel: 900x1200x800mm, Accuracy: 1.8 µm)"
                  value={formData.cmmSpecs}
                  onChange={e => updateField('cmmSpecs', e.target.value)}
                />
              </div>
              <div>
                <label>2D Height Gauges &amp; Masters</label>
                <input
                  type="text"
                  placeholder="e.g. Mitutoyo 2D Linear Height 600mm"
                  value={formData.heightGauge}
                  onChange={e => updateField('heightGauge', e.target.value)}
                />
              </div>
              <div>
                <label>Micrometers, Calipers &amp; Bore Gauges</label>
                <input
                  type="text"
                  placeholder="e.g. Mitutoyo Digital Micrometers (NABL Calibrated)"
                  value={formData.micrometers}
                  onChange={e => updateField('micrometers', e.target.value)}
                />
              </div>
              <div>
                <label>Optical Profile Projector</label>
                <input
                  type="text"
                  placeholder="e.g. Nikon V-12B Profile Projector"
                  value={formData.profileProjector}
                  onChange={e => updateField('profileProjector', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>First Article Inspection (FAI) &amp; Traceability Protocols</label>
              <input
                type="text"
                placeholder="e.g. AS9102 FAI report generation, 100% stage inspection, heat code tracking"
                value={formData.faiCapability}
                onChange={e => updateField('faiCapability', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 6: Operating Team & Review */}
        {step === 6 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              6. Key Operating Team, Settlement Bank &amp; Verification Dossier
            </h3>

            <div className="grid-3">
              <div>
                <label>Head of Operations / Plant Manager</label>
                <input type="text" placeholder="Name" value={formData.opsHeadName} onChange={e => updateField('opsHeadName', e.target.value)} />
                <input type="text" placeholder="Mobile" value={formData.opsHeadPhone} onChange={e => updateField('opsHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label>Head of Quality Assurance (QA/QC)</label>
                <input type="text" placeholder="Name" value={formData.qcHeadName} onChange={e => updateField('qcHeadName', e.target.value)} />
                <input type="text" placeholder="Mobile" value={formData.qcHeadPhone} onChange={e => updateField('qcHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label>Production In-charge (Shift Head)</label>
                <input type="text" placeholder="Name" value={formData.prodInchargeName} onChange={e => updateField('prodInchargeName', e.target.value)} />
                <input type="text" placeholder="Mobile" value={formData.prodInchargePhone} onChange={e => updateField('prodInchargePhone', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Settlement Bank Account (For PO Advance &amp; Progress Disbursements)</h4>
              <div className="grid-2">
                <div>
                  <label>Bank Name</label>
                  <input type="text" placeholder="e.g. HDFC Bank" value={formData.bankName} onChange={e => updateField('bankName', e.target.value)} />
                </div>
                <div>
                  <label>Bank Branch &amp; City</label>
                  <input type="text" placeholder="e.g. Cherlapally Industrial Branch" value={formData.bankBranch} onChange={e => updateField('bankBranch', e.target.value)} />
                </div>
                <div>
                  <label>Account Number</label>
                  <input type="text" placeholder="Account Number" value={formData.bankAcc} onChange={e => updateField('bankAcc', e.target.value)} />
                </div>
                <div>
                  <label>IFSC Code</label>
                  <input type="text" placeholder="e.g. HDFC0001234" value={formData.bankIfsc} onChange={e => updateField('bankIfsc', e.target.value.toUpperCase())} />
                </div>
              </div>
            </div>

            {/* Document Checklist */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Required Verification Documents (Click to Attach):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                {[
                  'Certificate_of_Incorporation.pdf',
                  'Factory_License_Director_Factories.pdf',
                  'PAN_Card_Apex_Precision.pdf',
                  'GST_REG06_Certificate.pdf',
                  'Factory_Layout_Process_Flowchart.pdf',
                  'Machinery_List_Calibration_Chart.pdf',
                  'AS9100D_Aerospace_Certification.pdf',
                  'ISO9001_2015_TUV_Certificate.pdf',
                  'Zeiss_CMM_Calibration_Certificate.pdf',
                  'Audited_Financials_FY24_FY25.pdf',
                  'Cancelled_Cheque_HDFC_Bank.pdf',
                  'Udyam_Registration_Certificate.pdf'
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
                  checked={formData.decTruth}
                  onChange={e => updateField('decTruth', e.target.checked)}
                  required
                />
                <span>We confirm that the machinery portfolio, capacity numbers, metrology equipment, and operational capabilities stated above are accurate and ready for on-site physical audit by the ITTOVA Technical Team.</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.decTerms}
                  onChange={e => updateField('decTerms', e.target.checked)}
                  required
                />
                <span>We agree to the ITTOVA Master Manufacturing Partner Terms, NDA, and Quality Inspection Release protocol for precision engineering components.</span>
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
            {step < 6 ? (
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
                {submitting ? 'Submitting Facility Dossier...' : 'Submit Facility Dossier for Audit &rarr;'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
