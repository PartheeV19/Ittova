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

// Admin-only: provisions a new staff or admin account. This is the only way
// to create a password-based login today -- there is no public signup for
// this tier by design (see the auth design note in server/README.md).
router.post('/', requireAuth, requireRole('admin'), async (request, response) => {
  const { name, email, password, role = 'staff', title } = request.body || {};
  if (!name || !email || !password) {
    return response.status(400).json({ error: 'name, email, and password are required.' });
  }
  if (!['staff', 'admin'].includes(role)) {
    return response.status(400).json({ error: 'role must be "staff" or "admin".' });
  }

  const pool = getPool();
  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const account = await client.query(
      `INSERT INTO app_users (email, password_hash, role, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id`,
      [email.trim().toLowerCase(), passwordHash, role]
    );

    const staffRow = await client.query(
      `INSERT INTO staff (id, account_id, name, role, title, profile)
       VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)
       RETURNING *`,
      [newStaffId(), account.rows[0].id, name, role, title || null]
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
