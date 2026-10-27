import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { verifyOtp } from '../auth/otp.js';
import { requestOtpDelivery } from '../auth/otp-service.js';
import { parseOtpRequest } from '../auth/otp-input.js';
import { otpRequestLimiter } from '../auth/otp-rate-limit.js';
import { verifyPassword } from '../auth/password.js';
import { createSession, revokeSession, sessionCookieOptions, SESSION_COOKIE_NAME } from '../auth/session.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const ALLOWED_PARTICIPANT_ROLES = ['customer', 'supplier', 'finance_partner', 'material_partner'];
const PARTICIPANT_ROLE_NAMES = {
  customer: 'Industrial Buyer / OEM',
  supplier: 'Manufacturing Facility / Vendor',
  finance_partner: 'Bank / NBFC Financier',
  material_partner: 'Raw Material & Testing Partner',
};
const ROLE_CHANGE_COOLDOWN_MS = 15 * 24 * 60 * 60 * 1000;

function roleChangePurpose(targetRole) {
  return `role_change:${targetRole}`;
}

function getRoleChangeWindow(roleChangedAt) {
  if (!roleChangedAt) return { changedAt: null, availableAt: null, canChangeRole: true };
  const changedAt = new Date(roleChangedAt);
  const availableAt = new Date(changedAt.getTime() + ROLE_CHANGE_COOLDOWN_MS);
  return {
    changedAt: changedAt.toISOString(),
    availableAt: availableAt.toISOString(),
    canChangeRole: availableAt.getTime() <= Date.now()
  };
}

function getRoleChangeContact(account) {
  const email = typeof account.email === 'string' ? account.email.trim().toLowerCase() : '';
  if (email.includes('@') && !email.endsWith('@phone.ittova.internal')) return email;
  const phone = typeof account.profile_data?.phone === 'string' ? account.profile_data.phone.trim() : '';
  return phone || null;
}

// Customer/vendor OTP authentication. Never log codes or provider credentials.
router.post('/otp/request', otpRequestLimiter, async (request, response) => {
  const purpose = request.body?.purpose ?? 'signup';
  if (!['signup', 'login'].includes(purpose)) {
    return response.status(400).json({ error: 'Use the authenticated role-change flow for this OTP purpose.' });
  }
  const result = await requestOtpDelivery(request.body);
  response.set('Cache-Control', 'no-store').json(result);
});

router.post('/otp/verify', async (request, response) => {
  const { code, role, purpose = 'signup', profile } = request.body || {};
  if (!['signup', 'login'].includes(purpose)
    || typeof code !== 'string'
    || !/^[0-9]{6}$/.test(code)) {
    return response.status(400).json({ error: 'Enter a valid six-digit code and authentication purpose.' });
  }
  if (purpose === 'signup' && !ALLOWED_PARTICIPANT_ROLES.includes(role)) {
    return response.status(400).json({ error: 'Select a valid participant account.' });
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
  if ((account && account.status !== 'active')
    || (!account && purpose === 'login')
    || (purpose === 'login' && !ALLOWED_PARTICIPANT_ROLES.includes(account?.role))) {
    return response.status(401).json({ error: 'Unable to sign in with these account details.' });
  }

  const ok = await verifyOtp(contact, code, purpose);
  if (!ok) return response.status(401).json({ error: 'Invalid or expired code.' });
  if (purpose === 'signup' && account) {
    return response.status(409).json({ error: 'This account is already registered. Use Registered User Sign In.' });
  }

  const targetRole = purpose === 'login'
    ? account.role
    : (ALLOWED_PARTICIPANT_ROLES.includes(role) ? role : (account ? account.role : 'customer'));
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
  }
  if (!account || account.status !== 'active') {
    return response.status(401).json({ error: 'Unable to sign in with these account details.' });
  }
  if (purpose === 'signup') {
    response.set('Cache-Control', 'no-store').json({ registered: true });
    return;
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

router.get('/role-change/status', requireAuth, async (request, response) => {
  const result = await getPool().query(
    'SELECT role, status, role_changed_at FROM app_users WHERE id = $1',
    [request.user.accountId]
  );
  const account = result.rows[0];
  if (!account || account.status !== 'active') return response.status(401).json({ error: 'Sign in required.' });
  if (!ALLOWED_PARTICIPANT_ROLES.includes(account.role)) {
    return response.status(403).json({ error: 'Role changes are not available for this account.' });
  }
  response.set('Cache-Control', 'no-store').json({ role: account.role, ...getRoleChangeWindow(account.role_changed_at) });
});

router.post('/role-change/request', requireAuth, otpRequestLimiter, async (request, response) => {
  const { targetRole } = request.body || {};
  if (!ALLOWED_PARTICIPANT_ROLES.includes(targetRole)) {
    return response.status(400).json({ error: 'Select a valid participant role.' });
  }

  const result = await getPool().query(
    'SELECT role, status, email, profile_data, role_changed_at FROM app_users WHERE id = $1',
    [request.user.accountId]
  );
  const account = result.rows[0];
  if (!account || account.status !== 'active') return response.status(401).json({ error: 'Sign in required.' });
  if (!ALLOWED_PARTICIPANT_ROLES.includes(account.role)) {
    return response.status(403).json({ error: 'Role changes are not available for this account.' });
  }
  if (targetRole === account.role) return response.status(400).json({ error: 'Choose a different role.' });

  const window = getRoleChangeWindow(account.role_changed_at);
  if (!window.canChangeRole) {
    return response.status(429).json({ error: `You can change your role again after ${window.availableAt}.`, availableAt: window.availableAt });
  }

  const contact = getRoleChangeContact(account);
  if (!contact) return response.status(400).json({ error: 'No registered email or phone is available for OTP verification.' });

  const delivery = await requestOtpDelivery({ contact, purpose: roleChangePurpose(targetRole) });
  response.set('Cache-Control', 'no-store').json({
    status: delivery.status,
    expiresIn: delivery.expiresIn,
    retryAfter: delivery.retryAfter,
    ...(delivery.devCode ? { devCode: delivery.devCode } : {})
  });
});

router.post('/role-change/verify', requireAuth, async (request, response) => {
  const { targetRole, code } = request.body || {};
  if (!ALLOWED_PARTICIPANT_ROLES.includes(targetRole) || typeof code !== 'string' || !/^[0-9]{6}$/.test(code)) {
    return response.status(400).json({ error: 'Select a valid role and enter a six-digit code.' });
  }

  const pool = getPool();
  const accountResult = await pool.query(
    'SELECT role, status, email, profile_data, role_changed_at FROM app_users WHERE id = $1',
    [request.user.accountId]
  );
  const account = accountResult.rows[0];
  if (!account || account.status !== 'active') return response.status(401).json({ error: 'Sign in required.' });
  if (!ALLOWED_PARTICIPANT_ROLES.includes(account.role)) {
    return response.status(403).json({ error: 'Role changes are not available for this account.' });
  }
  if (targetRole === account.role) return response.status(400).json({ error: 'Choose a different role.' });

  const window = getRoleChangeWindow(account.role_changed_at);
  if (!window.canChangeRole) {
    return response.status(429).json({ error: `You can change your role again after ${window.availableAt}.`, availableAt: window.availableAt });
  }

  const contact = getRoleChangeContact(account);
  if (!contact) return response.status(400).json({ error: 'No registered email or phone is available for OTP verification.' });
  const verified = await verifyOtp(contact, code, roleChangePurpose(targetRole));
  if (!verified) return response.status(401).json({ error: 'Invalid or expired code.' });

  const updated = await pool.query(
    `UPDATE app_users
     SET role = $1,
         role_changed_at = NOW(),
         profile_data = COALESCE(profile_data, '{}'::jsonb) || $2::jsonb,
         updated_at = NOW()
     WHERE id = $3
       AND status = 'active'
       AND (role_changed_at IS NULL OR role_changed_at <= NOW() - INTERVAL '15 days')
     RETURNING id, role, status, public_id, profile_data, email, role_changed_at`,
    [targetRole, JSON.stringify({ participantRole: PARTICIPANT_ROLE_NAMES[targetRole] }), request.user.accountId]
  );

  if (!updated.rowCount) {
    const latest = await pool.query('SELECT role_changed_at FROM app_users WHERE id = $1', [request.user.accountId]);
    const latestWindow = getRoleChangeWindow(latest.rows[0]?.role_changed_at);
    if (latest.rows[0] && !latestWindow.canChangeRole) {
      return response.status(429).json({ error: `You can change your role again after ${latestWindow.availableAt}.`, availableAt: latestWindow.availableAt });
    }
    return response.status(409).json({ error: 'The role could not be changed. Refresh and try again.' });
  }

  const accountAfterChange = updated.rows[0];
  response.set('Cache-Control', 'no-store').json({
    accountId: accountAfterChange.id,
    role: accountAfterChange.role,
    status: accountAfterChange.status,
    publicId: accountAfterChange.public_id,
    profileData: accountAfterChange.profile_data,
    email: accountAfterChange.email,
    roleChangedAt: accountAfterChange.role_changed_at,
    availableAt: new Date(new Date(accountAfterChange.role_changed_at).getTime() + ROLE_CHANGE_COOLDOWN_MS).toISOString()
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
  const { fullName, company, participantRole } = request.body || {};
  const pool = getPool();
  const current = await pool.query('SELECT role, profile_data FROM app_users WHERE id = $1', [request.user.accountId]);
  if (current.rowCount === 0) return response.status(404).json({ error: 'User not found.' });

  const existingProfileData = current.rows[0].profile_data || {};
  const updatedProfileData = {
    ...existingProfileData,
    ...(typeof fullName === 'string' && fullName.trim() ? { fullName: fullName.trim() } : {}),
    ...(typeof company === 'string' && company.trim() ? { company: company.trim() } : {}),
    ...(typeof participantRole === 'string' && participantRole.trim() ? { participantRole: participantRole.trim() } : {})
  };

  const result = await pool.query(
    `UPDATE app_users
     SET profile_data = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, role, status, public_id, profile_data, email`,
    [JSON.stringify(updatedProfileData), request.user.accountId]
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
