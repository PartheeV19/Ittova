import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function formatAmount(value) {
  if (value == null || !Number.isFinite(Number(value))) return 'Amount not recorded';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value));
}

const ROLE_LABELS = { customer: 'Customer', supplier: 'Manufacturing partner' };

export default function AccountPage() {
  const { profileId } = useParams();
  const { currentUser, loadAccountPage, setCurrentView } = useApp();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loadAccountPage(profileId)
      .then((result) => { if (active) setAccount(result); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load your account.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profileId, currentUser?.accountId, loadAccountPage]);

  if (loading) return <main className="container account-page" role="status">Loading your account…</main>;
  if (error || !account) {
    return <main className="container account-page"><div className="alert alert-warn" role="alert">{error || 'Account not found.'}</div></main>;
  }

  const profile = account.profileData || {};
  const business = account.businessProfile;
  const codes = profile.identityCodes || {};
  const registeredLocation = profile.location
    ? [profile.location.city, profile.location.district, profile.location.state, profile.location.country].filter(Boolean).join(', ')
    : '';
  const workspace = account.role === 'supplier' ? 'vendor' : 'customer';
  const businessName = business?.name || profile.company || 'Business profile pending';
  const transactionLabel = account.role === 'supplier' ? 'Vendor payout' : 'Customer payment';

  return (
    <main className="container account-page">
      <section className="account-hero">
        <div>
          <div className="kicker">Personal account</div>
          <h1>{profile.fullName || businessName}</h1>
          <p>{ROLE_LABELS[account.role] || account.role} · {businessName}</p>
        </div>
        <span className={`badge ${business?.status === 'APPROVED' ? 'badge-approved' : 'badge-pending'}`}>
          {business?.status || 'Registration pending'}
        </span>
      </section>

      <section className="account-id-card" aria-label="Unique ITOVA user ID">
        <div>
          <span className="account-eyebrow">Your unique ITOVA user ID</span>
          <strong>{account.id}</strong>
        </div>
        <span className="account-code-hint">
          {codes.countryCode || '—'}-{codes.stateCode || '—'}-{codes.districtCode || '—'}-{codes.cityCode || '—'}-###
        </span>
      </section>

      {!business && (
        <section className="account-onboarding card">
          <div>
            <h2>Complete your business profile</h2>
            <p className="subtitle">Your account ID is ready. Finish organization or facility registration to add your first orders and transactions here.</p>
          </div>
          <button type="button" className="btn" onClick={() => setCurrentView(workspace)}>
            Continue registration
          </button>
        </section>
      )}

      <section className="card">
        <div className="account-section-heading">
          <div>
            <div className="kicker">Account details</div>
            <h2>Profile information</h2>
          </div>
          {business && <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCurrentView(workspace)}>Open workspace</button>}
        </div>
        <div className="account-detail-grid">
          <div><span>Full name</span><strong>{profile.fullName || '—'}</strong></div>
          <div><span>Organization / facility</span><strong>{business?.name || profile.company || '—'}</strong></div>
          <div><span>Email</span><strong>{account.email || '—'}</strong></div>
          <div><span>Phone</span><strong>{business?.phone || profile.phone || '—'}</strong></div>
          <div><span>Account type</span><strong>{ROLE_LABELS[account.role] || account.role}</strong></div>
          <div><span>Member since</span><strong>{formatDate(account.createdAt)}</strong></div>
          <div><span>City / district / state / country</span><strong>{registeredLocation || '—'}</strong></div>
          <div><span>Office / facility address</span><strong>{business?.location || business?.address || '—'}</strong></div>
          <div><span>Location codes</span><strong>{[codes.countryCode, codes.stateCode, codes.districtCode, codes.cityCode].filter(Boolean).join(' · ') || '—'}</strong></div>
          {business?.gst && <div><span>GSTIN</span><strong>{business.gst}</strong></div>}
          {business?.cin && <div><span>CIN / LLPIN</span><strong>{business.cin}</strong></div>}
        </div>
      </section>

      <section className="card">
        <div className="account-section-heading">
          <div>
            <div className="kicker">Order history</div>
            <h2>Orders <span className="account-count">{account.orders?.length || 0}</span></h2>
          </div>
        </div>
        {account.orders?.length ? (
          <div className="account-table-wrap">
            <table className="account-table">
              <thead><tr><th>Order</th><th>Status</th><th>Location</th><th>Drawings</th><th>Created</th></tr></thead>
              <tbody>
                {account.orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td><span className="badge badge-pending">{String(order.status || 'Open').replace(/_/g, ' ')}</span></td>
                    <td>{order.searchLocation || '—'}</td>
                    <td>{order.drawings?.length ? order.drawings.join(', ') : '—'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="account-empty">Your orders will appear here when they are created.</p>}
      </section>

      <section className="card">
        <div className="account-section-heading">
          <div>
            <div className="kicker">Financial activity</div>
            <h2>Transactions <span className="account-count">{account.transactions?.length || 0}</span></h2>
          </div>
        </div>
        {account.transactions?.length ? (
          <div className="account-table-wrap">
            <table className="account-table">
              <thead><tr><th>Transaction</th><th>Order</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {account.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transactionLabel}</td>
                    <td><strong>{transaction.projectId}</strong></td>
                    <td>{formatAmount(transaction.amount)}</td>
                    <td>{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="account-empty">Completed payments and payouts will appear here.</p>}
      </section>
    </main>
  );
}
