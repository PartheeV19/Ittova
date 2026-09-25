import { randomInt, createHash } from 'node:crypto';
import { getPool } from '../db/pool.js';

const OTP_TTL_MS = 1000 * 60 * 10; // 10 minutes
const MAX_ATTEMPTS = 5;

function hashCode(code) {
  return createHash('sha256').update(code).digest('hex');
}

// Generates and stores a 6-digit code. Returns the raw code so the caller
// can send it via email/SMS -- swap the console.log in the route for a
// real provider (SES, Twilio, etc.) when you're ready; nothing else changes.
export async function issueOtp(contact, purpose = 'signup') {
  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await getPool().query(
    `INSERT INTO otp_codes (contact, code_hash, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [contact.trim().toLowerCase(), hashCode(code), purpose, expiresAt]
  );

  return code;
}

// Returns true/false. Consumes the code (or burns an attempt) either way,
// so a code can't be replayed and can't be brute-forced past MAX_ATTEMPTS.
export async function verifyOtp(contact, code, purpose = 'signup') {
  const pool = getPool();
  const normalizedContact = contact.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, code_hash, attempt_count
     FROM otp_codes
     WHERE lower(contact) = $1 AND purpose = $2 AND consumed_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedContact, purpose]
  );

  if (result.rowCount === 0) return false;
  const row = result.rows[0];

  if (row.attempt_count >= MAX_ATTEMPTS) {
    await pool.query(`UPDATE otp_codes SET consumed_at = now() WHERE id = $1`, [row.id]);
    return false;
  }

  const matches = row.code_hash === hashCode(String(code));

  if (!matches) {
    await pool.query(`UPDATE otp_codes SET attempt_count = attempt_count + 1 WHERE id = $1`, [row.id]);
    return false;
  }

  await pool.query(`UPDATE otp_codes SET consumed_at = now() WHERE id = $1`, [row.id]);
  return true;
}
