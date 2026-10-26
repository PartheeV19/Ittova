import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function FinancePartnerPortal() {
  const { currentUser, db, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('factoring'); // 'factoring' | 'escrow' | 'credit_lines' | 'audit'
  const [sanctionedRequests, setSanctionedRequests] = useState({
    'PRJ-1002': { status: 'SANCTIONED', amount: 180000, reference: 'FIN-SANC-9021', apr: 10.5, tenor: '60 Days' }
  });
  const [selectedFactorReq, setSelectedFactorReq] = useState(null);
  const [sanctionNotes, setSanctionNotes] = useState('');

  // Sample partner details fallback if currentUser has generic fields
  const partnerName = currentUser?.name || 'HDFC Industrial Capital & NBFC Consortium';
  const partnerOrg = currentUser?.company || 'Precision Manufacturing Liquidity Syndicate';

  // Find projects that have POs released or in production suitable for invoice discounting / factoring
  const relevantProjects = db.projects || [];
  const factoringEligible = relevantProjects.filter(p => 
    ['IN_PRODUCTION', 'INSPECTION_PENDING', 'DISPATCHED', 'COMPLETED', 'PENDING_CUST_PAYMENT'].includes(p.status)
  );

  const handleApproveFactoring = (projectId, requestedAmt) => {
    const ref = `SANC-${Math.floor(100000 + Math.random() * 900000)}`;
    setSanctionedRequests(prev => ({
      ...prev,
      [projectId]: {
        status: 'SANCTIONED',
        amount: requestedAmt,
        reference: ref,
        apr: 9.75,
        tenor: '45 Days',
        approvedAt: new Date().toISOString()
      }
    }));
    showToast(`Working Capital Factoring approved for ${projectId}. Reference: ${ref}`);
    setSelectedFactorReq(null);
  };

  const handleDisburseFactoring = (projectId) => {
    const utr = `UTR-FIN-${Date.now().toString().slice(-8)}`;
    setSanctionedRequests(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        status: 'DISBURSED',
        disbursedAt: new Date().toISOString(),
        disbursementUtr: utr
      }
    }));
    showToast(`Funds disbursed via RTGS for ${projectId}. UTR: ${utr}`);
  };

  return (
    <div className="view">
      {/* Identity Banner */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="portal-header">
          <div>
            <div className="portal-header-label">Financier &amp; NBFC Liquidity Hub</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
              {partnerOrg}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Lead Officer: <strong>{partnerName}</strong> &bull; RBI Regulated Industrial NBFC Category-A
            </div>
          </div>
          <div className="flex-gap" style={{ alignItems: 'center' }}>
            <span className="badge badge-approved" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Institutional Escrow Active
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              AA+ Credit Line
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid-4" style={{ gap: '16px', marginBottom: 'var(--sp-4)' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Sanction Pool Available
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
            &#8377; 25,00,00,000
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
            &#8377;25.0 Cr Dedicated Industrial Line
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active Disbursed Capital
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            &#8377; 14,82,50,000
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across 38 Verified Vendor Work Orders
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ca8a04' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Pending Factoring Requests
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ca8a04', marginTop: '4px' }}>
            {factoringEligible.length} Active Orders
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Eligible for Upfront 80% LTV
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0d9488' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Institutional Escrow Balance
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d9488', marginTop: '4px' }}>
            &#8377; 4,65,20,000
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Held for Quality Signoff Release
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="role-tabs-bar" style={{ marginBottom: 'var(--sp-4)' }} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'factoring'}
          className={`role-tab-btn ${activeTab === 'factoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('factoring')}
        >
          1. Invoice Factoring &amp; PO Discounting ({factoringEligible.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'escrow'}
          className={`role-tab-btn ${activeTab === 'escrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('escrow')}
        >
          2. Live Project Escrow Accounts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'credit_lines'}
          className={`role-tab-btn ${activeTab === 'credit_lines' ? 'active' : ''}`}
          onClick={() => setActiveTab('credit_lines')}
        >
          3. Pre-Approved Supplier Credit Limits
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'audit'}
          className={`role-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          4. Recovery &amp; Settlement Audit Log
        </button>
      </div>

      {/* ── TAB 1: INVOICE FACTORING ─────────────────────────────────── */}
      {activeTab === 'factoring' && (
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Work Order Factoring &amp; Early Payout Desk</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fund audited MSME machine shops with immediate liquidity (up to 80% of confirmed ITTOVA purchase order value) backed by OEM corporate payment guarantee.
              </p>
            </div>
            <span className="badge badge-info">Zero Recourse / OEM Backed</span>
          </div>

          {factoringEligible.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
              No production work orders currently awaiting early factoring disbursement.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>PROJECT &amp; PART</th>
                    <th style={{ padding: '10px 12px' }}>BUYER / OEM</th>
                    <th style={{ padding: '10px 12px' }}>SUPPLIER FACILITY</th>
                    <th style={{ padding: '10px 12px' }}>CONFIRMED PO VALUE</th>
                    <th style={{ padding: '10px 12px' }}>MAX 80% LTV ADVANCE</th>
                    <th style={{ padding: '10px 12px' }}>FINANCE STATUS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {factoringEligible.map(project => {
                    const sanction = sanctionedRequests[project.id];
                    const poTotal = (project.targetBudget || 250000) * (project.quantity || 1);
                    const ltvAdvance = Math.round(poTotal * 0.8);
                    const isSanctioned = sanction?.status === 'SANCTIONED';
                    const isDisbursed = sanction?.status === 'DISBURSED';

                    return (
                      <tr key={project.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: 'var(--text-heading)' }}>{project.id}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.name || project.partName || 'Precision Machined Assembly'}</div>
                          <span className="badge badge-process" style={{ fontSize: '0.7rem', marginTop: '4px' }}>{project.status}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div>{project.customerName || 'Aerospace OEM Buyer'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN: 27AABCT3518Q1ZG</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div>{project.selectedVendorName || 'Apex Precision Engineering Works'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Rating: Grade A (94%)</div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-heading)' }}>
                          &#8377; {poTotal.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#16a34a' }}>
                          &#8377; {ltvAdvance.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {isDisbursed ? (
                            <div>
                              <span className="badge badge-approved">DISBURSED</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sanction.disbursementUtr}</div>
                            </div>
                          ) : isSanctioned ? (
                            <div>
                              <span className="badge badge-info">SANCTIONED</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: {sanction.reference}</div>
                            </div>
                          ) : (
                            <span className="badge badge-warning">AWAITING SANCTION</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {isDisbursed ? (
                            <button type="button" className="btn btn-sm btn-outline" disabled>
                              Disbursed
                            </button>
                          ) : isSanctioned ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => handleDisburseFactoring(project.id)}
                            >
                              Disburse RTGS
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-dark"
                              onClick={() => setSelectedFactorReq({ project, poTotal, ltvAdvance })}
                            >
                              Sanction 80% LTV
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal / Sanction Approval Drawer */}
          {selectedFactorReq && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div className="flex-between">
                <h4 style={{ margin: 0 }}>Sanction Factoring for {selectedFactorReq.project.id}</h4>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setSelectedFactorReq(null)}>Close</button>
              </div>
              <div className="grid-3" style={{ gap: '12px', margin: '14px 0' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed PO Amount</span>
                  <div style={{ fontWeight: 700 }}>&#8377; {selectedFactorReq.poTotal.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sanction Limit (80%)</span>
                  <div style={{ fontWeight: 700, color: '#16a34a' }}>&#8377; {selectedFactorReq.ltvAdvance.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Factoring APR &amp; Tenor</span>
                  <div style={{ fontWeight: 700 }}>9.75% p.a. &bull; 45 Days</div>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Credit Officer Underwriting Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Validated against ITTOVA tripartite escrow and audited supplier machining logs."
                  value={sanctionNotes}
                  onChange={e => setSanctionNotes(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
              <div className="flex-gap">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleApproveFactoring(selectedFactorReq.project.id, selectedFactorReq.ltvAdvance)}
                >
                  Confirm &amp; Issue Sanction Letter
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedFactorReq(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: LIVE PROJECT ESCROW ACCOUNTS ─────────────────────── */}
      {activeTab === 'escrow' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Tripartite Escrow Vault Balances</h3>
          <p style={{ margin: '4px 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Funds securely maintained in RBI-monitored nodal escrow accounts. Disbursed strictly upon ITTOVA Quality Inspector stage validation.
          </p>

          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>ESCROW ID</th>
                <th style={{ padding: '10px 12px' }}>PROJECT REF</th>
                <th style={{ padding: '10px 12px' }}>OEM DEPOSITOR</th>
                <th style={{ padding: '10px 12px' }}>BENEFICIARY FACILITY</th>
                <th style={{ padding: '10px 12px' }}>ESCROW AMOUNT</th>
                <th style={{ padding: '10px 12px' }}>RELEASE MILESTONE</th>
                <th style={{ padding: '10px 12px' }}>HOLD STATUS</th>
              </tr>
            </thead>
            <tbody>
              {relevantProjects.slice(0, 5).map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>
                    ESC-2026-00{idx + 1}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <strong>{p.id}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.name || 'Component Assembly'}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{p.customerName || 'Bharat Dynamics OEM'}</td>
                  <td style={{ padding: '12px' }}>{p.selectedVendorName || 'Precision CNC Machinists'}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#0d9488' }}>
                    &#8377; {((p.targetBudget || 200000) * (p.quantity || 1)).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.82rem' }}>
                    {p.status === 'COMPLETED' ? 'Dispatched & Accepted' : 'Inward Quality Gate (IGI) Clearance'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {p.status === 'COMPLETED' ? (
                      <span className="badge badge-approved">RELEASED</span>
                    ) : (
                      <span className="badge badge-info">HELD IN ESCROW</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: PRE-APPROVED CREDIT LIMITS ──────────────────────── */}
      {activeTab === 'credit_lines' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Supplier Working Capital Limits (Approved Master Lines)</h3>
          <p style={{ margin: '4px 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Risk-assessed credit limits tied to machine fleet capital valuation, ISO 9001/AS9100 quality credentials, and historical on-time delivery rate.
          </p>

          <div className="grid-3" style={{ gap: '16px' }}>
            {(db.vendors || []).slice(0, 6).map(v => (
              <div key={v.id} className="card" style={{ padding: '16px', background: 'var(--bg-subtle, #fbfbfb)', border: '1px solid var(--border)' }}>
                <div className="flex-between">
                  <strong style={{ fontSize: '0.95rem' }}>{v.name}</strong>
                  <span className="badge badge-approved">Grade A</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                  {v.city || 'Pune'}, {v.state || 'Maharashtra'} &bull; {v.machines?.length || 4} CNC Spindles
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assigned Sanction Limit:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
                  &#8377; 50,00,000
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Utilized: &#8377; 18,20,000 &bull; Available: &#8377; 31,80,000
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => showToast(`Credit limit renewal initiated for ${v.name}`)}
                >
                  Adjust Facility Limit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: AUDIT LOG ───────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Settlement &amp; Recoupment Audit Trail</h3>
          <p style={{ margin: '4px 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Immutable financial event log tracking principal disbursements, discounting fee deductions, and OEM loan liquidations.
          </p>

          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 12px' }}>TIMESTAMP</th>
                <th style={{ padding: '8px 12px' }}>TXN ID</th>
                <th style={{ padding: '8px 12px' }}>TYPE</th>
                <th style={{ padding: '8px 12px' }}>PROJECT REF</th>
                <th style={{ padding: '8px 12px' }}>AMOUNT</th>
                <th style={{ padding: '8px 12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Today, 14:32 IST</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>TXN-RTGS-8912401</td>
                <td style={{ padding: '10px 12px' }}><span className="badge badge-process">PO Advance 80%</span></td>
                <td style={{ padding: '10px 12px' }}><strong>PRJ-1002</strong></td>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>&#8377; 1,80,000</td>
                <td style={{ padding: '10px 12px' }}><span className="badge badge-approved">Settled</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Yesterday, 11:15 IST</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>TXN-NEFT-7712390</td>
                <td style={{ padding: '10px 12px' }}><span className="badge badge-info">Escrow Release</span></td>
                <td style={{ padding: '10px 12px' }}><strong>PRJ-1001</strong></td>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>&#8377; 1,45,000</td>
                <td style={{ padding: '10px 12px' }}><span className="badge badge-approved">Settled</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
