import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MaterialPartnerWizard from './MaterialPartnerWizard';

export default function MaterialPartnerPortal() {
  const { currentUser, db, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('requisitions'); // 'requisitions' | 'inventory' | 'lab' | 'mtr_archive'
  const [allocatedMaterials, setAllocatedMaterials] = useState({
    'PRJ-1001': {
      heatNo: 'HEAT-SS316-9821A',
      grade: 'SS316L (ASTM A276)',
      size: 'Ø65mm Round Bar x 300mm',
      mtrRef: 'MTR-2026-APEX-4102',
      status: 'DISPATCHED_TO_FACILITY',
      dispatchedAt: '2026-10-24T10:00:00.000Z'
    }
  });

  const [allocatingPrj, setAllocatingPrj] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [allocForm, setAllocForm] = useState({
    grade: 'AL6061-T6 (AMS 4027)',
    heatNo: 'HEAT-AL6061-4192',
    size: '120mm x 80mm x 250mm Billet',
    mtrRef: `MTR-2026-NABL-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [labTests, setLabTests] = useState([
    {
      id: 'TEST-891',
      projectRef: 'PRJ-1002',
      sample: 'Inconel 718 Billet Cut Sample',
      testType: 'Spectro Chemical Analysis + Tensile Pull Test',
      lab: 'Apex NABL Accredited Metallurgical Lab (TC-5812)',
      result: 'PENDING',
      submittedAt: 'Today, 09:30 IST'
    },
    {
      id: 'TEST-890',
      projectRef: 'PRJ-1001',
      sample: 'SS316L Bar Slice',
      testType: 'PMI XRF + Ultrasonic Flaw Test (UT Class A)',
      lab: 'Apex NABL Accredited Metallurgical Lab (TC-5812)',
      result: 'PASSED (0 Defects, Cr: 17.2%, Ni: 12.1%, Mo: 2.3%)',
      submittedAt: 'Yesterday, 14:15 IST'
    }
  ]);

  const partnerName = currentUser?.name || 'Apex Metallurgical Labs & Alloy Hub';
  const partnerOrg = currentUser?.company || 'Jindal & Apex Industrial Materials Consortium';

  const relevantProjects = db.projects || [];
  const activePrjs = relevantProjects.filter(p => 
    ['PENDING_SCOPE_CONFIRMATION', 'PENDING_PO_ACCEPTANCE', 'IN_PRODUCTION'].includes(p.status)
  );

  const handleConfirmAllocation = (e) => {
    e.preventDefault();
    if (!allocatingPrj) return;
    setAllocatedMaterials(prev => ({
      ...prev,
      [allocatingPrj.id]: {
        ...allocForm,
        status: 'DISPATCHED_TO_FACILITY',
        dispatchedAt: new Date().toISOString()
      }
    }));
    showToast(`Material lot ${allocForm.heatNo} allocated to ${allocatingPrj.id} with MTR ${allocForm.mtrRef}`);
    setAllocatingPrj(null);
  };

  const handlePassLabTest = (testId) => {
    setLabTests(prev => prev.map(t => t.id === testId ? {
      ...t,
      result: 'PASSED (Tensile: 980 MPa, Yield: 760 MPa, Hardness: 34 HRC)',
      certifiedAt: new Date().toISOString()
    } : t));
    showToast(`Lab test ${testId} certified and released to project.`);
  };

  return (
    <div className="view">
      {/* Identity Banner */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="portal-header">
          <div>
            <div className="portal-header-label">Raw Material Stockist &amp; NABL Testing Console</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
              {partnerOrg}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Materials Director: <strong>{partnerName}</strong> &bull; NABL ISO/IEC 17025 Certified Testing Hub
            </div>
          </div>
          <div className="flex-gap" style={{ alignItems: 'center' }}>
            <span className="badge badge-approved" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              MTR 3.1 Certified Stock
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              AS9100D Aerospace Certified
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsRegistering(v => !v)}
              style={{ fontSize: '0.82rem' }}
            >
              {isRegistering ? 'View Active Workspace' : '+ Register Material Stockist & NABL Lab'}
            </button>
          </div>
        </div>
      </div>

      {isRegistering && (
        <MaterialPartnerWizard
          onComplete={() => setIsRegistering(false)}
          onCancel={() => setIsRegistering(false)}
        />
      )}

      {/* KPI Metrics */}
      <div className="grid-4" style={{ gap: '16px', marginBottom: 'var(--sp-4)' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Certified Alloy Stock Available
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
            1,480 Metric Tons
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>
            SS316L, AL6061-T6, Inconel 718, EN24
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active MTR Certificates
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
            214 Heat Lots
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Traceable to Primary Melt Origin
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ca8a04' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Material Requisitions
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ca8a04', marginTop: '4px' }}>
            {activePrjs.length} Open Orders
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting Billet Slicing &amp; Dispatch
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #9333ea' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            NABL Lab Testing Queue
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9333ea', marginTop: '4px' }}>
            {labTests.filter(t => t.result === 'PENDING').length} Pending Tests
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Spectro, UT &amp; Tensile Verification
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="role-tabs-bar" style={{ marginBottom: 'var(--sp-4)' }} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'requisitions'}
          className={`role-tab-btn ${activeTab === 'requisitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('requisitions')}
        >
          1. Project Billet Requisitions ({activePrjs.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'inventory'}
          className={`role-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          2. Certified Alloy Stock &amp; Heat Registry
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'lab'}
          className={`role-tab-btn ${activeTab === 'lab' ? 'active' : ''}`}
          onClick={() => setActiveTab('lab')}
        >
          3. NABL Testing Laboratory Desk ({labTests.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'mtr_archive'}
          className={`role-tab-btn ${activeTab === 'mtr_archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('mtr_archive')}
        >
          4. Mill Test Report (MTR 3.1) Archive
        </button>
      </div>

      {/* ── TAB 1: PROJECT BILLET REQUISITIONS ───────────────────────── */}
      {activeTab === 'requisitions' && (
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Precision Alloy Requisitions for Machining</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Allocate certified billets, bars, or forged blanks to active vendor machine shops with complete heat number traceability.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>PROJECT &amp; PART</th>
                  <th style={{ padding: '10px 12px' }}>REQUIRED ALLOY</th>
                  <th style={{ padding: '10px 12px' }}>QTY &amp; SIZE</th>
                  <th style={{ padding: '10px 12px' }}>DESTINATION MACHINE SHOP</th>
                  <th style={{ padding: '10px 12px' }}>HEAT &amp; MTR REF</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {activePrjs.map(project => {
                  const alloc = allocatedMaterials[project.id];
                  const isAllocated = Boolean(alloc);

                  return (
                    <tr key={project.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: 'var(--text-heading)' }}>{project.id}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.name || project.partName || 'Turbine Housing Core'}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        {project.material || 'SS316L Stainless Steel'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                        {project.quantity || 10} pieces &bull; Cut Billet
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>{project.selectedVendorName || 'Apex CNC Milling Shop'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Facility Gate Delivery</div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.82rem' }}>
                        {isAllocated ? (
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{alloc.heatNo}</span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{alloc.mtrRef}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Awaiting Heat Allocation</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isAllocated ? (
                          <span className="badge badge-approved">DISPATCHED TO SHOP</span>
                        ) : (
                          <span className="badge badge-warning">STOCK ALLOCATION PENDING</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {isAllocated ? (
                          <button type="button" className="btn btn-sm btn-outline" disabled>
                            Dispatched
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => setAllocatingPrj(project)}
                          >
                            Allocate Stock &rarr;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Allocation Modal / Drawer */}
          {allocatingPrj && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div className="flex-between">
                <h4 style={{ margin: 0 }}>Allocate Certified Stock for {allocatingPrj.id}</h4>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setAllocatingPrj(null)}>Close</button>
              </div>

              <form onSubmit={handleConfirmAllocation} style={{ marginTop: '12px' }}>
                <div className="grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Alloy Grade Specification</label>
                    <input
                      type="text"
                      value={allocForm.grade}
                      onChange={e => setAllocForm({ ...allocForm, grade: e.target.value })}
                      required
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Heat / Melt Number</label>
                    <input
                      type="text"
                      value={allocForm.heatNo}
                      onChange={e => setAllocForm({ ...allocForm, heatNo: e.target.value })}
                      required
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Cut Billet / Bar Dimensions</label>
                    <input
                      type="text"
                      value={allocForm.size}
                      onChange={e => setAllocForm({ ...allocForm, size: e.target.value })}
                      required
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>MTR 3.1 Certificate Ref</label>
                    <input
                      type="text"
                      value={allocForm.mtrRef}
                      onChange={e => setAllocForm({ ...allocForm, mtrRef: e.target.value })}
                      required
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div className="flex-gap" style={{ marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary">
                    Issue MTR &amp; Dispatch to Machine Shop
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setAllocatingPrj(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CERTIFIED ALLOY STOCK & HEAT REGISTRY ───────────── */}
      {activeTab === 'inventory' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Warehouse Raw Stock &amp; Melt Chemistry Registry</h3>
          <p style={{ margin: '4px 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            High-integrity inventory with full elemental spectrometry verification (Cr, Ni, Mo, Ti, Al, C) and ultrasonic porosity scans.
          </p>

          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>GRADE &amp; FORM</th>
                <th style={{ padding: '10px 12px' }}>HEAT / LOT NO</th>
                <th style={{ padding: '10px 12px' }}>MELT ORIGIN</th>
                <th style={{ padding: '10px 12px' }}>CHEMISTRY (SPECTRO)</th>
                <th style={{ padding: '10px 12px' }}>HARDNESS / YIELD</th>
                <th style={{ padding: '10px 12px' }}>AVAILABLE</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  <strong>SS316L / 1.4404</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Forged Round Bar Ø80mm</div>
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>HEAT-SS316-9821A</td>
                <td style={{ padding: '12px' }}>Jindal Stainless Ltd (Hisar)</td>
                <td style={{ padding: '12px', fontSize: '0.78rem' }}>Cr: 17.4%, Ni: 12.2%, Mo: 2.35%, C: 0.022%</td>
                <td style={{ padding: '12px', fontSize: '0.8rem' }}>215 HRB &bull; Yield: 310 MPa</td>
                <td style={{ padding: '12px', fontWeight: 700, color: '#16a34a' }}>32.4 Tons</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  <strong>AL6061-T6</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Plate 50mm Thickness (QQ-A-250/11)</div>
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>HEAT-AL6061-4192</td>
                <td style={{ padding: '12px' }}>Hindalco Industries</td>
                <td style={{ padding: '12px', fontSize: '0.78rem' }}>Mg: 0.95%, Si: 0.62%, Cu: 0.28%, Fe: 0.35%</td>
                <td style={{ padding: '12px', fontSize: '0.8rem' }}>95 HRB &bull; Yield: 276 MPa</td>
                <td style={{ padding: '12px', fontWeight: 700, color: '#16a34a' }}>48.0 Tons</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  <strong>Inconel 718 (AMS 5662)</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vacuum Induction Melted Bar Ø45mm</div>
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>HEAT-INCO-718-091</td>
                <td style={{ padding: '12px' }}>Mishra Dhatu Nigam (MIDHANI)</td>
                <td style={{ padding: '12px', fontSize: '0.78rem' }}>Ni: 52.8%, Cr: 19.1%, Nb+Ta: 5.15%, Mo: 3.05%</td>
                <td style={{ padding: '12px', fontSize: '0.8rem' }}>36 HRC &bull; Yield: 1,110 MPa</td>
                <td style={{ padding: '12px', fontWeight: 700, color: '#16a34a' }}>8.6 Tons</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: NABL TESTING LAB ─────────────────────────────────── */}
      {activeTab === 'lab' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>NABL Metallurgical Laboratory Test Requisitions</h3>
          <p style={{ margin: '4px 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mechanical pull testing, optical emission spectrometry, and non-destructive examination (NDE) per ISO 17025.
          </p>

          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>TEST ID</th>
                <th style={{ padding: '10px 12px' }}>PROJECT REF</th>
                <th style={{ padding: '10px 12px' }}>SAMPLE SPECIMEN</th>
                <th style={{ padding: '10px 12px' }}>TEST PROTOCOL</th>
                <th style={{ padding: '10px 12px' }}>LAB STATUS / RESULT</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map(test => (
                <tr key={test.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700 }}>{test.id}</td>
                  <td style={{ padding: '12px' }}><strong>{test.projectRef}</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{test.sample}</td>
                  <td style={{ padding: '12px', fontSize: '0.82rem' }}>{test.testType}</td>
                  <td style={{ padding: '12px' }}>
                    {test.result === 'PENDING' ? (
                      <span className="badge badge-warning">TEST IN PROGRESS</span>
                    ) : (
                      <span className="badge badge-approved">{test.result}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {test.result === 'PENDING' ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => handlePassLabTest(test.id)}
                      >
                        Certify &amp; Pass
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-outline" disabled>
                        Certified
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 4: MTR ARCHIVE ─────────────────────────────────────── */}
      {activeTab === 'mtr_archive' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>EN 10204 Type 3.1 Mill Test Report Archive</h3>
          <p style={{ margin: '4px 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Digitally signed inspection certificates available for aerospace, railway, and defense audit scrutiny.
          </p>

          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>CERTIFICATE REF</th>
                <th style={{ padding: '10px 12px' }}>HEAT NUMBER</th>
                <th style={{ padding: '10px 12px' }}>ALLOY GRADE</th>
                <th style={{ padding: '10px 12px' }}>MELT FACILITY</th>
                <th style={{ padding: '10px 12px' }}>COMPLIANCE STANDARD</th>
                <th style={{ padding: '10px 12px' }}>DOWNLOAD</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>MTR-2026-APEX-4102</td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>HEAT-SS316-9821A</td>
                <td style={{ padding: '12px' }}>SS316L Stainless Steel</td>
                <td style={{ padding: '12px' }}>Jindal Stainless Hisar</td>
                <td style={{ padding: '12px' }}><span className="badge badge-approved">EN 10204 3.1 / ASTM A276</span></td>
                <td style={{ padding: '12px' }}>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => showToast('MTR Certificate downloaded')}>
                    Download PDF
                  </button>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>MTR-2026-HIND-8812</td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>HEAT-AL6061-4192</td>
                <td style={{ padding: '12px' }}>AL6061-T6 Aluminum</td>
                <td style={{ padding: '12px' }}>Hindalco Renukoot</td>
                <td style={{ padding: '12px' }}><span className="badge badge-approved">AMS 4027 / QQ-A-250/11</span></td>
                <td style={{ padding: '12px' }}>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => showToast('MTR Certificate downloaded')}>
                    Download PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
