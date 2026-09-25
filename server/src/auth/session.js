import { randomBytes, createHash } from 'node:crypto';
import { getPool } from '../db/pool.js';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
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
export async function resolveSession(rawToken) {
  if (!rawToken) return null;

  const result = await getPool().query(
    `SELECT s.account_id, u.role, u.status
     FROM sessions s
     JOIN app_users u ON u.id = s.account_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(rawToken)]
  );

  if (result.rowCount === 0) return null;
  const row = result.rows[0];
  return { accountId: row.account_id, role: row.role, status: row.status };
}

export async function revokeSession(rawToken) {
  if (!rawToken) return;
  await getPool().query(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(rawToken)]);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/'
  };
}
