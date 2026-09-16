import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminPortal() {
  const { db, isAdminLoggedIn, setIsAdminLoggedIn, payVendor, showToast, logout } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'DDD' && password === '123') {
      setIsAdminLoggedIn(true);
      showToast('Admin Central authenticated successfully.');
    } else {
      alert('Invalid admin credentials! Use User: DDD, Pass: 123');
    }
  };

  const pendingPayouts = db.projects.filter(p => p.status === 'DISPATCHED_TO_CUST' && p.vendorPaymentStatus !== 'PAID');

  return (
    <div className="view">
      {!isAdminLoggedIn ? (
        <div className="card" style={{ maxWidth: '450px', margin: '3rem auto' }}>
          <div className="kicker">Restricted Access</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Admin Central Authentication</h2>
          <p className="subtitle">Enter platform administration credentials to manage vendor payouts and ecosystem health.</p>

          <form onSubmit={handleLogin} style={{ marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Admin Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="DDD" 
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Admin Security Passcode</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="123" 
              />
            </div>
            <button type="submit" className="btn w-full">
              Authenticate Admin Session
            </button>
          </form>
        </div>
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

            {/* Quick Metrics */}
            <div className="grid-3" style={{ marginTop: 'var(--sp-6)' }}>
              <div className="inner-panel">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Corporate Clients</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                  {db.customers.length}
                </div>
              </div>
              <div className="inner-panel">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Verified Facilities</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                  {db.vendors.length}
                </div>
              </div>
              <div className="inner-panel">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Projects</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                  {db.projects.length}
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
                <div key={p.id} className="inner-panel flex-between" style={{ marginTop: '0.75rem' }}>
                  <div>
                    <strong>Project {p.id} Settlement</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Customer Payment Cleared: YES &bull; Order Fulfilled &bull; Supplier Payout Pending
                    </div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => payVendor(p.id)}>
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
                        <td>{p.custPaymentStatus || 'PENDING'}</td>
                        <td>{p.vendorPaymentStatus || 'N/A'}</td>
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
