import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function newCustomerId() {
  return `C-${randomInt(1000, 9999)}`;
}

function toApiShape(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    status: row.status,
    ...row.profile,
    createdAt: row.created_at
  };
}

// Create the customer profile for the signed-in account (post OTP-verify).
// One profile per app_users row -- a second call just returns the existing one.
router.post('/', requireAuth, requireRole('customer'), async (request, response) => {
  const { name, email, phone, location, ...profileFields } = request.body || {};
  if (!name) {
    return response.status(400).json({ error: 'A company/customer name is required.' });
  }

  const pool = getPool();
  const existing = await pool.query('SELECT * FROM customers WHERE account_id = $1', [request.user.accountId]);
  if (existing.rowCount > 0) {
    return response.json(toApiShape(existing.rows[0]));
  }

  const id = newCustomerId();
  const inserted = await pool.query(
    `INSERT INTO customers (id, account_id, name, email, phone, location, status, profile)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)
     RETURNING *`,
    [id, request.user.accountId, name, email || null, phone || null, location || null, JSON.stringify(profileFields)]
  );

  response.status(201).json(toApiShape(inserted.rows[0]));
});

// Staff/admin: full list, for the onboarding queue and lookups.
router.get('/', requireAuth, requireRole('staff', 'admin'), async (_request, response) => {
  const result = await getPool().query('SELECT * FROM customers ORDER BY created_at DESC');
  response.json(result.rows.map(toApiShape));
});

// The signed-in customer's own profile.
router.get('/me', requireAuth, requireRole('customer'), async (request, response) => {
  const result = await getPool().query('SELECT * FROM customers WHERE account_id = $1', [request.user.accountId]);
  if (result.rowCount === 0) return response.status(404).json({ error: 'No customer profile yet.' });
  response.json(toApiShape(result.rows[0]));
});

// Single customer -- the owning customer, or staff/admin.
router.get('/:id', requireAuth, async (request, response) => {
  const result = await getPool().query('SELECT * FROM customers WHERE id = $1', [request.params.id]);
  if (result.rowCount === 0) return response.status(404).json({ error: 'Customer not found.' });

  const row = result.rows[0];
  const isOwner = row.account_id === request.user.accountId;
  const isStaff = ['staff', 'admin'].includes(request.user.role);
  if (!isOwner && !isStaff) return response.status(403).json({ error: 'Not permitted.' });

  response.json(toApiShape(row));
});

// Staff/admin: KYC + credit approval.
router.patch('/:id/approve', requireAuth, requireRole('staff', 'admin'), async (request, response) => {
  const { creditTier, creditLimit } = request.body || {};
  const result = await getPool().query(
    `UPDATE customers
     SET status = 'APPROVED',
         profile = profile || jsonb_build_object('creditTier', $2::text, 'creditLimit', $3::text),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [request.params.id, creditTier || 'Standard', creditLimit || 'Pending Sanction']
  );
  if (result.rowCount === 0) return response.status(404).json({ error: 'Customer not found.' });
  response.json(toApiShape(result.rows[0]));
});

export default router;
