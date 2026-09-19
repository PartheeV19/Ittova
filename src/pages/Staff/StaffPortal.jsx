import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function StaffPortal() {
  const { 
    db,
    currentUser,
    approveCustomer, 
    approveVendor, 
    assignPV, 
    approvePVSpecs, 
    assignVV, 
    approveVVAIRouting, 
    approveQuotesWithFee, 
    authorizePORelease, 
    acceptLogisticsPickup, 
    receiveMaterialWarehouse, 
    assignInspector, 
    submitQCReport, 
    requestFreightFee, 
    dispatchToCustomer, 
    setCadModal,
    showToast 
  } = useApp();

  // The staff member is always the logged-in user — no switcher
  const activeStaff = db.staff.find(s => s.id === currentUser?.id);

  // Form states for audits
  const [caTiers, setCaTiers] = useState({});
  const [caLimits, setCaLimits] = useState({});
  const [auditScores, setAuditScores] = useState({});
  const [freightFees, setFreightFees] = useState({});

  if (!activeStaff) {
    return (
      <div className="view">
        <div className="card">
          <p className="subtitle">Staff account not found. Please sign out and log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      {/* Staff identity banner */}
      <div className="card">
        <div className="portal-header">
          <div>
            <div className="portal-header-label">Internal Staff Command Console</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px' }}>
              {activeStaff.name}
            </div>
          </div>
          <div className="flex-gap">
            <span className="badge badge-process">{activeStaff.role.replace(/_/g, ' ')}</span>
            <span className="badge badge-approved">Active Session</span>
          </div>
        </div>
      </div>

      {/* 1. CUSTOMER AUDIT */}
      {activeStaff.role === 'CUSTOMER_AUDIT' && (
        <div>
          <div className="view-section-title">
            <h3>Customer Compliance Registrations &amp; Credit Underwriting</h3>
          </div>

          {db.customers.filter(c => c.status === 'PENDING').length === 0 ? (
            <div className="card">
              <p className="subtitle">No corporate customer onboarding applications currently pending audit.</p>
            </div>
          ) : (
            db.customers.filter(c => c.status === 'PENDING').map(c => (
              <div key={c.id} className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="flex-between">
                  <div>
                    <div className="kicker">{c.entityType || 'Corporate Entity'} &bull; CIN: {c.cin || 'N/A'}</div>
                    <h3 style={{ margin: '0.2rem 0' }}>{c.name}</h3>
                  </div>
                  <span className="badge badge-pending">KYC &amp; Credit Pending</span>
                </div>

                <div className="grid-3" style={{ margin: '1rem 0', gap: 'var(--sp-4)' }}>
                  <div className="inner-panel">
                    <h5 style={{ color: 'var(--accent)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Statutory &amp; Identity</h5>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>GSTIN:</strong> {c.gst || 'N/A'}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>PAN:</strong> {c.pan || 'N/A'}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Signatory:</strong> {c.signatoryName || 'Authorized Signatory'} ({c.signatoryDesig || 'Director'})</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Phone:</strong> {c.signatoryPhone || c.phone}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Reg. Address:</strong> {c.address}</p>
                  </div>

                  <div className="inner-panel">
                    <h5 style={{ color: 'var(--accent)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Operations &amp; Banking</h5>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Works:</strong> {c.factoryAddress || c.address}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Sector:</strong> {c.sector || 'Industrial Engineering'}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Products:</strong> {c.product || 'Sub-Assemblies'}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Bank:</strong> {c.bankName || 'State Bank of India'} &bull; {c.bankBranch || 'Hyderabad'}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>A/c No:</strong> {c.bankAcc || '••••••••'} (IFSC: {c.bankIfsc || 'N/A'})</p>
                  </div>

                  <div className="inner-panel">
                    <h5 style={{ color: 'var(--accent)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Commercial &amp; Compliance</h5>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Requested Tier:</strong> <span className="badge badge-tier">{c.reqCreditTier || '15 to 30 Day Credit'}</span></p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Requested Limit:</strong> <strong>{c.reqCreditLimit || '₹ 25,00,000'}</strong></p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>MSME Category:</strong> {c.msmeType || 'Medium Enterprise'}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>Udyam Reg:</strong> {c.udyamNo || 'N/A'}</p>
                    <p style={{ fontSize: '0.8rem', margin: '2px 0' }}><strong>M-NDA Executed:</strong> <span className="text-success">&check; Certified</span></p>
                  </div>
                </div>

                <div style={{ margin: '0.75rem 0' }}>
                  <strong style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Verified Attached Documents:</strong>
                  <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {c.attachedDocs?.map(d => (
                      <span key={d} className="badge badge-approved">&check; {d}</span>
                    )) || <span className="badge badge-approved">&check; Standard KYC Dossier</span>}
                  </div>
                </div>

                <div className="inner-panel" style={{ marginTop: '1rem', border: '1.5px dashed var(--border-mid)', background: 'var(--bg-subtle)' }}>
                  <h5 style={{ marginBottom: '0.5rem' }}>Audit Assessment &amp; Credit Sanction</h5>
                  <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <label>Approved Credit Tier</label>
                      <select 
                        value={caTiers[c.id] || c.reqCreditTier || '15 to 30 Day Credit'}
                        onChange={e => setCaTiers({ ...caTiers, [c.id]: e.target.value })}
                      >
                        <option value="Cash / Advance">Cash / Advance Tier</option>
                        <option value="15 to 30 Day Credit">15 to 30 Day Credit</option>
                        <option value="45 to 90 Day Credit">45 to 90 Day Credit</option>
                        <option value="Strategic Partner">Strategic Enterprise Tier</option>
                      </select>
                    </div>
                    <div>
                      <label>Sanctioned Credit Limit (₹)</label>
                      <input 
                        type="text" 
                        value={caLimits[c.id] !== undefined ? caLimits[c.id] : (c.reqCreditLimit || '₹ 25,00,000')}
                        onChange={e => setCaLimits({ ...caLimits, [c.id]: e.target.value })}
                        placeholder="Approved Credit Limit" 
                      />
                    </div>
                  </div>
                  <div 
                    className="file-upload-mock uploaded" 
                    onClick={() => showToast('KYC Audit Report re-verified.')}
                  >
                    Verified_Legal_KYC_Audit_Report.pdf (Signed &amp; Approved by Customer Audit)
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <button 
                    className="btn btn-success"
                    onClick={() => approveCustomer(
                      c.id, 
                      caTiers[c.id] || c.reqCreditTier || '15 to 30 Day Credit', 
                      caLimits[c.id] || c.reqCreditLimit || '₹ 25,00,000'
                    )}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Approve Entity &amp; Activate Sourcing Account
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. VENDOR AUDIT */}
      {activeStaff?.role === 'VENDOR_AUDIT' && (
        <div>
          <div className="view-section-title">
            <h3>Supplier Facility Audits &amp; Capability Rating</h3>
          </div>

          {db.vendors.filter(v => v.status === 'PENDING').length === 0 ? (
            <div className="card">
              <p className="subtitle">No supplier facility onboarding applications currently pending audit.</p>
            </div>
          ) : (
            db.vendors.filter(v => v.status === 'PENDING').map(v => (
              <div key={v.id} className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="flex-between">
                  <div>
                    <h3 style={{ margin: '0.2rem 0' }}>{v.name}</h3>
                    <p className="subtitle" style={{ margin: 0 }}>Location: {v.location} &bull; Phone: {v.phone}</p>
                  </div>
                  <span className="badge badge-pending">Facility Audit Pending</span>
                </div>

                <div className="grid-2" style={{ margin: '1rem 0' }}>
                  {v.machines?.map((m, idx) => (
                    <div key={m.id || idx} className="inner-panel">
                      <strong>{m.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.process} &bull; {m.size}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>₹{m.rate}/hr &bull; {m.materials}</div>
                    </div>
                  ))}
                </div>

                <div className="inner-panel" style={{ background: 'var(--bg-subtle)' }}>
                  <label>Audited Quality Score &amp; ISO Certification</label>
                  <input 
                    type="text" 
                    value={auditScores[v.id] || '96/100 (ISO 9001:2015 Physical Audit)'}
                    onChange={e => setAuditScores({ ...auditScores, [v.id]: e.target.value })}
                  />
                </div>

                <button 
                  className="btn btn-success" 
                  style={{ marginTop: '1rem' }}
                  onClick={() => approveVendor(v.id, auditScores[v.id])}
                >
                  Authorize Facility &amp; Activate Machines
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. PROCESS VALIDATOR */}
      {activeStaff?.role === 'PROCESS_VALIDATOR' && (
        <div>
          <div className="view-section-title">
            <h3>AI Drawing Spec Verification &amp; Process Decomposition</h3>
          </div>

          {/* Unassigned */}
          <div className="card">
            <h4>1. Unassigned AI Drawing Extractions</h4>
            {db.projects.filter(p => p.status === 'AI_EXTRACTED_PENDING_VAL').length === 0 ? (
              <p className="subtitle">No unassigned drawing extraction tasks in queue.</p>
            ) : (
              db.projects.filter(p => p.status === 'AI_EXTRACTED_PENDING_VAL').map(p => (
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.5rem' }}>
                  <div>
                    <strong>Project {p.id}</strong> &bull; Customer: {p.cust} &bull; Files: {p.files}
                  </div>
                  <button className="btn btn-sm" onClick={() => assignPV(p.id, activeStaff.id)}>
                    Assign to Me
                  </button>
                </div>
              ))
            )}
          </div>

          {/* My Assigned */}
          <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
            <h4>2. My In-Review Validations</h4>
            {db.projects.filter(p => p.status === 'PROCESS_VAL_ASSIGNED' && p.assignedProcVal === activeStaff.id).length === 0 ? (
              <p className="subtitle">You have no drawings currently assigned for validation.</p>
            ) : (
              db.projects.filter(p => p.status === 'PROCESS_VAL_ASSIGNED' && p.assignedProcVal === activeStaff.id).map(p => (
                <div key={p.id} className="inner-panel" style={{ marginTop: 'var(--sp-4)' }}>
                  <div className="flex-between">
                    <div>
                      <strong>Project {p.id} &mdash; CAD Drawing Decomposition</strong>
                      <p className="subtitle" style={{ margin: 0 }}>Customer: {p.cust} &bull; BOM: {p.bom}</p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCadModal({ pid: p.id })}>
                      Inspect 3D CAD
                    </button>
                  </div>

                  <div className="table-responsive" style={{ margin: '1rem 0' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Drawing #</th>
                          <th>Material Specs</th>
                          <th>Qty</th>
                          <th>Decomposed Stages</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.drawings.map((d, dIdx) => (
                          <tr key={dIdx}>
                            <td><strong>{d.dwgNo}</strong></td>
                            <td>{d.material}</td>
                            <td>{d.qty} pcs</td>
                            <td>{d.processes.map(proc => proc.name).join(' ➔ ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button className="btn btn-success" onClick={() => approvePVSpecs(p.id)}>
                    Confirm Process Stages &amp; Route to Customer for Scoping
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. VENDOR VALIDATOR */}
      {activeStaff?.role === 'VENDOR_VALIDATOR' && (
        <div>
          <div className="view-section-title">
            <h3>Supplier Matching, Margin Audits &amp; PO Release</h3>
          </div>

          {/* Step 1: Match Verification */}
          <div className="card">
            <h4>1. Supplier Machine Match Verification</h4>
            {db.projects.filter(p => ['AI_VENDOR_SEARCH_PENDING', 'VEND_VAL_AI_ASSIGNED'].includes(p.status)).length === 0 ? (
              <p className="subtitle">No AI vendor routing tasks in queue.</p>
            ) : (
              db.projects.filter(p => ['AI_VENDOR_SEARCH_PENDING', 'VEND_VAL_AI_ASSIGNED'].includes(p.status)).map(p => (
                <div key={p.id} className="inner-panel" style={{ marginTop: '0.75rem' }}>
                  <div className="flex-between">
                    <strong>Project {p.id} Matching</strong>
                    {p.status === 'AI_VENDOR_SEARCH_PENDING' ? (
                      <button className="btn btn-sm" onClick={() => assignVV(p.id, activeStaff.id, 'VEND_VAL_AI_ASSIGNED')}>
                        Assign to Me
                      </button>
                    ) : (
                      <button className="btn btn-success btn-sm" onClick={() => approveVVAIRouting(p.id)}>
                        Authorize RFQ Dispatch to Suppliers
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Step 2: Bids Audit */}
          <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
            <h4>2. Supplier Quotes Audit (+5% Platform Fee)</h4>
            {db.projects.filter(p => ['PENDING_VENDOR_QUOTES', 'VEND_VAL_QUOTES_ASSIGNED'].includes(p.status)).length === 0 ? (
              <p className="subtitle">No quotes currently in audit queue.</p>
            ) : (
              db.projects.filter(p => ['PENDING_VENDOR_QUOTES', 'VEND_VAL_QUOTES_ASSIGNED'].includes(p.status)).map(p => (
                <div key={p.id} className="inner-panel" style={{ marginTop: '0.75rem' }}>
                  <div className="flex-between">
                    <div>
                      <strong>Project {p.id} &mdash; Supplier Bids Received</strong>
                      <p className="subtitle" style={{ margin: 0 }}>Apply standard 5% platform margin before release to customer.</p>
                    </div>
                    {p.status === 'PENDING_VENDOR_QUOTES' ? (
                      <button className="btn btn-sm" onClick={() => assignVV(p.id, activeStaff.id, 'VEND_VAL_QUOTES_ASSIGNED')}>
                        Assign to Me
                      </button>
                    ) : (
                      <button className="btn btn-success btn-sm" onClick={() => approveQuotesWithFee(p.id)}>
                        Approve Quotes &amp; Release to Customer
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Step 3: PO Authorization */}
          <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
            <h4>3. Final PO Release Authorization</h4>
            {db.projects.filter(p => ['CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED'].includes(p.status)).length === 0 ? (
              <p className="subtitle">No PO releases waiting for authorization.</p>
            ) : (
              db.projects.filter(p => ['CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED'].includes(p.status)).map(p => (
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.75rem' }}>
                  <div>
                    <strong>Project {p.id} &mdash; Customer Confirmed Suppliers</strong>
                  </div>
                  {p.status === 'CUST_SELECTED_VEND_PENDING' ? (
                    <button className="btn btn-sm" onClick={() => assignVV(p.id, activeStaff.id, 'VEND_VAL_PO_ASSIGNED')}>
                      Assign to Me
                    </button>
                  ) : (
                    <button className="btn btn-success btn-sm" onClick={() => authorizePORelease(p.id)}>
                      Authorize PO Dispatch to Suppliers
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. LOGISTICS */}
      {activeStaff?.role === 'LOGISTICS' && (
        <div>
          <div className="view-section-title">
            <h3>Logistics, Fleet Dispatch &amp; Warehouse Transit</h3>
          </div>

          <div className="card">
            <h4>1. Supplier Pickup Coordination</h4>
            {db.projects.filter(p => p.status === 'DISPATCH_REQUESTED').length === 0 ? (
              <p className="subtitle">No orders pending supplier pickup.</p>
            ) : (
              db.projects.filter(p => p.status === 'DISPATCH_REQUESTED').map(p => (
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.5rem' }}>
                  <div><strong>Project {p.id}</strong> &mdash; Production Finished. Pickup Ready.</div>
                  <button className="btn btn-success btn-sm" onClick={() => acceptLogisticsPickup(p.id)}>
                    Accept Pickup &amp; Dispatch Fleet
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
            <h4>2. Central Warehouse Intake</h4>
            {db.projects.filter(p => p.status === 'LOGISTICS_ACCEPTED').length === 0 ? (
              <p className="subtitle">No shipments currently in transit to warehouse.</p>
            ) : (
              db.projects.filter(p => p.status === 'LOGISTICS_ACCEPTED').map(p => (
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.5rem' }}>
                  <div><strong>Project {p.id}</strong> &mdash; Shipment in transit.</div>
                  <button className="btn btn-success btn-sm" onClick={() => receiveMaterialWarehouse(p.id)}>
                    Acknowledge Material Intake at ITTOX Warehouse
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
            <h4>3. Freight &amp; Delivery Invoicing</h4>
            {db.projects.filter(p => p.status === 'PENDING_LOGISTICS_FEE').length === 0 ? (
              <p className="subtitle">No orders pending freight calculation.</p>
            ) : (
              db.projects.filter(p => p.status === 'PENDING_LOGISTICS_FEE').map(p => (
                <div key={p.id} className="inner-panel" style={{ marginTop: '0.5rem' }}>
                  <div className="flex-between">
                    <div>
                      <strong>Project {p.id} &mdash; Customer Delivery Address</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.custDeliveryAddress || 'Hyderabad Industrial Area'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={freightFees[p.id] || 4500} 
                        onChange={e => setFreightFees({ ...freightFees, [p.id]: Number(e.target.value) })}
                        style={{ width: '120px' }}
                      />
                      <button className="btn btn-success btn-sm" onClick={() => requestFreightFee(p.id, freightFees[p.id] || 4500)}>
                        Issue Final Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
            <h4>4. Last-Mile Dispatch to Customer</h4>
            {db.projects.filter(p => p.status === 'PAYMENT_COMPLETED_PENDING_DISPATCH').length === 0 ? (
              <p className="subtitle">No orders pending final dispatch.</p>
            ) : (
              db.projects.filter(p => p.status === 'PAYMENT_COMPLETED_PENDING_DISPATCH').map(p => (
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.5rem' }}>
                  <div><strong>Project {p.id}</strong> &mdash; Payment cleared. Ready for delivery.</div>
                  <button className="btn btn-success btn-sm" onClick={() => dispatchToCustomer(p.id)}>
                    Dispatch to Customer Facility
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. INSPECTOR */}
      {activeStaff?.role === 'INSPECTOR' && (
        <div>
          <div className="view-section-title">
            <h3>Inward Quality Control, CMM &amp; ISO Conformance</h3>
          </div>

          <div className="card">
            <h4>1. Unassigned Inward Parts</h4>
            {db.projects.filter(p => p.status === 'PENDING_INSPECTION').length === 0 ? (
              <p className="subtitle">No parts waiting in inspection intake.</p>
            ) : (
              db.projects.filter(p => p.status === 'PENDING_INSPECTION').map(p => (
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.5rem' }}>
                  <div><strong>Project {p.id}</strong> &mdash; Arrived at warehouse from supplier.</div>
                  <button className="btn btn-sm" onClick={() => assignInspector(p.id, activeStaff.id)}>
                    Assign to Me
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ marginTop: 'var(--sp-6)' }}>
            <h4>2. My In-Progress CMM Inspections</h4>
            {db.projects.filter(p => p.status === 'INSPECTOR_ASSIGNED' && p.assignedInspector === activeStaff.id).length === 0 ? (
              <p className="subtitle">No active inspections assigned to you.</p>
            ) : (
              db.projects.filter(p => p.status === 'INSPECTOR_ASSIGNED' && p.assignedInspector === activeStaff.id).map(p => (
                <div key={p.id} className="inner-panel" style={{ marginTop: '0.5rem' }}>
                  <div className="flex-between">
                    <div>
                      <strong>Project {p.id} CMM Dimensional Verification</strong>
                      <p className="subtitle" style={{ margin: 0 }}>Drawings: {p.files}</p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCadModal({ pid: p.id })}>
                      Check CAD Specs
                    </button>
                  </div>
                  <div className="alert alert-info" style={{ margin: '0.75rem 0' }}>
                    Dimensional tolerances verified on calibrated CMM. Drawing conformance passed. Inspection report attached.
                  </div>
                  <button className="btn btn-success" onClick={() => submitQCReport(p.id)}>
                    Approve QC Conformance Report &amp; Authorize Delivery Release
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
