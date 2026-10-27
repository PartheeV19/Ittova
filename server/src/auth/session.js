import { randomBytes, createHash } from 'node:crypto';
import { getPool } from '../db/pool.js';

export const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour of inactivity
export const SESSION_COOKIE_NAME = 'itova_session';

function hashToken(rawToken) {
  return createHash('sha256').update(rawToken).digest('hex');
}

// Creates a session row and returns the RAW token to set as a cookie.
// Only the hash is ever stored, so a DB read alone can't be used to log in.
export async function createSession(accountId) {
  const rawToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await getPool().query(
    `INSERT INTO sessions (account_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [accountId, hashToken(rawToken), expiresAt]
  );

  return { rawToken, expiresAt };
}

// Resolves a raw cookie token to the account it belongs to, or null.
// Also extends session expires_at (sliding inactivity window) on active requests.
export async function resolveSession(rawToken) {
  if (!rawToken) return null;

  const result = await getPool().query(
    `SELECT s.id, s.account_id, s.expires_at, u.role, u.status, u.public_id, u.profile_data, u.email
     FROM sessions s
     JOIN app_users u ON u.id = s.account_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(rawToken)]
  );

  if (result.rowCount === 0) return null;
  const row = result.rows[0];

  // Sliding inactivity window: extend session if more than 5 minutes have elapsed since last touch
  if (row.id && row.expires_at) {
    const remainingMs = new Date(row.expires_at).getTime() - Date.now();
    if (remainingMs < SESSION_TTL_MS - 5 * 60 * 1000) {
      const refreshedExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
      getPool().query(
        `UPDATE sessions SET expires_at = $1 WHERE id = $2`,
        [refreshedExpiresAt, row.id]
      ).catch(() => {});
    }
  }

  return {
    accountId: row.account_id,
    role: row.role,
    status: row.status,
    publicId: row.public_id,
    profileData: row.profile_data,
    email: row.email
  };
}

export async function revokeSession(rawToken) {
  if (!rawToken) return;
  await getPool().query(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(rawToken)]);
}

export function sessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    // 'none' is required for a cross-domain setup (Vercel frontend + a
    // separately hosted backend) -- it only works combined with Secure,
    // which requires HTTPS, hence the same isProduction check. Local dev
    // stays 'lax' since http://localhost can't set Secure cookies at all.
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/'
  };
}
