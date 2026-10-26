import React from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminPortal() {
  const { db, isAdminLoggedIn, payVendor, showToast, logout } = useApp();

  const pendingPayouts = db.projects.filter(p => p.status === 'DISPATCHED_TO_CUST' && p.vendorPaymentStatus !== 'PAID');

  const approvedVendors = db.vendors.filter(v => v.status === 'APPROVED');
  const approvedCustomers = db.customers.filter(c => c.status === 'APPROVED');
  const activeProjects = db.projects.filter(p => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(p.status));

  return (
    <div className="view">
      {!isAdminLoggedIn ? (
        <p role="alert">Sign in with an administrator account to access this workspace.</p>
      ) : (
        <div>
          <div className="card">
            <div className="flex-between">
              <div>
                <div className="kicker">Ecosystem Governance</div>
                <h2 style={{ margin: '0.2rem 0' }}>Executive Admin Console</h2>
                <p className="subtitle" style={{ margin: 0 }}>Authenticated as Master Administrator (DDD)</p>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={logout}
              >
                Sign Out
              </button>
            </div>

            {/* Accurate Metrics */}
            <div className="grid-3" style={{ marginTop: 'var(--sp-6)' }}>
              <div className="inner-panel">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Verified Corporate Clients</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                  {approvedCustomers.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {db.customers.length} total enrolled ({db.customers.length - approvedCustomers.length} pending audit)
                </div>
              </div>
              <div className="inner-panel">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Audited &amp; Approved Facilities</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                  {approvedVendors.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {db.vendors.length} total facilities ({db.vendors.length - approvedVendors.length} pending physical audit)
                </div>
              </div>
              <div className="inner-panel">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active In-Flight Work Orders</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                  {activeProjects.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {db.projects.length} lifetime sourced ({db.projects.length - activeProjects.length} completed/closed)
                </div>
              </div>
            </div>
          </div>

          {/* Pending Vendor Payouts */}
          <div className="view-section-title">
            <h3>Pending Supplier Settlements &amp; Escrow Releases</h3>
          </div>

          <div className="card">
            {pendingPayouts.length === 0 ? (
              <p className="subtitle">No vendor payouts currently pending settlement.</p>
            ) : (
              pendingPayouts.map(p => (
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.75rem', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>Project {p.id} &bull; Supplier Escrow Release</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Customer Payment: <span className="text-success">&check; Cleared</span> &bull; Net Payout: <strong>₹40,375.00</strong> (5% Platform Fee Deducted)
                    </div>
                  </div>
                  <button 
                    className="btn btn-success btn-sm" 
                    onClick={() => payVendor(p.id, { payoutMode: 'NEFT_RTGS' })}
                  >
                    Release Supplier Payout (NEFT / RTGS)
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Master Project Ledger */}
          <div className="view-section-title">
            <h3>Ecosystem Transaction &amp; Project Ledger</h3>
          </div>

          <div className="card">
            {db.projects.length === 0 ? (
              <p className="subtitle">No projects active in ecosystem.</p>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Project ID</th>
                      <th>Customer</th>
                      <th>Drawings</th>
                      <th>Status</th>
                      <th>Cust Payment</th>
                      <th>Supplier Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.projects.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        <td>{p.cust}</td>
                        <td>{p.files}</td>
                        <td><span className="badge badge-pending">{p.status.replace(/_/g, ' ')}</span></td>
                        <td>
                          {p.paymentReceipt ? (
                            <span className="badge badge-approved" title={`Receipt ${p.paymentReceipt.receiptId}`}>
                              PAID (₹{p.paymentReceipt.amountPaid?.toLocaleString()})
                            </span>
                          ) : (
                            <span className="badge badge-pending">{p.custPaymentStatus || 'PENDING'}</span>
                          )}
                        </td>
                        <td>
                          {p.vendorPayoutReceipt ? (
                            <span className="badge badge-approved" title={`UTR ${p.vendorPayoutReceipt.utrNumber}`}>
                              SETTLED ({p.vendorPayoutReceipt.utrNumber?.slice(0, 10)}...)
                            </span>
                          ) : (
                            <span className="badge badge-tier">{p.vendorPaymentStatus || 'N/A'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
