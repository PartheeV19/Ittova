import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CustomerWizard from './CustomerWizard';
import LiveStepper from '../../components/LiveStepper';

export default function CustomerPortal() {
  const { 
    db, 
    selectedCustomerId, 
    setSelectedCustomerId, 
    submitDrawings, 
    updateProjectScope, 
    confirmScopes, 
    confirmCustomerVendorQuotes, 
    approveCustomerDelivery, 
    payCustomerFinal, 
    setCadModal,
    showToast 
  } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50);
  const [quoteSelections, setQuoteSelections] = useState({});

  const activeCustomer = db.customers.find(c => c.id === selectedCustomerId);
  const myProjects = db.projects.filter(p => p.cust === selectedCustomerId).reverse();

  const handleDrawingSubmit = () => {
    if (!activeCustomer) return;
    submitDrawings(activeCustomer.id, searchRadius);
  };

  const handleQuoteSelect = (dIdx, pIdx, vid) => {
    setQuoteSelections(prev => ({
      ...prev,
      [`${dIdx}_${pIdx}`]: vid
    }));
  };

  const handleConfirmQuotes = (pid, drawings) => {
    let allSelected = true;
    drawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
      const key = `${dIdx}_${pIdx}`;
      if (!quoteSelections[key] && !proc.selectedVendor) {
        allSelected = false;
      }
    }));

    if (!allSelected) {
      alert('Please select a supplier quote for every process stage!');
      return;
    }
    confirmCustomerVendorQuotes(pid, quoteSelections);
  };

  return (
    <div className="view">
      {/* Customer Identity Banner */}
      <div className="card">
        <div className="portal-header">
          <div>
            <div className="portal-header-label">Corporate Customer Portal</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px' }}>
              {activeCustomer ? activeCustomer.name : 'Corporate Onboarding & KYC Registration'}
            </div>
            {activeCustomer && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Account: <strong>{activeCustomer.id}</strong> &bull; CIN: {activeCustomer.cin || 'N/A'} &bull; GSTIN: {activeCustomer.gst || 'N/A'}
              </div>
            )}
          </div>
          <div className="flex-gap">
            {activeCustomer ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${activeCustomer.status === 'APPROVED' ? 'approved' : 'pending'}`}>
                  {activeCustomer.status === 'APPROVED' ? 'Verified Account' : 'KYC Audit Pending'}
                </span>
                <span className="badge badge-tier">
                  {activeCustomer.creditTier || activeCustomer.reqCreditTier || 'Advance Tier'}
                </span>
              </div>
            ) : (
              <span className="badge badge-pending">Registration Pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Registration Wizard */}
      {(!activeCustomer || isRegistering) && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <CustomerWizard 
            onComplete={(cid) => {
              setIsRegistering(false);
              setSelectedCustomerId(cid);
            }} 
            onCancel={() => setIsRegistering(false)} 
          />
        </div>
      )}

      {/* Pending Account Notice */}
      {activeCustomer && activeCustomer.status !== 'APPROVED' && !isRegistering && (
        <div className="card">
          <div className="alert alert-warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Onboarding &amp; KYC Audit in Progress</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                Your corporate KYC dossier and credit underwriting request for <strong>{activeCustomer.reqCreditTier}</strong> (Limit: {activeCustomer.reqCreditLimit}) is currently being reviewed by the ITTOVA Customer Audit team. You will be able to release CAD drawings as soon as account activation is authorized.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Approved Customer Dashboard */}
      {activeCustomer && activeCustomer.status === 'APPROVED' && !isRegistering && (
        <div>
          {/* Release Engineering Drawings */}
          <div className="card">
            <div className="kicker">Drawing Release &amp; Quoting</div>
            <h2 style={{ marginBottom: '0.3rem' }}>Release Engineering Drawings</h2>
            <p className="subtitle">
              Upload a minimum of two drawings (PDF or 3D CAD format) together with a Bill of Materials spreadsheet.
              The AI Quoting Engine extracts process stages and routes them for human validation.
            </p>

            <div className="grid-2" style={{ marginTop: 'var(--sp-5)' }}>
              <div 
                className="file-upload-mock uploaded"
                onClick={() => showToast('Drawings attached: DWG-A101.pdf, DWG-B202.pdf')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                2 Engineering Drawings Attached &mdash; DWG-A101.pdf, DWG-B202.pdf
              </div>
              <div 
                className="file-upload-mock uploaded"
                onClick={() => showToast('BOM attached: Master_BOM.xlsx')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                Bill of Materials Attached &mdash; Master_BOM.xlsx
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: 'var(--sp-5)' }}>
              <div>
                <label>Supplier Matching Search Radius (km)</label>
                <input 
                  type="number" 
                  value={searchRadius} 
                  onChange={e => setSearchRadius(Number(e.target.value))} 
                  style={{ width: '180px' }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn w-full" onClick={handleDrawingSubmit}>
                  Analyze with AI &amp; Submit to Process Validator
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Project Tracker */}
          <div className="view-section-title">
            <h3>Active Project Tracker &amp; Execution Matrix</h3>
          </div>

          {myProjects.length === 0 ? (
            <div className="card">
              <p className="subtitle">No engineering projects submitted yet. Use the card above to upload drawings.</p>
            </div>
          ) : (
            myProjects.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="flex-between">
                  <div>
                    <div className="kicker">Engineering Sourcing Order</div>
                    <h3 style={{ margin: '0.2rem 0' }}>Project: {p.id}</h3>
                    <p className="subtitle" style={{ margin: 0 }}>Drawings: {p.files} &bull; BOM: {p.bom}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-pending">{p.status.replace(/_/g, ' ')}</span>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ display: 'block', marginTop: '6px', marginLeft: 'auto' }}
                      onClick={() => setCadModal({ pid: p.id })}
                    >
                      Inspect 3D CAD
                    </button>
                  </div>
                </div>

                {/* Live Stepper */}
                <LiveStepper status={p.status} />

                {/* Stage Action: Customer Scope Confirmation */}
                {p.status === 'CUSTOMER_SCOPE_PENDING' && (
                  <div className="inner-panel" style={{ marginTop: 'var(--sp-5)', border: '1.5px solid var(--accent-border)' }}>
                    <div className="flex-between">
                      <div>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '0.2rem' }}>Process Scope Selection Required</h4>
                        <p className="subtitle" style={{ margin: 0 }}>Specify whether raw material, manufacturing, and finishing are Vendor Supplied or In-House Customer supplied.</p>
                      </div>
                    </div>

                    <div className="table-responsive" style={{ marginTop: 'var(--sp-4)' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Drawing #</th>
                            <th>Process Stage</th>
                            <th>Raw Material</th>
                            <th>Manufacturing</th>
                            <th>Surface Finishing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.drawings.map((d, dIdx) => d.processes.map((proc, pIdx) => (
                            <tr key={`${dIdx}_${pIdx}`}>
                              <td><strong>{d.dwgNo}</strong></td>
                              <td><span className="badge badge-process">Stage {proc.stageId}: {proc.name}</span></td>
                              <td>
                                <select 
                                  value={proc.rawScope} 
                                  disabled={pIdx > 0}
                                  onChange={e => updateProjectScope(p.id, dIdx, pIdx, 'rawScope', e.target.value)}
                                >
                                  <option value="Vendor">Vendor Supplied</option>
                                  <option value="In-House">In-House Customer</option>
                                </select>
                              </td>
                              <td>
                                <select 
                                  value={proc.mfgScope} 
                                  onChange={e => updateProjectScope(p.id, dIdx, pIdx, 'mfgScope', e.target.value)}
                                >
                                  <option value="Vendor">Vendor Supplied</option>
                                  <option value="In-House">In-House Customer</option>
                                </select>
                              </td>
                              <td>
                                <select 
                                  value={proc.finScope} 
                                  onChange={e => updateProjectScope(p.id, dIdx, pIdx, 'finScope', e.target.value)}
                                >
                                  <option value="Vendor">Vendor Supplied</option>
                                  <option value="In-House">In-House Customer</option>
                                </select>
                              </td>
                            </tr>
                          )))}
                        </tbody>
                      </table>
                    </div>

                    <button 
                      className="btn btn-success" 
                      style={{ marginTop: 'var(--sp-4)' }}
                      onClick={() => confirmScopes(p.id)}
                    >
                      Confirm Scopes &amp; Request Verified Quotes
                    </button>
                  </div>
                )}

                {/* Stage Action: Customer Final Quote Selection */}
                {p.status === 'CUSTOMER_FINAL_SELECTION' && (
                  <div className="inner-panel" style={{ marginTop: 'var(--sp-5)', border: '1.5px solid var(--accent-border)' }}>
                    <h4 style={{ color: 'var(--accent)', marginBottom: '0.2rem' }}>Verified Supplier Quotes Matrix</h4>
                    <p className="subtitle" style={{ margin: 0 }}>Select supplier bids per manufacturing stage. Pricing reflects audited vendor quotes with 5% platform fee included.</p>

                    <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                      {p.drawings.map((d, dIdx) => d.processes.map((proc, pIdx) => (
                        <div key={`${dIdx}_${pIdx}`} className="inner-panel" style={{ background: 'var(--bg)' }}>
                          <div className="flex-between">
                            <strong>{d.dwgNo} &mdash; Stage {proc.stageId}: {proc.name}</strong>
                            <span className="badge badge-process">{proc.quotes.length} Quotes Audited</span>
                          </div>
                          <select 
                            style={{ marginTop: '0.4rem' }}
                            value={quoteSelections[`${dIdx}_${pIdx}`] || proc.selectedVendor || ''}
                            onChange={e => handleQuoteSelect(dIdx, pIdx, e.target.value)}
                          >
                            <option value="">Select Supplier Bid...</option>
                            {proc.quotes.map(q => (
                              <option key={q.vid} value={q.vid}>
                                {q.vid} &mdash; ₹{Math.round(q.cost * 1.05).toLocaleString('en-IN')} ({q.time} Days Delivery)
                              </option>
                            ))}
                          </select>
                        </div>
                      )))}
                    </div>

                    <button 
                      className="btn btn-success" 
                      style={{ marginTop: 'var(--sp-4)' }}
                      onClick={() => handleConfirmQuotes(p.id, p.drawings)}
                    >
                      Authorize Supplier Selections &amp; Release PO
                    </button>
                  </div>
                )}

                {/* Stage Action: Quality Passed / Delivery Approval */}
                {p.status === 'PENDING_CUST_DELIVERY_APPROVAL' && (
                  <div style={{ marginTop: 'var(--sp-5)' }}>
                    <div className="alert alert-success">
                      <div>
                        <strong>QA Inspection Conformance Certified!</strong>
                        <div>Dimensional CMM and hardness specs match engineering drawings. Confirm unloading facility below.</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-success"
                      onClick={() => approveCustomerDelivery(p.id, activeCustomer.deliveryAddress)}
                    >
                      Approve Delivery Address &amp; Request Logistics Freight Invoice
                    </button>
                  </div>
                )}

                {/* Stage Action: Final Invoice Payment */}
                {p.status === 'PENDING_CUST_PAYMENT' && (
                  <div style={{ marginTop: 'var(--sp-5)' }}>
                    <div className="alert alert-warn">
                      <div>
                        <strong>Final Commercial Invoice Ready</strong>
                        <div>Freight, Transit Insurance &amp; Handling: ₹{p.logisticsFee || 4500}. Account Terms: {activeCustomer.creditTier}.</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-success"
                      onClick={() => payCustomerFinal(p.id)}
                    >
                      Pay / Clear Invoice (Trade Credit Authorization)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
