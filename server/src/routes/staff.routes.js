import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { hashPassword } from '../auth/password.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function newStaffId() {
  return `S-${randomInt(1000, 9999)}`;
}

function toApiShape(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    title: row.title,
    ...row.profile,
    createdAt: row.created_at
  };
}

// Valid operational roles matching platform departmental queues
export const VALID_STAFF_ROLES = [
  'admin',
  'staff',
  'CUSTOMER_AUDIT',
  'VENDOR_AUDIT',
  'PROCESS_VALIDATOR',
  'VENDOR_VALIDATOR',
  'LOGISTICS',
  'INSPECTOR',
  'STAFF_GENERAL'
];

// Helper to map operational role to app_users constraint role
function resolveAuthRole(operationalRole) {
  const normalized = operationalRole.toUpperCase();
  if (normalized === 'ADMIN') return 'admin';
  if (normalized === 'LOGISTICS') return 'logistics';
  if (normalized === 'INSPECTOR') return 'inspector';
  return 'staff';
}

// Bootstrap endpoint: allows provisioning the root administrator account when
// starting with a fresh database that has zero admin accounts. Once an admin
// exists, this endpoint is permanently locked down unless a secret is supplied.
router.post('/bootstrap', async (request, response) => {
  const { name, email, password, title } = request.body || {};
  if (!name || !email || !password) {
    return response.status(400).json({ error: 'name, email, and password are required for initial administrator bootstrap.' });
  }

  const pool = getPool();

  // Check if system has already been bootstrapped with an admin account
  const existingAdmin = await pool.query("SELECT id FROM app_users WHERE role = 'admin' LIMIT 1");
  if (existingAdmin.rowCount > 0) {
    const bootstrapSecret = process.env.BOOTSTRAP_SECRET;
    const suppliedSecret = request.headers['x-bootstrap-secret'];
    if (!bootstrapSecret || suppliedSecret !== bootstrapSecret) {
      return response.status(403).json({
        error: 'System has already been bootstrapped. Admin login required to provision new accounts.'
      });
    }
  }

  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const account = await client.query(
      `INSERT INTO app_users (email, password_hash, role, status)
       VALUES ($1, $2, 'admin', 'active')
       RETURNING id`,
      [email.trim().toLowerCase(), passwordHash]
    );

    const staffRow = await client.query(
      `INSERT INTO staff (id, account_id, name, role, title, profile)
       VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)
       RETURNING *`,
      ['S-ROOT-ADMIN', account.rows[0].id, name.trim(), 'ADMIN', title || 'Root System Administrator']
    );

    await client.query('COMMIT');
    response.status(201).json(toApiShape(staffRow.rows[0]));
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return response.status(409).json({ error: 'An account with that email already exists.' });
    }
    throw error;
  } finally {
    client.release();
  }
});

// Admin-only: provisions a new staff or admin account with specific work queue role.
router.post('/', requireAuth, requireRole('admin'), async (request, response) => {
  const { name, email, password, role = 'staff', title } = request.body || {};
  if (!name || !email || !password) {
    return response.status(400).json({ error: 'name, email, and password are required.' });
  }

  const matchedRole = VALID_STAFF_ROLES.find(r => r.toLowerCase() === String(role).trim().toLowerCase());
  if (!matchedRole) {
    return response.status(400).json({
      error: `Invalid role. Allowed staff roles: ${VALID_STAFF_ROLES.join(', ')}.`
    });
  }

  const pool = getPool();
  const passwordHash = await hashPassword(password);
  const authRole = resolveAuthRole(matchedRole);
  const operationalRole = matchedRole === 'staff' ? 'STAFF_GENERAL' : matchedRole;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const account = await client.query(
      `INSERT INTO app_users (email, password_hash, role, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id`,
      [email.trim().toLowerCase(), passwordHash, authRole]
    );

    const staffRow = await client.query(
      `INSERT INTO staff (id, account_id, name, role, title, profile)
       VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)
       RETURNING *`,
      [newStaffId(), account.rows[0].id, name.trim(), operationalRole, title || null]
    );

    await client.query('COMMIT');
    response.status(201).json(toApiShape(staffRow.rows[0]));
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return response.status(409).json({ error: 'An account with that email already exists.' });
    }
    throw error;
  } finally {
    client.release();
  }
});

// Directory for assignment dropdowns (Process Validator, Vendor Validator,
// Inspector, etc.) -- staff and admin can both see it.
router.get('/', requireAuth, requireRole('staff', 'admin'), async (_request, response) => {
  const result = await getPool().query('SELECT * FROM staff ORDER BY created_at');
  response.json(result.rows.map(toApiShape));
});

router.get('/me', requireAuth, requireRole('staff', 'admin'), async (request, response) => {
  const result = await getPool().query('SELECT * FROM staff WHERE account_id = $1', [request.user.accountId]);
  if (result.rowCount === 0) return response.status(404).json({ error: 'No staff profile for this account.' });
  response.json(toApiShape(result.rows[0]));
});

export default router;
