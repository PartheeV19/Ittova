import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function newVendorId() {
  return `V-${randomInt(1000, 9999)}`;
}

function newMachineId() {
  return `M-${randomInt(100, 999)}`;
}

function toApiShape(row, machines = []) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    status: row.status,
    auditScore: row.audit_score,
    machines: machines.map((m) => ({
      id: m.id,
      name: m.name,
      process: m.process,
      hourlyRate: m.hourly_rate,
      availabilityStatus: m.availability_status,
      ...m.details
    })),
    ...row.profile,
    createdAt: row.created_at
  };
}

async function loadMachines(pool, vendorId) {
  const result = await pool.query('SELECT * FROM vendor_machines WHERE vendor_id = $1 ORDER BY created_at', [vendorId]);
  return result.rows;
}

// Create the vendor/supplier profile for the signed-in account.
router.post('/', requireAuth, requireRole('supplier'), async (request, response) => {
  const { name, email, phone, location, ...profileFields } = request.body || {};
  if (!name) {
    return response.status(400).json({ error: 'A facility name is required.' });
  }

  const pool = getPool();
  const existing = await pool.query('SELECT * FROM vendors WHERE account_id = $1', [request.user.accountId]);
  if (existing.rowCount > 0) {
    return response.json(toApiShape(existing.rows[0], await loadMachines(pool, existing.rows[0].id)));
  }

  const id = newVendorId();
  const inserted = await pool.query(
    `INSERT INTO vendors (id, account_id, name, email, phone, location, status, audit_score, profile)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', 'Pending Physical Audit', $7)
     RETURNING *`,
    [id, request.user.accountId, name, email || null, phone || null, location || null, JSON.stringify(profileFields)]
  );

  response.status(201).json(toApiShape(inserted.rows[0], []));
});

// Public-ish listing for RFQ matching; staff/admin see everything, everyone
// else only sees approved facilities (customers/vendors should not see who's
// still under audit).
router.get('/', requireAuth, async (request, response) => {
  const pool = getPool();
  const isStaff = ['staff', 'admin'].includes(request.user.role);
  const result = isStaff
    ? await pool.query('SELECT * FROM vendors ORDER BY created_at DESC')
    : await pool.query(`SELECT * FROM vendors WHERE status = 'APPROVED' ORDER BY created_at DESC`);

  const vendors = await Promise.all(
    result.rows.map(async (row) => toApiShape(row, await loadMachines(pool, row.id)))
  );
  response.json(vendors);
});

router.get('/me', requireAuth, requireRole('supplier'), async (request, response) => {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM vendors WHERE account_id = $1', [request.user.accountId]);
  if (result.rowCount === 0) return response.status(404).json({ error: 'No vendor profile yet.' });
  response.json(toApiShape(result.rows[0], await loadMachines(pool, result.rows[0].id)));
});

router.get('/:id', requireAuth, async (request, response) => {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM vendors WHERE id = $1', [request.params.id]);
  if (result.rowCount === 0) return response.status(404).json({ error: 'Vendor not found.' });

  const row = result.rows[0];
  const isOwner = row.account_id === request.user.accountId;
  const isStaff = ['staff', 'admin'].includes(request.user.role);
  if (!isOwner && !isStaff && row.status !== 'APPROVED') {
    return response.status(403).json({ error: 'Not permitted.' });
  }

  response.json(toApiShape(row, await loadMachines(pool, row.id)));
});

// Staff/admin: facility audit approval.
router.patch('/:id/approve', requireAuth, requireRole('staff', 'admin'), async (request, response) => {
  const { auditScore } = request.body || {};
  const pool = getPool();
  const result = await pool.query(
    `UPDATE vendors SET status = 'APPROVED', audit_score = $2, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [request.params.id, auditScore || '95/100 (ISO 9001:2015)']
  );
  if (result.rowCount === 0) return response.status(404).json({ error: 'Vendor not found.' });
  response.json(toApiShape(result.rows[0], await loadMachines(pool, result.rows[0].id)));
});

// A vendor registers a machine on their own facility profile.
router.post('/:id/machines', requireAuth, requireRole('supplier'), async (request, response) => {
  const pool = getPool();
  const vendor = await pool.query('SELECT * FROM vendors WHERE id = $1', [request.params.id]);
  if (vendor.rowCount === 0) return response.status(404).json({ error: 'Vendor not found.' });
  if (vendor.rows[0].account_id !== request.user.accountId) {
    return response.status(403).json({ error: 'You can only add machines to your own facility.' });
  }

  const { name, process, hourlyRate, ...details } = request.body || {};
  if (!name || !process) {
    return response.status(400).json({ error: 'Machine name and process are required.' });
  }

  const inserted = await pool.query(
    `INSERT INTO vendor_machines (id, vendor_id, name, process, hourly_rate, availability_status, details)
     VALUES ($1, $2, $3, $4, $5, 'idle', $6)
     RETURNING *`,
    [newMachineId(), request.params.id, name, process, hourlyRate ? Number(hourlyRate) : null, JSON.stringify(details)]
  );

  const machine = inserted.rows[0];
  response.status(201).json({
    id: machine.id,
    name: machine.name,
    process: machine.process,
    hourlyRate: machine.hourly_rate,
    availabilityStatus: machine.availability_status,
    ...machine.details
  });
});

export default router;
