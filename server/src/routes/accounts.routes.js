import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function vendorLabelMatches(value, vendorId) {
  return typeof value === 'string' && (value === vendorId || value.startsWith(`${vendorId} (`));
}

function vendorInvolved(payload, vendorId) {
  return (payload?.drawings || []).some((drawing) =>
    (drawing.processes || []).some((process) =>
      vendorLabelMatches(process.selectedVendor, vendorId) ||
      (process.quotes || []).some((quote) => vendorLabelMatches(quote.vid, vendorId))
    )
  );
}

function selectedQuoteCost(process, vendorId = null) {
  const selected = process.selectedVendor;
  if (!selected || (vendorId && !vendorLabelMatches(selected, vendorId))) return 0;
  const quote = (process.quotes || []).find((item) => item.vid === selected)
    || (process.quotes || []).find((item) => vendorId && vendorLabelMatches(item.vid, vendorId));
  return Number(quote?.cost) || 0;
}

function transactionAmount(project, role, vendorId) {
  const drawings = project.payload?.drawings || [];
  const quoteTotal = drawings.reduce((total, drawing) => total + (drawing.processes || []).reduce(
    (subtotal, process) => subtotal + selectedQuoteCost(process, role === 'supplier' ? vendorId : null), 0
  ), 0);
  if (!quoteTotal) return null;
  if (role === 'customer') return Math.round((quoteTotal * 1.05 + (Number(project.payload?.logisticsFee) || 0)) * 100) / 100;
  return Math.round(quoteTotal * 100) / 100;
}

function toOrder(row) {
  return {
    id: row.id,
    status: row.status,
    searchLocation: row.search_location,
    createdAt: row.created_at,
    drawings: (row.payload?.drawings || []).map((drawing) => drawing.dwgNo).filter(Boolean)
  };
}

router.get('/:profileId', requireAuth, requireRole('customer', 'supplier'), async (request, response) => {
  const pool = getPool();
  const accountResult = await pool.query(
    `SELECT id, email, role, public_id, identity_codes, profile_data, created_at
     FROM app_users WHERE id = $1`,
    [request.user.accountId]
  );
  if (!accountResult.rowCount) return response.status(404).json({ error: 'Account not found.' });
  const account = accountResult.rows[0];

  let businessProfile = null;
  if (account.role === 'customer') {
    const profileResult = await pool.query('SELECT * FROM customers WHERE account_id = $1', [account.id]);
    businessProfile = profileResult.rows[0] || null;
  } else {
    const profileResult = await pool.query('SELECT * FROM vendors WHERE account_id = $1', [account.id]);
    businessProfile = profileResult.rows[0] || null;
  }

  const profileId = account.public_id || businessProfile?.id;
  if (!profileId || request.params.profileId !== profileId) {
    return response.status(404).json({ error: 'Account page not found.' });
  }

  let projects = [];
  if (account.role === 'customer' && businessProfile) {
    const result = await pool.query(
      'SELECT * FROM projects WHERE customer_id = $1 ORDER BY created_at DESC',
      [businessProfile.id]
    );
    projects = result.rows;
  } else if (account.role === 'supplier' && businessProfile) {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    projects = result.rows.filter((row) => vendorInvolved(row.payload, businessProfile.id));
  }

  const orderProjects = account.role === 'supplier'
    ? projects.filter((row) => (row.payload?.drawings || []).some((drawing) =>
      (drawing.processes || []).some((process) => vendorLabelMatches(process.selectedVendor, businessProfile?.id))
    ))
    : projects;
  const transactionProjects = account.role === 'supplier' ? orderProjects : projects;
  const projectIds = transactionProjects.map((project) => project.id);
  let transactions = [];
  if (projectIds.length) {
    const eventTypes = account.role === 'customer'
      ? ['final_payment_received']
      : ['vendor_payout_authorized'];
    const result = await pool.query(
      `SELECT e.id, e.project_id, e.event_type, e.created_at, e.details, p.payload
       FROM project_events e
       JOIN projects p ON p.id = e.project_id
       WHERE e.project_id = ANY($1::text[]) AND e.event_type = ANY($2::text[])
       ORDER BY e.created_at DESC`,
      [projectIds, eventTypes]
    );
    transactions = result.rows.map((event) => ({
      id: event.id,
      projectId: event.project_id,
      type: event.event_type,
      createdAt: event.created_at,
      amount: Number(event.details?.amount) || transactionAmount(
        { payload: event.payload }, account.role, businessProfile?.id
      )
    }));
  }

  response.set('Cache-Control', 'no-store').json({
    id: profileId,
    role: account.role,
    email: account.email,
    createdAt: account.created_at,
    profileData: {
      ...account.profile_data,
      identityCodes: account.identity_codes
    },
    businessProfile: businessProfile ? {
      id: businessProfile.id,
      name: businessProfile.name,
      email: businessProfile.email,
      phone: businessProfile.phone,
      location: businessProfile.location,
      status: businessProfile.status,
      ...businessProfile.profile
    } : null,
    orders: orderProjects.map(toOrder),
    transactions
  });
});

export default router;
