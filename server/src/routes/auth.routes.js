import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { issueOtp, verifyOtp } from '../auth/otp.js';
import { verifyPassword } from '../auth/password.js';
import { createSession, revokeSession, sessionCookieOptions, SESSION_COOKIE_NAME } from '../auth/session.js';

const router = Router();

// --- Tier 0: soft gate (customer / vendor) -------------------------------
// No password. This exists to filter bots and randoms, not to restrict
// legitimate customers/vendors -- see the auth design note in server/README.md.

router.post('/otp/request', async (request, response) => {
  const { contact, purpose = 'signup' } = request.body || {};
  if (!contact || typeof contact !== 'string') {
    return response.status(400).json({ error: 'A contact email or phone number is required.' });
  }

  const code = await issueOtp(contact, purpose);

  // TODO: replace with a real email/SMS provider. Logging for local dev only.
  console.log(`[otp] ${purpose} code for ${contact}: ${code}`);

  response.json({ status: 'sent' });
});

router.post('/otp/verify', async (request, response) => {
  const { contact, code, role } = request.body || {};
  if (!contact || !code || !['customer', 'supplier'].includes(role)) {
    return response.status(400).json({ error: 'contact, code, and a valid role are required.' });
  }

  const ok = await verifyOtp(contact, code, 'signup');
  if (!ok) {
    return response.status(401).json({ error: 'Invalid or expired code.' });
  }

  const pool = getPool();
  const normalizedContact = contact.trim().toLowerCase();

  let account = await pool.query(
    `SELECT id, role, status FROM app_users WHERE lower(email) = $1`,
    [normalizedContact]
  );

  if (account.rowCount === 0) {
    account = await pool.query(
      `INSERT INTO app_users (email, password_hash, role, status)
       VALUES ($1, '', $2, 'active')
       RETURNING id, role, status`,
      [normalizedContact, role]
    );
  }

  const { rawToken, expiresAt } = await createSession(account.rows[0].id);
  response.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions());
  response.json({
    accountId: account.rows[0].id,
    role: account.rows[0].role,
    expiresAt
  });
});

// --- Tier 1: password login (staff / admin / anyone with a set password) -

router.post('/login', async (request, response) => {
  const { email, password } = request.body || {};
  if (!email || !password) {
    return response.status(400).json({ error: 'email and password are required.' });
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, role, status, password_hash FROM app_users WHERE lower(email) = $1`,
    [email.trim().toLowerCase()]
  );

  const account = result.rows[0];
  const passwordOk = account && (await verifyPassword(password, account.password_hash));

  if (!passwordOk || account.status !== 'active') {
    // Same generic message either way -- don't reveal which part was wrong.
    return response.status(401).json({ error: 'Invalid credentials.' });
  }

  const { rawToken, expiresAt } = await createSession(account.id);
  response.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions());
  response.json({ accountId: account.id, role: account.role, expiresAt });
});

// --- Common ---------------------------------------------------------------

router.post('/logout', async (request, response) => {
  await revokeSession(request.cookies?.[SESSION_COOKIE_NAME]);
  response.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
  response.json({ status: 'signed_out' });
});

router.get('/me', (request, response) => {
  if (!request.user) return response.status(401).json({ error: 'Not signed in.' });
  response.json(request.user);
});

export default router;
