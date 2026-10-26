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
  const { code, role, purpose = 'signup', profile } = request.body || {};
  const ALLOWED_PARTICIPANT_ROLES = ['customer', 'supplier', 'finance_partner', 'material_partner'];
  if (typeof code !== 'string' || !/^[0-9]{6}$/.test(code) || !ALLOWED_PARTICIPANT_ROLES.includes(role)) {
    return response.status(400).json({ error: 'Enter a six-digit code and select a valid participant account.' });
  }
  if (purpose === 'signup') {
    if (typeof profile?.fullName !== 'string' || !profile.fullName.trim()
      || typeof profile?.company !== 'string' || !profile.company.trim()) {
      return response.status(400).json({ error: 'Full name and company are required to create your account.' });
    }
  }
  const { contact } = parseOtpRequest({ contact: request.body.contact, purpose });
  const isEmail = contact.includes('@');
  const pool = getPool();

  const phoneDigits = !isEmail
    ? contact.replace(/[^0-9]/g, '')
    : (typeof profile?.phone === 'string' ? profile.phone.replace(/[^0-9]/g, '') : '');
  const emailCandidate = isEmail
    ? contact.toLowerCase()
    : (typeof profile?.email === 'string' && profile.email.includes('@') ? profile.email.trim().toLowerCase() : '');

  // Look up existing user by email or by registered phone in profile_data
  const existing = await pool.query(
    `SELECT id, role, status, public_id, identity_codes, profile_data FROM app_users
     WHERE (lower(email) = $1 AND $1 <> '')
        OR ($2 <> '' AND profile_data->>'phone' IS NOT NULL AND regexp_replace(profile_data->>'phone', '[^0-9]', '', 'g') = $2)`,
    [emailCandidate, phoneDigits]
  );
  let account = existing.rows[0];

  // If account exists but is inactive, block. If account doesn't exist and this is a login, block.
  if ((account && account.status !== 'active') || (!account && purpose === 'login')) {
    return response.status(401).json({ error: 'Unable to sign in with these account details.' });
  }

  const ok = await verifyOtp(contact, code, purpose);
  if (!ok) return response.status(401).json({ error: 'Invalid or expired code.' });

  const PARTICIPANT_ROLE_NAMES = {
    customer: 'Industrial Buyer / OEM',
    supplier: 'Manufacturing Facility / Vendor',
    finance_partner: 'Bank / NBFC Financier',
    material_partner: 'Raw Material & Testing Partner',
  };

  const targetRole = ALLOWED_PARTICIPANT_ROLES.includes(role) ? role : (account ? account.role : 'customer');
  const selectedParticipantRole = (typeof profile?.participantRole === 'string' && profile.participantRole.trim())
    ? profile.participantRole.trim()
    : (PARTICIPANT_ROLE_NAMES[targetRole] || '');

  if (!account) {
    const userEmail = isEmail
      ? contact.toLowerCase()
      : (typeof profile?.email === 'string' && profile.email.includes('@')
          ? profile.email.trim().toLowerCase()
          : `${contact.replace(/[^0-9]/g, '')}@phone.ittova.internal`);

    const profileData = {
      fullName: typeof profile?.fullName === 'string' ? profile.fullName.trim() : '',
      company: typeof profile?.company === 'string' ? profile.company.trim() : '',
      phone: typeof profile?.phone === 'string' && profile.phone.trim() ? profile.phone.trim() : (!isEmail ? contact : ''),
      participantRole: selectedParticipantRole
    };
    const created = await pool.query(
      `INSERT INTO app_users (email, password_hash, role, status, profile_data)
       VALUES ($1, '', $2, 'active', $3)
       RETURNING id, role, status, public_id, identity_codes, profile_data, email`,
      [userEmail, targetRole, JSON.stringify(profileData)]);
    account = created.rows[0] || (await pool.query(
      'SELECT id, role, status, public_id, identity_codes, profile_data, email FROM app_users WHERE lower(email) = $1', [userEmail]
    )).rows[0];
  } else {
    // Existing account: update with role and profile fields submitted during the login phase
    const existingData = account.profile_data || {};
    const mergedProfileData = {
      ...existingData,
      ...(typeof profile?.fullName === 'string' && profile.fullName.trim() ? { fullName: profile.fullName.trim() } : {}),
      ...(typeof profile?.company === 'string' && profile.company.trim() ? { company: profile.company.trim() } : {}),
      ...(typeof profile?.phone === 'string' && profile.phone.trim() ? { phone: profile.phone.trim() } : {}),
      participantRole: selectedParticipantRole || existingData.participantRole || PARTICIPANT_ROLE_NAMES[targetRole] || ''
    };
    const updated = await pool.query(
      `UPDATE app_users
       SET role = $1,
           profile_data = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, role, status, public_id, identity_codes, profile_data, email`,
      [targetRole, JSON.stringify(mergedProfileData), account.id]
    );
    account = updated.rows[0] || account;
  }
  if (!account || account.status !== 'active') {
    return response.status(401).json({ error: 'Unable to sign in with these account details.' });
  }
  const { rawToken, expiresAt } = await createSession(account.id);
  response.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions());
  response.set('Cache-Control', 'no-store').json({
    accountId: account.id,
    role: account.role,
    expiresAt,
    publicId: account.public_id,
    profileData: account.profile_data,
    email: account.email
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
    `SELECT id, role, status, password_hash, public_id, profile_data FROM app_users WHERE lower(email) = $1`,
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
  response.json({ accountId: account.id, role: account.role, expiresAt, publicId: account.public_id, profileData: account.profile_data });
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

router.patch('/profile', async (request, response) => {
  if (!request.user) return response.status(401).json({ error: 'Not signed in.' });
  const { fullName, company, phone, participantRole, role } = request.body || {};
  const pool = getPool();
  const current = await pool.query('SELECT role, profile_data FROM app_users WHERE id = $1', [request.user.accountId]);
  if (current.rowCount === 0) return response.status(404).json({ error: 'User not found.' });

  const existingProfileData = current.rows[0].profile_data || {};
  const updatedProfileData = {
    ...existingProfileData,
    ...(typeof fullName === 'string' && fullName.trim() ? { fullName: fullName.trim() } : {}),
    ...(typeof company === 'string' && company.trim() ? { company: company.trim() } : {}),
    ...(typeof phone === 'string' && phone.trim() ? { phone: phone.trim() } : {}),
    ...(typeof participantRole === 'string' && participantRole.trim() ? { participantRole: participantRole.trim() } : {})
  };

  const ALLOWED_PARTICIPANT_ROLES = ['customer', 'supplier', 'finance_partner', 'material_partner'];
  const updatedRole = role && ALLOWED_PARTICIPANT_ROLES.includes(role) ? role : current.rows[0].role;

  const result = await pool.query(
    `UPDATE app_users
     SET profile_data = $1, role = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, role, status, public_id, profile_data, email`,
    [JSON.stringify(updatedProfileData), updatedRole, request.user.accountId]
  );

  response.json({
    accountId: result.rows[0].id,
    role: result.rows[0].role,
    publicId: result.rows[0].public_id,
    profileData: result.rows[0].profile_data,
    email: result.rows[0].email
  });
});

export default router;
