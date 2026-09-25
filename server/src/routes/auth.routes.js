import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { verifyOtp } from '../auth/otp.js';
import { requestOtpDelivery } from '../auth/otp-service.js';
import { parseOtpRequest } from '../auth/otp-input.js';
import { otpRequestLimiter } from '../auth/otp-rate-limit.js';
import { verifyPassword } from '../auth/password.js';
import { createSession, revokeSession, sessionCookieOptions, SESSION_COOKIE_NAME } from '../auth/session.js';

const router = Router();

// Customer/vendor OTP authentication. Never log codes or provider credentials.
router.post('/otp/request', otpRequestLimiter, async (request, response) => {
  const result = await requestOtpDelivery(request.body);
  response.set('Cache-Control', 'no-store').json(result);
});

router.post('/otp/verify', async (request, response) => {
  const { code, role, purpose = 'signup' } = request.body || {};
  if (typeof code !== 'string' || !/^[0-9]{6}$/.test(code) || !['customer', 'supplier'].includes(role)) {
    return response.status(400).json({ error: 'Enter a six-digit code and select a customer or vendor account.' });
  }
  const { contact } = parseOtpRequest({ contact: request.body.contact, purpose });
  const pool = getPool();
  const existing = await pool.query('SELECT id, role, status FROM app_users WHERE lower(email) = $1', [contact]);
  let account = existing.rows[0];
  if ((account && (account.status !== 'active' || account.role !== role)) || (!account && purpose === 'login')) {
    return response.status(401).json({ error: 'Unable to sign in with these account details.' });
  }
  const ok = await verifyOtp(contact, code, purpose);
  if (!ok) return response.status(401).json({ error: 'Invalid or expired code.' });
  if (!account) {
    const created = await pool.query(
      `INSERT INTO app_users (email, password_hash, role, status)
       VALUES ($1, '', $2, 'active') ON CONFLICT DO NOTHING RETURNING id, role, status`, [contact, role]);
    account = created.rows[0] || (await pool.query('SELECT id, role, status FROM app_users WHERE lower(email) = $1', [contact])).rows[0];
  }
  if (!account || account.role !== role || account.status !== 'active') {
    return response.status(401).json({ error: 'Unable to sign in with these account details.' });
  }
  const { rawToken, expiresAt } = await createSession(account.id);
  response.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions());
  response.set('Cache-Control', 'no-store').json({ accountId: account.id, role: account.role, expiresAt });
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
