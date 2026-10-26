import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function MaterialPartnerWizard({ onComplete, onCancel }) {
  const { showToast, setCurrentUser } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [attachedDocs, setAttachedDocs] = useState(new Set());

  // Form State based on raw_material_trader_manufacturer_registration_details.docx
  const [formData, setFormData] = useState({
    // Step 1: Legal & Business Identity
    companyName: '',
    partnerType: 'Raw Material Stockist & Trader',
    pan: '',
    gst: '',
    cin: '',
    udyamNo: '',
    registeredAddress: '',
    warehouseAddress: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',

    // Step 2: Material Grades & Product Portfolio
    catCarbonSteel: true,
    catAlloySteel: true,
    catStainlessSteel: true,
    catAluminium: true,
    catCopperBrass: false,
    catTitaniumInconel: true,
    catEngineeringPlastics: false,
    formsSupplied: 'Round Bars, Precision Ground Rods, Heavy Plates, Billets, Seamless Pipes, Forged Blocks',
    gradesStocked: 'SS316L, SS304, 17-4PH, AL6061-T6, AL7075-T651, EN24 / 4340, EN19 / 4140, Inconel 718',
    principalMakes: 'Jindal Stainless, SAIL, Hindalco, Bharat Forge, Kalyani Steels, Timken',

    // Step 3: Quality Assurance & MTC Traceability
    mtcBatchGuarantee: true,
    heatBatchNumberMarking: true,
    pmiXrfTestingInhouse: true,
    thirdPartyLabTesting: true,
    standardsCompliant: 'ASTM (A276, A240, B221), AMS (4027, 5643), IS, DIN EN 10204 3.1 & 3.2',

    // Step 4: NABL Laboratory & Metrology Testing Capabilities
    isNablLab: true,
    nablAccreditationNo: 'TC-5812',
    nablValidity: '2027-12-31',
    testingScopeChemical: true,
    testingScopeMechanical: true,
    testingScopeNdt: true,
    spectrometerMake: 'Thermo Fisher ARL 3460 Optical Emission Spectrometer (OES 32 Elements)',
    tensileMachine: 'Instron 600 kN Servo-Hydraulic UTM with extensometer',
    hardnessTesters: 'Rockwell C, Brinell (3000 kgf), Micro Vickers Hardness Tester',
    ndtMethods: 'Ultrasonic Flaw Detector (UT Class A/B), Liquid Penetrant Testing (PT Level II)',

    // Step 5: Stockyard, Logistics & Commercial Terms
    stockyardCapacityTons: '4,500 Metric Tons',
    minimumOrderQty: 'Single Bar / 25 kg minimum',
    averageLeadTime: '24 - 48 Hours Ex-Stock Delivery to Machining Hubs',
    handlingCranes: '2x 15-Ton Overhead EOT Cranes + 5-Ton Forklift fleet',
    directFacilityDelivery: true,
    standardCreditTerms: '30 Days for ITTOVA POs / Advance for High-Nickel Alloys',
    bankName: '',
    bankBranch: '',
    bankAcc: '',
    bankIfsc: '',

    // Step 6: Accountable Team
    salesHeadName: '',
    salesHeadPhone: '',
    salesHeadEmail: '',
    qualityLabHeadName: '',
    qualityLabHeadPhone: '',
    qualityLabHeadEmail: '',
    dispatchHeadName: '',
    dispatchHeadPhone: '',

    decAntiCounterfeit: false,
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
      companyName: 'Apex Metallurgical Labs & Alloy Hub Private Limited',
      partnerType: 'Integrated Stockist & NABL Accredited Testing Lab',
      pan: 'AABCA9876M',
      gst: '36AABCA9876M1Z4',
      cin: 'U27100TG2017PTC118942',
      udyamNo: 'UDYAM-TS-02-0051284',
      registeredAddress: 'Plot 12/A, Industrial Area, Balanagar, Hyderabad, Telangana 500037',
      warehouseAddress: 'Central Stockyard & Testing Facility, Phase-IV, IDA Jeedimetla, Hyderabad 500055',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      pincode: '500055',

      catCarbonSteel: true,
      catAlloySteel: true,
      catStainlessSteel: true,
      catAluminium: true,
      catCopperBrass: true,
      catTitaniumInconel: true,
      catEngineeringPlastics: false,
      formsSupplied: 'Cold Drawn Round Bars, Precision Ground Rods, Plates up to 150mm, Extrusions, Forged Billets',
      gradesStocked: 'SS316L, SS304, 17-4PH Cond. A/H1150, AL6061-T651, AL7075-T651, 4140, 4340, Inconel 718',
      principalMakes: 'Jindal Stainless, SAIL, Hindalco, Bharat Forge, Kalyani Carpenter Special Steels',

      mtcBatchGuarantee: true,
      heatBatchNumberMarking: true,
      pmiXrfTestingInhouse: true,
      thirdPartyLabTesting: true,
      standardsCompliant: 'ASTM A276 / A479, AMS 4027, AMS 5643, DIN EN 10204 3.1 & 3.2 Inspection Certs',

      isNablLab: true,
      nablAccreditationNo: 'TC-5812 (ISO/IEC 17025:2017 Certified)',
      nablValidity: '2028-06-30',
      testingScopeChemical: true,
      testingScopeMechanical: true,
      testingScopeNdt: true,
      spectrometerMake: 'Thermo Scientific ARL iSpark Optical Emission Spectrometer (Spark-OES)',
      tensileMachine: 'Instron 600 kN Computerised Universal Testing Machine with 0.5 class load cell',
      hardnessTesters: 'Wilson Rockwell Hardness Tester (HRC/HRB) + Ernst Micro-Vickers Tester',
      ndtMethods: 'GE Krautkramer USM 36 Ultrasonic Flaw Detector + Magnavis Fluorescent MPI Line',

      stockyardCapacityTons: '6,000 Metric Tons Under Covered Gantry',
      minimumOrderQty: 'Single Billet Piece / 25 kg Cut Bar',
      averageLeadTime: 'Same-Day Dispatch for Hyderabad Hubs; 24h Interstate',
      handlingCranes: '3x 20-Ton Demag Overhead Gantry Cranes + 5-Ton Linde Forklifts',
      directFacilityDelivery: true,
      standardCreditTerms: '30 Days Net on ITTOVA Verified Sourcing Release',
      bankName: 'State Bank of India',
      bankBranch: 'Industrial Finance Branch, Hyderabad',
      bankAcc: '39482710593',
      bankIfsc: 'SBIN0004123',

      salesHeadName: 'G. Venkat Raman',
      salesHeadPhone: '+91 98490 22334',
      salesHeadEmail: 'sales@apexalloys.in',
      qualityLabHeadName: 'Dr. K. S. Murthy (PhD Metallurgy)',
      qualityLabHeadPhone: '+91 98490 44556',
      qualityLabHeadEmail: 'lab@apexalloys.in',
      dispatchHeadName: 'M. Krishna Reddy',
      dispatchHeadPhone: '+91 98490 66778',

      decAntiCounterfeit: true,
      decTerms: true
    });

    setAttachedDocs(new Set([
      'NABL_ISO_IEC_17025_Accreditation_Certificate.pdf',
      'Certificate_of_Incorporation.pdf',
      'Company_PAN_Card.pdf',
      'GST_REG06_Certificate.pdf',
      'Jindal_Stainless_Authorized_Distributor_Certificate.pdf',
      'Hindalco_Primary_Aluminium_Stockist_Letter.pdf',
      'Spectrometer_Calibration_Report_NPL_Traceable.pdf',
      'Sample_Mill_Test_Certificate_EN10204_3_1.pdf',
      'Audited_Financials_FY24_FY25.pdf',
      'Cancelled_Cheque_SBI_Current.pdf'
    ]));

    setStep(6);
    showToast('Loaded benchmark Raw Material Stockist & NABL Accredited Testing Lab dossier!');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.companyName.trim()) return showToast('Please enter Company Legal Name.');
      if (!formData.pan.trim()) return showToast('Please enter PAN number.');
      if (!formData.gst.trim()) return showToast('Please enter GSTIN.');
      if (!formData.state.trim() || !formData.city.trim()) return showToast('Please enter State and City.');
      if (!formData.warehouseAddress.trim()) return showToast('Please enter warehouse/stockyard address.');
    }
    if (step === 2) {
      if (!formData.gradesStocked.trim()) return showToast('Please specify material grades stocked.');
    }
    if (step === 3) {
      if (!formData.standardsCompliant.trim()) return showToast('Please specify quality standards.');
    }
    if (step === 4) {
      if (formData.isNablLab && !formData.nablAccreditationNo.trim()) {
        return showToast('Please enter NABL Accreditation Number (or uncheck NABL lab).');
      }
    }
    if (step === 5) {
      if (!formData.stockyardCapacityTons.trim()) return showToast('Please specify stockyard capacity.');
    }
    setStep(s => Math.min(s + 1, 6));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.decAntiCounterfeit || !formData.decTerms) {
      return showToast('Please confirm the anti-counterfeit declaration and supplier partnership terms.');
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setCurrentUser({
        name: formData.companyName,
        company: formData.companyName,
        role: 'material_partner',
        participantRole: 'Raw Material & Testing Partner',
        id: 'MAT-' + Math.floor(1000 + Math.random() * 9000),
        status: 'ACTIVE'
      });
      showToast(`Material Partner & NABL Lab profile submitted for ${formData.companyName}! Active on platform.`);
      if (onComplete) onComplete();
    }, 600);
  };

  const steps = [
    { num: 1, label: 'Identity & Entity' },
    { num: 2, label: 'Grades & Range' },
    { num: 3, label: 'Quality & MTC' },
    { num: 4, label: 'NABL Metrology' },
    { num: 5, label: 'Logistics & Bank' },
    { num: 6, label: 'Team & Review' }
  ];

  return (
    <div className="card card-accent" style={{ marginBottom: '2rem' }}>
      {/* Header Banner */}
      <div className="flex-between" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(58, 42, 26, 0.1)', color: '#3a2a1a', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
            Raw Material Trader &amp; NABL Lab Registration
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>
            Certified Material Stockist &amp; Metallurgical Testing Console Onboarding
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '780px' }}>
            Register your metal stockyard, authorized dealership distribution, billet supply forms, and NABL-certified metallurgical chemical/mechanical test capabilities for direct allocation to ITTOVA production projects.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDemoFill}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>⚡</span> Load Demo Material Partner Data
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
              background: step === s.num ? 'var(--ink, #102a43)' : (step > s.num ? 'rgba(217, 119, 6, 0.08)' : 'var(--paper, #f8fafc)'),
              color: step === s.num ? '#ffffff' : (step > s.num ? '#b45309' : 'var(--muted, #64748b)'),
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
        {/* Step 1: Legal Identity & Category */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              1. Business Identity, Entity Type &amp; Stockyard Location
            </h3>
            <div className="grid-2">
              <div>
                <label>Company Legal Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Apex Metallurgical Labs & Alloy Hub Pvt Ltd"
                  value={formData.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Partner Business Model</label>
                <select value={formData.partnerType} onChange={e => updateField('partnerType', e.target.value)}>
                  <option value="Raw Material Stockist & Trader">Raw Material Stockist &amp; Trader</option>
                  <option value="Primary Metal Producer / Mill">Primary Metal Producer / Rolling Mill</option>
                  <option value="NABL Accredited Testing Laboratory">NABL Accredited Testing Laboratory</option>
                  <option value="Integrated Stockist & NABL Accredited Testing Lab">Integrated Stockist &amp; NABL Accredited Testing Lab</option>
                </select>
              </div>
              <div>
                <label>Permanent Account Number (PAN) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. AABCA9876M"
                  value={formData.pan}
                  onChange={e => updateField('pan', e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <label>GST Registration Certificate (GSTIN) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 36AABCA9876M1Z4"
                  value={formData.gst}
                  onChange={e => updateField('gst', e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <label>CIN / LLPIN</label>
                <input
                  type="text"
                  placeholder="e.g. U27100TG2017PTC118942"
                  value={formData.cin}
                  onChange={e => updateField('cin', e.target.value)}
                />
              </div>
              <div>
                <label>Udyam / MSME Registration No</label>
                <input
                  type="text"
                  placeholder="e.g. UDYAM-TS-02-0051284"
                  value={formData.udyamNo}
                  onChange={e => updateField('udyamNo', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Central Stockyard / Warehouse / Plant Address <span className="text-danger">*</span></label>
              <textarea
                rows={2}
                placeholder="Exact stockyard address for truck weighment and logistics dispatch"
                value={formData.warehouseAddress}
                onChange={e => updateField('warehouseAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid-3" style={{ marginTop: '1rem' }}>
              <div>
                <label>State <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. Telangana" value={formData.state} onChange={e => updateField('state', e.target.value)} required />
              </div>
              <div>
                <label>City <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. Hyderabad" value={formData.city} onChange={e => updateField('city', e.target.value)} required />
              </div>
              <div>
                <label>Pincode</label>
                <input type="text" placeholder="e.g. 500055" value={formData.pincode} onChange={e => updateField('pincode', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Material Grades & Product Portfolio */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              2. Material Range, Forms &amp; Stocked Grades
            </h3>

            <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Material Categories Stocked / Tested (Check all that apply):</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
              {[
                { key: 'catCarbonSteel', label: 'Carbon Steel (EN8, EN9, Mild Steel)' },
                { key: 'catAlloySteel', label: 'Alloy Steel (EN19/4140, EN24/4340, EN31)' },
                { key: 'catStainlessSteel', label: 'Stainless Steel (304, 316L, 410, 17-4PH)' },
                { key: 'catAluminium', label: 'Aerospace Aluminium (6061-T6, 7075-T651)' },
                { key: 'catCopperBrass', label: 'Copper, Brass & Phosphor Bronze' },
                { key: 'catTitaniumInconel', label: 'Superalloys (Inconel 718, Titanium Gr 5)' },
                { key: 'catEngineeringPlastics', label: 'Engineering Polymers (Delrin, PEEK, PTFE)' }
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

            <div>
              <label>Available Supply Forms <span className="text-danger">*</span></label>
              <input
                type="text"
                placeholder="e.g. Round Bars, Precision Ground Rods, Heavy Plates, Seamless Pipes, Billets, Forgings"
                value={formData.formsSupplied}
                onChange={e => updateField('formsSupplied', e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Primary Material Grades Stocked <span className="text-danger">*</span></label>
              <textarea
                rows={2}
                placeholder="e.g. SS316L, SS304, 17-4PH, AL6061-T6, AL7075, EN24, EN19, Inconel 718"
                value={formData.gradesStocked}
                onChange={e => updateField('gradesStocked', e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Principal Manufacturers &amp; Primary Mills Represented</label>
              <input
                type="text"
                placeholder="e.g. Jindal Stainless, SAIL, Hindalco, Bharat Forge, Kalyani Steels, Timken"
                value={formData.principalMakes}
                onChange={e => updateField('principalMakes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Quality Assurance & MTC */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              3. Quality Assurance, Heat Traceability &amp; Mill Test Certification
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--paper)', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.mtcBatchGuarantee} onChange={e => updateField('mtcBatchGuarantee', e.target.checked)} />
                <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>EN 10204 3.1 / 3.2 Mill Test Certificate (MTC) Guarantee with Every Heat Lot</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--paper)', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.heatBatchNumberMarking} onChange={e => updateField('heatBatchNumberMarking', e.target.checked)} />
                <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Heat Number, Batch &amp; Grade Laser / Hard Stamping on Raw Billets &amp; Bars</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--paper)', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.pmiXrfTestingInhouse} onChange={e => updateField('pmiXrfTestingInhouse', e.target.checked)} />
                <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Handheld XRF / PMI (Positive Material Identification) Gun for Inward Verification</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--paper)', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.thirdPartyLabTesting} onChange={e => updateField('thirdPartyLabTesting', e.target.checked)} />
                <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Routine Third-Party Verification Audits with NABL Accredited Labs</span>
              </label>
            </div>

            <div>
              <label>Standard Manufacturing &amp; Testing Specifications Complied With <span className="text-danger">*</span></label>
              <input
                type="text"
                placeholder="e.g. ASTM (A276, A240, B221), AMS (4027, 5643), IS Standards, DIN EN 10204 3.1"
                value={formData.standardsCompliant}
                onChange={e => updateField('standardsCompliant', e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Step 4: NABL Laboratory Capabilities */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              4. In-House Metallurgical Testing &amp; NABL Accreditation
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--paper)', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)', cursor: 'pointer', marginBottom: '1.25rem' }}>
              <input type="checkbox" checked={formData.isNablLab} onChange={e => updateField('isNablLab', e.target.checked)} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>We operate an in-house or certified NABL Accredited Metallurgical Testing Facility</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Accredited under ISO/IEC 17025 for chemical, mechanical, and non-destructive testing of metals.</div>
              </div>
            </label>

            {formData.isNablLab && (
              <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '1.25rem' }}>
                <div className="grid-2">
                  <div>
                    <label>NABL Certificate / Accreditation Number <span className="text-danger">*</span></label>
                    <input type="text" placeholder="e.g. TC-5812" value={formData.nablAccreditationNo} onChange={e => updateField('nablAccreditationNo', e.target.value)} />
                  </div>
                  <div>
                    <label>Accreditation Validity Date</label>
                    <input type="date" value={formData.nablValidity} onChange={e => updateField('nablValidity', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700 }}>
                    <input type="checkbox" checked={formData.testingScopeChemical} onChange={e => updateField('testingScopeChemical', e.target.checked)} />
                    Chemical Testing (Spectro / OES)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700 }}>
                    <input type="checkbox" checked={formData.testingScopeMechanical} onChange={e => updateField('testingScopeMechanical', e.target.checked)} />
                    Mechanical Testing (Tensile, Hardness, Impact)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700 }}>
                    <input type="checkbox" checked={formData.testingScopeNdt} onChange={e => updateField('testingScopeNdt', e.target.checked)} />
                    NDT (Ultrasonic, Dye Penetrant, MPI)
                  </label>
                </div>
              </div>
            )}

            <div className="grid-2">
              <div>
                <label>Optical Emission Spectrometer (OES / Chemical Analysis)</label>
                <input type="text" placeholder="e.g. Thermo Scientific ARL Spark Spectrometer" value={formData.spectrometerMake} onChange={e => updateField('spectrometerMake', e.target.value)} />
              </div>
              <div>
                <label>Universal Testing Machine (UTM / Tensile Pull Test)</label>
                <input type="text" placeholder="e.g. Instron 600 kN Servo-Hydraulic UTM" value={formData.tensileMachine} onChange={e => updateField('tensileMachine', e.target.value)} />
              </div>
              <div>
                <label>Hardness Testing Equipment</label>
                <input type="text" placeholder="e.g. Rockwell HRC / Brinell 3000 kgf / Micro Vickers" value={formData.hardnessTesters} onChange={e => updateField('hardnessTesters', e.target.value)} />
              </div>
              <div>
                <label>Non-Destructive Testing (NDT) Apparatus</label>
                <input type="text" placeholder="e.g. Ultrasonic Flaw Detector Class A + Dye Penetrant" value={formData.ndtMethods} onChange={e => updateField('ndtMethods', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Logistics & Commercials */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              5. Stockyard Capacity, Material Handling, Logistics &amp; Banking
            </h3>

            <div className="grid-3">
              <div>
                <label>Total Stockyard Storage Capacity <span className="text-danger">*</span></label>
                <input type="text" placeholder="e.g. 5,000 Metric Tons" value={formData.stockyardCapacityTons} onChange={e => updateField('stockyardCapacityTons', e.target.value)} required />
              </div>
              <div>
                <label>Minimum Order Quantity (MOQ)</label>
                <input type="text" placeholder="e.g. Single Billet / 25 kg" value={formData.minimumOrderQty} onChange={e => updateField('minimumOrderQty', e.target.value)} />
              </div>
              <div>
                <label>Average Delivery Lead Time</label>
                <input type="text" placeholder="e.g. Same-Day or 24-48 Hours" value={formData.averageLeadTime} onChange={e => updateField('averageLeadTime', e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div>
                <label>In-House Handling Cranes &amp; Equipment</label>
                <input type="text" placeholder="e.g. 2x 15-Ton Overhead EOT Cranes, 5-Ton Forklift" value={formData.handlingCranes} onChange={e => updateField('handlingCranes', e.target.value)} />
              </div>
              <div>
                <label>Standard Commercial Payment Terms</label>
                <input type="text" placeholder="e.g. 30 Days Net on Verified PO Release" value={formData.standardCreditTerms} onChange={e => updateField('standardCreditTerms', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Settlement Bank Details (For PO Invoices &amp; Escrow Releases)</h4>
              <div className="grid-2">
                <div>
                  <label>Bank Name</label>
                  <input type="text" placeholder="e.g. State Bank of India" value={formData.bankName} onChange={e => updateField('bankName', e.target.value)} />
                </div>
                <div>
                  <label>Branch Name &amp; City</label>
                  <input type="text" placeholder="Branch Name" value={formData.bankBranch} onChange={e => updateField('bankBranch', e.target.value)} />
                </div>
                <div>
                  <label>Account Number</label>
                  <input type="text" placeholder="Account Number" value={formData.bankAcc} onChange={e => updateField('bankAcc', e.target.value)} />
                </div>
                <div>
                  <label>IFSC Code</label>
                  <input type="text" placeholder="e.g. SBIN0004123" value={formData.bankIfsc} onChange={e => updateField('bankIfsc', e.target.value.toUpperCase())} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Team & Review */}
        {step === 6 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--ink)' }}>
              6. Key Operating Personnel &amp; Verification Dossier Submission
            </h3>

            <div className="grid-3">
              <div>
                <label>Commercial / Sales Head</label>
                <input type="text" placeholder="Name" value={formData.salesHeadName} onChange={e => updateField('salesHeadName', e.target.value)} />
                <input type="text" placeholder="Phone" value={formData.salesHeadPhone} onChange={e => updateField('salesHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
                <input type="email" placeholder="Official Email" value={formData.salesHeadEmail} onChange={e => updateField('salesHeadEmail', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label>Quality &amp; Lab Head (NABL signatory)</label>
                <input type="text" placeholder="Name" value={formData.qualityLabHeadName} onChange={e => updateField('qualityLabHeadName', e.target.value)} />
                <input type="text" placeholder="Phone" value={formData.qualityLabHeadPhone} onChange={e => updateField('qualityLabHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
                <input type="email" placeholder="Official Email" value={formData.qualityLabHeadEmail} onChange={e => updateField('qualityLabHeadEmail', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label>Warehouse &amp; Dispatch In-Charge</label>
                <input type="text" placeholder="Name" value={formData.dispatchHeadName} onChange={e => updateField('dispatchHeadName', e.target.value)} />
                <input type="text" placeholder="Phone" value={formData.dispatchHeadPhone} onChange={e => updateField('dispatchHeadPhone', e.target.value)} style={{ marginTop: '6px' }} />
              </div>
            </div>

            {/* Document Checklist */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Required Verification Documents (Click to Attach):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                {[
                  'NABL_ISO_IEC_17025_Accreditation_Certificate.pdf',
                  'Certificate_of_Incorporation.pdf',
                  'Company_PAN_Card.pdf',
                  'GST_REG06_Certificate.pdf',
                  'Jindal_Stainless_Authorized_Distributor_Certificate.pdf',
                  'Hindalco_Primary_Aluminium_Stockist_Letter.pdf',
                  'Spectrometer_Calibration_Report_NPL_Traceable.pdf',
                  'Sample_Mill_Test_Certificate_EN10204_3_1.pdf',
                  'Audited_Financials_FY24_FY25.pdf',
                  'Cancelled_Cheque_SBI_Current.pdf'
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
                  checked={formData.decAntiCounterfeit}
                  onChange={e => updateField('decAntiCounterfeit', e.target.checked)}
                  required
                />
                <span>We strictly undertake that all raw materials, billets, bars, and plates delivered to ITTOVA-contracted facilities shall be 100% prime material with genuine Mill Test Certificates (MTC) and verifiable heat-lot traceability, with zero tolerance for counterfeit or non-conforming scrap.</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.decTerms}
                  onChange={e => updateField('decTerms', e.target.checked)}
                  required
                />
                <span>We agree to the ITTOVA Master Raw Material Partner Agreement and NABL Metallurgical Lab Protocols.</span>
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
                {submitting ? 'Submitting Material Partner Dossier...' : 'Complete Material Partner Onboarding &rarr;'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
