import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ensureAccountPublicId } from '../auth/user-id.js';

const router = Router();

async function newMachineId(pool) {
  for (let i = 0; i < 5; i++) {
    const candidate = `M-${randomInt(10000, 99999)}`;
    const check = await pool.query('SELECT 1 FROM vendor_machines WHERE id = $1', [candidate]);
    if (check.rowCount === 0) return candidate;
  }
  return `M-${Date.now().toString().slice(-5)}${randomInt(10, 99)}`;
}

function toApiShape(row, machines = []) {
  const profile = { ...(row.profile || {}) };
  // Never let stale profile.machines JSON override authoritative vendor_machines table rows
  delete profile.machines;

  const normalizedMachines = machines.map((m) => {
    const details = typeof m.details === 'object' && m.details !== null ? m.details : {};
    const rate = m.hourly_rate ?? details.rate ?? details.hourlyRate ?? null;
    return {
      id: m.id,
      name: m.name,
      process: m.process,
      hourlyRate: rate,
      rate: rate,
      availabilityStatus: m.availability_status || 'idle',
      status: m.availability_status === 'idle' ? 'Idle' : m.availability_status,
      ...details
    };
  });

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    status: row.status,
    auditScore: row.audit_score,
    ...profile,
    machines: normalizedMachines,
    createdAt: row.created_at
  };
}

async function loadMachines(pool, vendorId) {
  const result = await pool.query('SELECT * FROM vendor_machines WHERE vendor_id = $1 ORDER BY created_at', [vendorId]);
  return result.rows;
}

// Create the vendor/supplier profile for the signed-in account.
router.post('/', requireAuth, requireRole('supplier'), async (request, response) => {
  const { name, email, phone, location, accountLocation, machines: initialMachines, ...profileFields } = request.body || {};
  if (!name) {
    return response.status(400).json({ error: 'A facility name is required.' });
  }

  const pool = getPool();
  const existing = await pool.query('SELECT * FROM vendors WHERE account_id = $1', [request.user.accountId]);
  if (existing.rowCount > 0) {
    return response.json(toApiShape(existing.rows[0], await loadMachines(pool, existing.rows[0].id)));
  }

  let id = request.user.publicId;
  if (!id) {
    const identity = await ensureAccountPublicId(pool, request.user.accountId, accountLocation);
    if (identity.error) return response.status(400).json({ error: identity.error });
    id = identity.publicId;
  }
  const inserted = await pool.query(
    `INSERT INTO vendors (id, account_id, name, email, phone, location, status, audit_score, profile)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', 'Pending Physical Audit', $7)
     ON CONFLICT (account_id) DO NOTHING
     RETURNING *`,
    [id, request.user.accountId, name, email || null, phone || null, location || null, JSON.stringify(profileFields)]
  );

  const vendorRow = inserted.rowCount ? inserted.rows[0] : (await pool.query('SELECT * FROM vendors WHERE account_id = $1', [request.user.accountId])).rows[0];
  const vendorId = vendorRow.id;

  // If initial machines were submitted, persist them in vendor_machines table
  if (Array.isArray(initialMachines)) {
    for (const m of initialMachines) {
      if (m && m.name && m.process) {
        const rate = m.rate || m.hourlyRate ? Number(m.rate || m.hourlyRate) : null;
        const machineId = m.id || (await newMachineId(pool));
        await pool.query(
          `INSERT INTO vendor_machines (id, vendor_id, name, process, hourly_rate, availability_status, details)
           VALUES ($1, $2, $3, $4, $5, 'idle', $6)
           ON CONFLICT (id) DO NOTHING`,
          [machineId, vendorId, m.name, m.process, rate, JSON.stringify(m)]
        );
      }
    }
  }

  const finalMachines = await loadMachines(pool, vendorId);
  response.status(inserted.rowCount ? 201 : 200).json(toApiShape(vendorRow, finalMachines));
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

  const { name, process, hourlyRate, rate, ...details } = request.body || {};
  if (!name || !process) {
    return response.status(400).json({ error: 'Machine name and process are required.' });
  }

  const effectiveRate = hourlyRate ? Number(hourlyRate) : rate ? Number(rate) : null;
  const machineId = await newMachineId(pool);
  const inserted = await pool.query(
    `INSERT INTO vendor_machines (id, vendor_id, name, process, hourly_rate, availability_status, details)
     VALUES ($1, $2, $3, $4, $5, 'idle', $6)
     RETURNING *`,
    [machineId, request.params.id, name, process, effectiveRate, JSON.stringify({ rate: effectiveRate, ...details })]
  );

  const machine = inserted.rows[0];
  response.status(201).json({
    id: machine.id,
    name: machine.name,
    process: machine.process,
    hourlyRate: machine.hourly_rate,
    rate: machine.hourly_rate,
    availabilityStatus: machine.availability_status,
    status: 'Idle',
    ...machine.details
  });
});

export default router;
