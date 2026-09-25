import { randomInt, createHmac, timingSafeEqual } from 'node:crypto';
import { getPool } from '../db/pool.js';

function hashCode(code) {
  if (!process.env.OTP_HASH_SECRET || process.env.OTP_HASH_SECRET.length < 32) {
    throw Object.assign(new Error('OTP verification is not configured yet.'), { statusCode: 503 });
  }
  return createHmac('sha256', process.env.OTP_HASH_SECRET).update(code).digest('hex');
}

export async function issueOtp(contact, purpose = 'signup', destinations = [contact]) {
  const code = String(randomInt(100000, 1000000));
  const digest = hashCode(code);
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    // Sorted destination locks serialize overlapping requests across API workers.
    for (const destination of [...new Set(destinations)].sort()) {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [destination]);
      const recent = await client.query(
        `SELECT COUNT(*)::int AS total, MAX(created_at) > now() - interval '60 seconds' AS cooling_down
         FROM otp_codes WHERE $1 = ANY(destinations) AND created_at > now() - interval '1 hour'`, [destination]);
      if (recent.rows[0].cooling_down || recent.rows[0].total >= 5) {
        throw Object.assign(new Error('Too many OTP requests. Please wait before trying again.'), { statusCode: 429 });
      }
    }
    await client.query('UPDATE otp_codes SET consumed_at = now() WHERE lower(contact) = $1 AND consumed_at IS NULL', [contact]);
    const result = await client.query(
      `INSERT INTO otp_codes (contact, code_hash, purpose, expires_at, destinations)
       VALUES ($1, $2, $3, now() + interval '10 minutes', $4) RETURNING id`,
      [contact, digest, purpose, destinations]);
    await client.query('COMMIT');
    return { id: result.rows[0].id, code };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function acceptOtpDelivery(id) {
  const result = await getPool().query(
    'UPDATE otp_codes SET delivery_accepted_at = now() WHERE id = $1 AND consumed_at IS NULL RETURNING id', [id]);
  if (!result.rowCount) throw Object.assign(new Error('This code was superseded. Request a new code.'), { statusCode: 409 });
}

export async function revokeOtp(id) {
  await getPool().query('UPDATE otp_codes SET consumed_at = now() WHERE id = $1', [id]);
}

export async function verifyOtp(contact, code, purpose = 'signup') {
  const digest = hashCode(code);
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT id, code_hash, attempt_count FROM otp_codes
       WHERE lower(contact) = $1 AND purpose = $2 AND consumed_at IS NULL
         AND expires_at > now() AND delivery_accepted_at IS NOT NULL
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`, [contact, purpose]);
    const row = result.rows[0];
    let matches = false;
    if (row) {
      const stored = Buffer.from(row.code_hash, 'hex');
      const provided = Buffer.from(digest, 'hex');
      matches = row.attempt_count < 5 && stored.length === provided.length && timingSafeEqual(stored, provided);
      await client.query(
        `UPDATE otp_codes SET attempt_count = attempt_count + 1,
         consumed_at = CASE WHEN $2 OR attempt_count >= 4 THEN now() ELSE consumed_at END WHERE id = $1`, [row.id, matches]);
    }
    await client.query('COMMIT');
    return matches;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
